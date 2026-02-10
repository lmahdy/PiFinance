import argparse
import os
from datetime import datetime, timedelta
from urllib.parse import urlparse

import numpy as np
import pandas as pd
from pymongo import MongoClient
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

OVERHEAD_KEYWORDS = ['overhead', 'expense', 'utility', 'rent', 'salary', 'service']


def get_database():
    uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/bi_platform')
    db_name = os.getenv('MONGO_DB')
    if not db_name:
        parsed = urlparse(uri)
        if parsed.path and len(parsed.path) > 1:
            db_name = parsed.path[1:]
        else:
            db_name = 'bi_platform'
    client = MongoClient(uri)
    return client[db_name]


def is_overhead(value) -> bool:
    if value is None:
        return False
    if not isinstance(value, str):
        value = str(value)
    if not value:
        return False
    lowered = value.lower()
    return any(key in lowered for key in OVERHEAD_KEYWORDS)


def load_collection(db, name, company_id):
    return list(db[name].find({'companyId': company_id}))


def compute_sales_insight(db, company_id):
    sales = load_collection(db, 'sales', company_id)
    if not sales:
        return None

    df = pd.DataFrame(sales)
    df['date'] = pd.to_datetime(df['date'])

    features = []
    for product, group in df.groupby('product'):
        revenue = group['total'].sum()
        quantity = group['quantity'].sum()
        frequency = len(group)

        daily = group.set_index('date').resample('D')['total'].sum().reset_index()
        if len(daily) > 1:
            X = np.arange(len(daily)).reshape(-1, 1)
            y = daily['total'].values
            lr = LinearRegression().fit(X, y)
            trend = float(lr.coef_[0])
        else:
            trend = 0.0

        features.append({
            'product': product,
            'revenue': revenue,
            'quantity': quantity,
            'frequency': frequency,
            'trend': trend,
        })

    feat_df = pd.DataFrame(features)
    scaler = StandardScaler()
    scaled = scaler.fit_transform(feat_df[['revenue', 'quantity', 'frequency', 'trend']])

    centroids = None
    if len(feat_df) >= 2:
        k = 3 if len(feat_df) >= 3 else 2
        kmeans = KMeans(n_clusters=k, random_state=42, n_init='auto')
        labels = kmeans.fit_predict(scaled)
        feat_df['cluster'] = labels
        centroids = scaler.inverse_transform(kmeans.cluster_centers_)
    else:
        feat_df['cluster'] = 0

    # Normalized features for explainable scoring.
    feat_df['rev_norm'] = feat_df['revenue'] / (feat_df['revenue'].max() or 1)
    feat_df['qty_norm'] = feat_df['quantity'] / (feat_df['quantity'].max() or 1)
    feat_df['freq_norm'] = feat_df['frequency'] / (feat_df['frequency'].max() or 1)

    # Business-weighted score (used for explanations, not overriding revenue ranking).
    feat_df['score'] = (
        feat_df['rev_norm'] * 0.7
        + feat_df['qty_norm'] * 0.2
        + feat_df['freq_norm'] * 0.1
    )

    best_row = feat_df.sort_values('revenue', ascending=False).iloc[0]
    worst_row = feat_df.sort_values('revenue', ascending=True).iloc[0]

    payload = {
        'module': 'sales',
        'best_product': best_row['product'],
        'worst_product': worst_row['product'],
    }

    explanations = {
        'features': feat_df.to_dict(orient='records'),
        'method': 'KMeans clustering + weighted score (best/worst selected by revenue)',
        'weights': {'revenue': 0.7, 'quantity': 0.2, 'frequency': 0.1},
        'centroids': (
            [
                {
                    'revenue': round(float(center[0]), 2),
                    'quantity': round(float(center[1]), 2),
                    'frequency': round(float(center[2]), 2),
                    'trend': round(float(center[3]), 4),
                }
                for center in centroids
            ]
            if centroids is not None
            else []
        ),
    }

    return payload, explanations


