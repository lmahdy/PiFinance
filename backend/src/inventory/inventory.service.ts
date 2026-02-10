import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument } from './schemas/stock.schema';
import { Purchase, PurchaseDocument } from '../purchases/schemas/purchase.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { AiInsightsService } from '../ai/ai-insights.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private aiInsightsService: AiInsightsService,
  ) {}

  private isOverhead(type: string) {
    const normalized = (type || '').toLowerCase();
    return ['overhead', 'expense', 'utility', 'rent', 'salary', 'service'].some((key) =>
      normalized.includes(key),
    );
  }

  async recalculateStock(companyId: string) {
    const purchases = await this.purchaseModel.find({ companyId }).exec();
    const sales = await this.saleModel.find({ companyId }).exec();

    const purchaseMap = new Map<string, number>();
    for (const purchase of purchases) {
      if (this.isOverhead(purchase.type)) {
        continue;
      }
      purchaseMap.set(purchase.item, (purchaseMap.get(purchase.item) || 0) + purchase.quantity);
    }

    const salesMap = new Map<string, number>();
    for (const sale of sales) {
      salesMap.set(sale.product, (salesMap.get(sale.product) || 0) + sale.quantity);
    }

    const items = new Set<string>([...purchaseMap.keys(), ...salesMap.keys()]);
    const now = new Date();

    const ops = Array.from(items).map((item) => {
      const purchased = purchaseMap.get(item) || 0;
      const sold = salesMap.get(item) || 0;
      const rawStock = purchased - sold;
      const currentStock = Math.max(rawStock, 0);
      const backorder = Math.max(sold - purchased, 0);
      return {
        updateOne: {
          filter: { companyId, item },
          update: {
            $set: { companyId, item, currentStock, backorder, lastUpdated: now },
          },
          upsert: true,
        },
      };
    });

    if (ops.length === 0) {
      return { updated: 0 };
    }

    return this.stockModel.bulkWrite(ops, { ordered: false });
  }

  async getStock(companyId: string) {
    return this.stockModel.find({ companyId }).sort({ item: 1 }).exec();
  }

  async getAlerts(companyId: string) {
    const latest = await this.aiInsightsService.getLatestInsight(companyId, 'inventory');
    if (!latest) {
      const backorders = await this.stockModel.find({ companyId, backorder: { $gt: 0 } }).exec();
      return backorders.map((row) => ({
        item: row.item,
        risk_level: 'High',
        predicted_stockout_days: 0,
        recommended_reorder: 0,
      }));
    }

    const payload = latest.payload || {};
    const explanationItems = (latest.explanations as any)?.items;
    if (Array.isArray(payload.items)) {
      return payload.items.filter((item) => item.risk_level === 'High');
    }
    if (Array.isArray(explanationItems)) {
      return explanationItems.filter((item) => item.risk_level === 'High');
    }

    if (payload.risk_level === 'High') {
      return [payload];
    }

    return [];
  }
}
