import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyConfig, CompanyConfigDocument } from '../company/schemas/company-config.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Purchase, PurchaseDocument } from '../purchases/schemas/purchase.schema';
import { calculateKpis, calculateRevenueGrowth, calculateSalesVolatility } from './report.utils';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(CompanyConfig.name) private companyModel: Model<CompanyConfigDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
  ) {}

  async getKpis(companyId: string) {
    const config = await this.companyModel.findOne({ companyId }).exec();
    const configMissing = !config;
    const companyConfig = {
      companyId,
      companyName: config?.companyName || 'Unknown Company',
      taxRate: config?.taxRate ?? 0,
      currency: config?.currency || 'USD',
      email: config?.email || '',
    };

    const [sales, purchases] = await Promise.all([
      this.saleModel.find({ companyId }).exec(),
      this.purchaseModel.find({ companyId }).exec(),
    ]);

    const kpis = calculateKpis(sales, purchases, companyConfig.taxRate);

    const revenueGrowth = calculateRevenueGrowth(sales);
    const salesVolatility = calculateSalesVolatility(sales);

    return {
      currency: companyConfig.currency,
      revenue: kpis.revenue,
      costs: kpis.costs,
      overheadCosts: kpis.overheadCosts,
      stockCosts: kpis.cogs,
      profit: kpis.profit,
      taxes: kpis.taxes,
      profitMargin: kpis.profitMargin,
      revenueGrowth,
      salesVolatility,
      configMissing,
    };
  }
}