def compute_inventory_predictions(sales_df, purchases_df):
    predictions = []

    # Ensure required columns exist even if the DataFrame is empty or schema is missing.
    for col, default in [('item', ''), ('type', ''), ('quantity', 0)]:
        if col not in purchases_df.columns:
            purchases_df[col] = default
    for col, default in [('product', ''), ('quantity', 0)]:
        if col not in sales_df.columns:
            sales_df[col] = default

    purchase_map = (
        purchases_df[~purchases_df['type'].apply(is_overhead)]
        .groupby('item')['quantity']
        .sum()
        .to_dict()
    )

    sales_map = sales_df.groupby('product')['quantity'].sum().to_dict()

    items = set(purchase_map.keys()) | set(sales_map.keys())

    lead_time_days = 7
    safety_stock_days = 3
    target_days = lead_time_days + safety_stock_days

    for item in items:
        purchased = purchase_map.get(item, 0)
        sold = sales_map.get(item, 0)
        current_stock = max(purchased - sold, 0)

        item_sales = sales_df[sales_df['product'] == item]
        historic_avg = 0
        forecast_daily = 0
        forecast_model = 'AverageDaily'
        forecast_coef = None
        forecast_intercept = None
        forecast_r2 = None

        if not item_sales.empty:
            daily = (
                item_sales.set_index('date')
                .resample('D')['quantity']
                .sum()
                .reset_index()
            )
            if len(daily) > 0:
                historic_avg = float(daily['quantity'].mean())
                daily['day_index'] = (daily['date'] - daily['date'].min()).dt.days

                # Use linear regression forecasting when enough data exists.
                if len(daily) >= 3 and daily['quantity'].sum() > 0:
                    X = daily['day_index'].to_numpy().reshape(-1, 1)
                    y = daily['quantity'].to_numpy()
                    model = LinearRegression()
                    model.fit(X, y)
                    r2 = model.score(X, y) if len(daily) > 1 else 0

                    last_index = int(daily['day_index'].iloc[-1])
                    future_idx = np.arange(last_index + 1, last_index + target_days + 1).reshape(-1, 1)
                    preds = model.predict(future_idx)
                    preds = np.clip(preds, 0, None)

                    forecast_daily = float(np.mean(preds)) if len(preds) else historic_avg
                    if forecast_daily <= 0 and historic_avg > 0:
                        forecast_daily = historic_avg

                    forecast_model = 'LinearRegression'
                    forecast_coef = float(model.coef_[0])
                    forecast_intercept = float(model.intercept_)
                    forecast_r2 = float(r2)
                else:
                    forecast_daily = historic_avg
            else:
                forecast_daily = 0
        else:
            forecast_daily = 0

        historic_avg = max(float(historic_avg), 0)
        forecast_daily = max(float(forecast_daily), 0)
        daily_use = forecast_daily if forecast_daily > 0 else historic_avg
        predicted_stockout_days = current_stock / daily_use if daily_use > 0 else 999

        # Temporary risk placeholder; final risk set after distribution analysis.
        risk = 'Low'

        recommended_reorder = (
            max(int(np.ceil(target_days * daily_use - current_stock)), 0) if daily_use > 0 else 0
        )

        predictions.append({
            'item': item,
            'current_stock': int(current_stock),
            'avg_daily_sales': round(float(historic_avg), 2),
            'forecast_daily_sales': round(float(daily_use), 2),
            'forecast_model': forecast_model,
            'forecast_coef': None if forecast_coef is None else round(forecast_coef, 4),
            'forecast_intercept': None if forecast_intercept is None else round(forecast_intercept, 4),
            'forecast_r2': None if forecast_r2 is None else round(forecast_r2, 4),
            'predicted_stockout_days': round(float(predicted_stockout_days), 2),
            'recommended_reorder': recommended_reorder,
            'risk_level': risk,
            'lead_time_days': lead_time_days,
            'safety_stock_days': safety_stock_days,
        })

    if not predictions:
        return predictions

    days = [item['predicted_stockout_days'] for item in predictions]
    risk_q33 = None
    risk_q66 = None
    if len(days) >= 3:
        risk_q33 = float(np.quantile(days, 0.33))
        risk_q66 = float(np.quantile(days, 0.66))
        for item in predictions:
            if item['predicted_stockout_days'] <= risk_q33:
                item['risk_level'] = 'High'
            elif item['predicted_stockout_days'] <= risk_q66:
                item['risk_level'] = 'Medium'
            else:
                item['risk_level'] = 'Low'
    else:
        for item in predictions:
            if item['predicted_stockout_days'] <= item['lead_time_days']:
                item['risk_level'] = 'High'
            elif item['predicted_stockout_days'] <= item['lead_time_days'] + item['safety_stock_days']:
                item['risk_level'] = 'Medium'
            else:
                item['risk_level'] = 'Low'

    for item in predictions:
        if risk_q33 is not None:
            item['risk_q33'] = round(risk_q33, 2)
            item['risk_q66'] = round(risk_q66, 2)

    return predictions


