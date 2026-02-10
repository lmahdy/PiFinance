import { SaleDocument } from '../sales/schemas/sale.schema';
import { PurchaseDocument } from '../purchases/schemas/purchase.schema';

export const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

export const isOverheadType = (type: string) => {
  const normalized = (type || '').toLowerCase();
  return ['overhead', 'expense', 'utility', 'rent', 'salary', 'service'].some((key) =>
    normalized.includes(key),
  );
};

export const calculateKpis = (
  sales: SaleDocument[],
  purchases: PurchaseDocument[],
  taxRate: number,
) => {
  const revenue = sum(sales.map((sale) => sale.total));

  const overheadCosts = sum(
    purchases.filter((purchase) => isOverheadType(purchase.type)).map((p) => p.totalCost),
  );

  const stockPurchases = purchases.filter((purchase) => !isOverheadType(purchase.type));
  const costMap = new Map<string, { totalCost: number; totalQty: number }>();
  for (const purchase of stockPurchases) {
    const item = purchase.item;
    const record = costMap.get(item) || { totalCost: 0, totalQty: 0 };
    record.totalCost += purchase.totalCost;
    record.totalQty += purchase.quantity;
    costMap.set(item, record);
  }

  let cogs = 0;
  for (const sale of sales) {
    const record = costMap.get(sale.product);
    const avgCost = record && record.totalQty > 0 ? record.totalCost / record.totalQty : 0;
    cogs += avgCost * sale.quantity;
  }

  const costs = cogs + overheadCosts;
  const profit = revenue - costs;
  const taxes = profit > 0 ? profit * (taxRate / 100) : 0;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    revenue,
    cogs,
    overheadCosts,
    costs,
    profit,
    taxes,
    profitMargin,
  };
};

export const calculateRevenueGrowth = (sales: SaleDocument[]) => {
  if (sales.length === 0) {
    return 0;
  }

  const sorted = [...sales].sort((a, b) => a.date.getTime() - b.date.getTime());
  const endDate = sorted[sorted.length - 1].date;
  const startWindow = new Date(endDate);
  startWindow.setDate(startWindow.getDate() - 30);

  const prevWindowStart = new Date(startWindow);
  prevWindowStart.setDate(prevWindowStart.getDate() - 30);

  let current = 0;
  let previous = 0;

  for (const sale of sorted) {
    if (sale.date >= startWindow) {
      current += sale.total;
    } else if (sale.date >= prevWindowStart && sale.date < startWindow) {
      previous += sale.total;
    }
  }

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

export const calculateSalesVolatility = (sales: SaleDocument[]) => {
  if (sales.length === 0) {
    return 0;
  }

  const daily = new Map<string, number>();
  for (const sale of sales) {
    const key = sale.date.toISOString().slice(0, 10);
    daily.set(key, (daily.get(key) || 0) + sale.total);
  }

  const values = Array.from(daily.values());
  const mean = sum(values) / values.length;
  if (mean === 0) {
    return 0;
  }

  const variance = sum(values.map((value) => Math.pow(value - mean, 2))) / values.length;
  const stdDev = Math.sqrt(variance);

  return (stdDev / mean) * 100;
};