def compute_inventory_insight(db, company_id):
    sales = load_collection(db, 'sales', company_id)
    purchases = load_collection(db, 'purchases', company_id)

    if not sales and not purchases:
        return None

    sales_df = pd.DataFrame(sales)
    purchases_df = pd.DataFrame(purchases)

    if not sales_df.empty:
        sales_df['date'] = pd.to_datetime(sales_df['date'])
    if not purchases_df.empty:
        purchases_df['date'] = pd.to_datetime(purchases_df['date'])

    predictions = compute_inventory_predictions(
        sales_df if not sales_df.empty else pd.DataFrame(columns=['product', 'quantity', 'date']),
        purchases_df if not purchases_df.empty else pd.DataFrame(columns=['item', 'quantity', 'type', 'date']),
    )

    if not predictions:
        return None

    top_risk = sorted(predictions, key=lambda x: x['predicted_stockout_days'])[0]

    model_label = top_risk.get('forecast_model', 'AverageDaily')
    r2_value = top_risk.get('forecast_r2')
    r2_text = f" (R² {r2_value})" if r2_value is not None else ""
    explanation_text = (
        f"Forecast uses {model_label}{r2_text} with daily demand "
        f"{top_risk.get('forecast_daily_sales', top_risk['avg_daily_sales'])}. "
        f"Historic avg is {top_risk['avg_daily_sales']}. "
        f"Stock covers about {top_risk['predicted_stockout_days']} days. "
        f"Lead time {top_risk['lead_time_days']}d + safety {top_risk['safety_stock_days']}d."
    )

    payload = {
        'module': 'inventory',
        'item': top_risk['item'],
        'current_stock': top_risk['current_stock'],
        'avg_daily_sales': top_risk['avg_daily_sales'],
        'forecast_daily_sales': top_risk.get('forecast_daily_sales'),
        'forecast_model': top_risk.get('forecast_model'),
        'forecast_coef': top_risk.get('forecast_coef'),
        'forecast_intercept': top_risk.get('forecast_intercept'),
        'forecast_r2': top_risk.get('forecast_r2'),
        'predicted_stockout_days': top_risk['predicted_stockout_days'],
        'recommended_reorder': top_risk['recommended_reorder'],
        'risk_level': top_risk['risk_level'],
        'lead_time_days': top_risk['lead_time_days'],
        'safety_stock_days': top_risk['safety_stock_days'],
        'explanation': explanation_text,
    }

    explanations = {
        'items': predictions,
        'method': 'LinearRegression forecast on daily sales (fallback to historical average)',
        'risk_method': 'Quantile-based risk tiers (or lead-time fallback for small samples)',
        'notes': 'predicted_stockout_days = current_stock / forecast_daily_sales',
    }

    return payload, explanations


def compute_report_insight(db, company_id):
    sales = load_collection(db, 'sales', company_id)
    purchases = load_collection(db, 'purchases', company_id)
    config = db['company_config'].find_one({'companyId': company_id})

    if not sales:
        return None

    sales_df = pd.DataFrame(sales)
    purchases_df = pd.DataFrame(purchases)
    sales_df['date'] = pd.to_datetime(sales_df['date'])
    if not purchases_df.empty:
        purchases_df['date'] = pd.to_datetime(purchases_df['date'])

    tax_rate = config.get('taxRate', 0) if config else 0

    sales_df['month'] = sales_df['date'].dt.to_period('M')
    purchases_df['month'] = purchases_df['date'].dt.to_period('M') if not purchases_df.empty else None

    monthly_revenue = sales_df.groupby('month')['total'].sum()

    # Compute average cost per item from stock purchases.
    if not purchases_df.empty:
        stock_purchases = purchases_df[~purchases_df['type'].apply(is_overhead)]
        if not stock_purchases.empty:
            cost_map = (
                stock_purchases.groupby('item')[['totalCost', 'quantity']]
                .sum()
                .assign(avg_cost=lambda df: df['totalCost'] / df['quantity'])
                ['avg_cost']
                .to_dict()
            )
        else:
            cost_map = {}
    else:
        cost_map = {}

    sales_df['avg_cost'] = sales_df['product'].map(cost_map).fillna(0)
    sales_df['cogs'] = sales_df['avg_cost'] * sales_df['quantity']
    monthly_cogs = sales_df.groupby('month')['cogs'].sum()

    overhead_df = purchases_df[purchases_df['type'].apply(is_overhead)] if not purchases_df.empty else pd.DataFrame()
    monthly_overhead = (
        overhead_df.groupby('month')['totalCost'].sum()
        if not overhead_df.empty else pd.Series(dtype=float)
    )

    monthly_costs = monthly_cogs.add(monthly_overhead, fill_value=0)

    total_revenue = sales_df['total'].sum()
    total_cogs = sales_df['cogs'].sum()
    total_overhead = overhead_df['totalCost'].sum() if not overhead_df.empty else 0
    total_costs = total_cogs + total_overhead
    overall_profit = total_revenue - total_costs
    overall_profit_margin = (overall_profit / total_revenue * 100) if total_revenue > 0 else 0

    months = monthly_revenue.index.union(monthly_costs.index)
    rows = []

    for month in months:
        revenue = monthly_revenue.get(month, 0)
        costs = monthly_costs.get(month, 0)
        profit = revenue - costs
        profit_margin = (profit / revenue * 100) if revenue > 0 else 0
        rows.append({
            'month': str(month),
            'revenue': revenue,
            'costs': costs,
            'profit_margin': profit_margin,
        })

    kpi_df = pd.DataFrame(rows)
    if kpi_df.empty:
        return None

    # Growth and volatility
    kpi_df['revenue_growth'] = kpi_df['revenue'].pct_change().fillna(0) * 100
    daily_revenue = sales_df.set_index('date').resample('D')['total'].sum()
    volatility = (
        daily_revenue.std() / daily_revenue.mean() * 100
        if daily_revenue.mean() else 0
    )

    # Inventory risk count from current predictions
    inventory_prediction = compute_inventory_predictions(
        sales_df,
        purchases_df if not purchases_df.empty else pd.DataFrame(columns=['item', 'quantity', 'type', 'date']),
    )
    risk_count = sum(1 for item in inventory_prediction if item['risk_level'] != 'Low')

    kpi_df['sales_volatility'] = volatility
    kpi_df['inventory_risk_count'] = risk_count

    features = kpi_df[['profit_margin', 'revenue_growth', 'sales_volatility', 'inventory_risk_count']].values

    report_centroids = None
    if len(kpi_df) >= 3:
        scaler = StandardScaler()
        scaled = scaler.fit_transform(features)
        kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
        clusters = kmeans.fit_predict(scaled)
        kpi_df['cluster'] = clusters
        report_centroids = scaler.inverse_transform(kmeans.cluster_centers_)
    else:
        kpi_df['cluster'] = 0

    # Score based on overall profitability + latest period dynamics
    current = kpi_df.iloc[-1]
    pm = overall_profit_margin
    rg = current['revenue_growth']
    sv = current['sales_volatility']
    ir = current['inventory_risk_count']

    # Sub-scores (0-100)
    financial_score = np.clip((pm + 20) / 50, 0, 1) * 100  # -20% => 0, +30% => 100
    growth_score = np.clip((rg + 20) / 40, 0, 1) * 100     # -20% => 0, +20% => 100
    volatility_score = np.clip(1 - (sv / 100), 0, 1) * 100
    inventory_score = np.clip(1 - (ir / 5), 0, 1) * 100

    base_score = (
        financial_score * 0.45
        + growth_score * 0.2
        + volatility_score * 0.2
        + inventory_score * 0.15
    )

    score = base_score
    penalty_reason = None
    if pm < 0:
        # Loss-making companies cannot be "healthy".
        score = min(base_score, 35)
        status = 'At Risk'
        penalty_reason = 'Negative profit margin'
    else:
        if score >= 70 and rg >= 0:
            status = 'Healthy'
        elif score >= 45:
            status = 'Watch'
        else:
            status = 'At Risk'

    if pm < 0:
        main_reason = 'Negative overall profit margin is hurting financial health'
    elif rg < 0:
        main_reason = 'Revenue growth is negative'
    elif sv > 60:
        main_reason = 'High sales volatility'
    elif ir > 0:
        main_reason = 'Inventory risk detected'
    else:
        main_reason = 'Positive margin with stable operations'

    payload = {
        'module': 'report',
        'health_score': int(round(score)),
        'status': status,
        'main_reason': main_reason,
    }

    explanations = {
        'features': kpi_df.to_dict(orient='records'),
        'method': 'KMeans clustering + weighted scoring',
        'tax_rate': tax_rate,
        'config_missing': config is None,
        'overall_cogs': round(float(total_cogs), 2),
        'overall_overhead': round(float(total_overhead), 2),
        'overall_profit_margin': round(float(overall_profit_margin), 2),
        'overall_profit': round(float(overall_profit), 2),
        'overall_revenue': round(float(total_revenue), 2),
        'overall_costs': round(float(total_costs), 2),
        'base_score': round(float(base_score), 2),
        'adjusted_score': round(float(score), 2),
        'penalty_reason': penalty_reason,
        'sub_scores': {
            'financial_score': round(float(financial_score), 2),
            'growth_score': round(float(growth_score), 2),
            'volatility_score': round(float(volatility_score), 2),
            'inventory_score': round(float(inventory_score), 2),
        },
        'centroids': (
            [
                {
                    'profit_margin': round(float(center[0]), 2),
                    'revenue_growth': round(float(center[1]), 2),
                    'sales_volatility': round(float(center[2]), 2),
                    'inventory_risk_count': round(float(center[3]), 2),
                }
                for center in report_centroids
            ]
            if report_centroids is not None
            else []
        ),
    }

    return payload, explanations


def write_insight(db, company_id, module, payload, explanations):
    # Keep only the latest insight per module to avoid stale reads.
    db['ai_insights'].delete_many({'companyId': company_id, 'module': module})
    record = {
        'companyId': company_id,
        'module': module,
        'payload': payload,
        'explanations': explanations,
        'createdAt': datetime.utcnow(),
    }
    db['ai_insights'].insert_one(record)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--module', required=True, choices=['sales', 'inventory', 'report', 'all'])
    parser.add_argument('--company-id', required=True)
    args = parser.parse_args()

    db = get_database()
    company_id = args.company_id

    if args.module in ('sales', 'all'):
        result = compute_sales_insight(db, company_id)
        if result:
            payload, explanations = result
            write_insight(db, company_id, 'sales', payload, explanations)

    if args.module in ('inventory', 'all'):
        result = compute_inventory_insight(db, company_id)
        if result:
            payload, explanations = result
            write_insight(db, company_id, 'inventory', payload, explanations)

    if args.module in ('report', 'all'):
        result = compute_report_insight(db, company_id)
        if result:
            payload, explanations = result
            write_insight(db, company_id, 'report', payload, explanations)


if __name__ == '__main__':
    main()
