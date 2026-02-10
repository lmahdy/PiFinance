import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { CompanyConfig, CompanyConfigDocument } from '../company/schemas/company-config.schema';
import { Sale, SaleDocument } from '../sales/schemas/sale.schema';
import { Purchase, PurchaseDocument } from '../purchases/schemas/purchase.schema';
import { AiInsightsService } from './ai-insights.service';
import {
  calculateKpis,
  calculateRevenueGrowth,
  calculateSalesVolatility,
} from '../report/report.utils';

@Injectable()
export class AiAgentService {
  private logger = new Logger(AiAgentService.name);

  constructor(
    @InjectModel(CompanyConfig.name) private companyModel: Model<CompanyConfigDocument>,
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    private aiInsightsService: AiInsightsService,
  ) {}

  private createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private formatCurrency(value: number, currency: string) {
    return `${currency} ${value.toFixed(2)}`;
  }

  private async shouldSendForReason(companyId: string, reason: string) {
    if (reason === 'report-check') {
      const insights = await this.aiInsightsService.getInsights(companyId, 'report');
      if (insights.length < 2) {
        return true;
      }
      const [latest, previous] = insights;
      return latest?.payload?.status !== previous?.payload?.status;
    }

    return true;
  }

  async sendSummaryIfNeeded(companyId: string, reason: string) {
    const config = await this.companyModel.findOne({ companyId }).exec();
    if (!config?.email) {
      this.logger.warn('Company config missing email, skipping AI agent email.');
      return { sent: false, reason: 'missing-email' };
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('SMTP not configured; skipping AI agent email.');
      return { sent: false, reason: 'smtp-not-configured' };
    }

    const shouldSend = await this.shouldSendForReason(companyId, reason);
    if (!shouldSend) {
      return { sent: false, reason: 'no-change' };
    }

    const [sales, purchases, salesInsight, inventoryInsight, reportInsight] = await Promise.all([
      this.saleModel.find({ companyId }).exec(),
      this.purchaseModel.find({ companyId }).exec(),
      this.aiInsightsService.getLatestInsight(companyId, 'sales'),
      this.aiInsightsService.getLatestInsight(companyId, 'inventory'),
      this.aiInsightsService.getLatestInsight(companyId, 'report'),
    ]);

    const kpis = calculateKpis(sales, purchases, config.taxRate);
    const revenueGrowth = calculateRevenueGrowth(sales);
    const salesVolatility = calculateSalesVolatility(sales);

    const bestProduct = salesInsight?.payload?.best_product || 'N/A';
    const worstProduct = salesInsight?.payload?.worst_product || 'N/A';

    const inventoryRisk = inventoryInsight?.payload?.risk_level || 'Unknown';
    const inventoryItem = inventoryInsight?.payload?.item || 'N/A';
    const reorderQty = inventoryInsight?.payload?.recommended_reorder ?? 'N/A';

    const healthScore = reportInsight?.payload?.health_score ?? 'N/A';
    const healthStatus = reportInsight?.payload?.status || 'Unknown';
    const healthReason = reportInsight?.payload?.main_reason || 'No reason available.';

    const subject = `BI Summary for ${config.companyName} (${new Date().toLocaleDateString()})`;

    const text = [
      `Hello ${config.companyName} team,`,
      '',
      `Here is your latest BI summary (trigger: ${reason}):`,
      '',
      `Revenue: ${this.formatCurrency(kpis.revenue, config.currency)}`,
      `Costs: ${this.formatCurrency(kpis.costs, config.currency)}`,
      `Profit: ${this.formatCurrency(kpis.profit, config.currency)}`,
      `Taxes (est.): ${this.formatCurrency(kpis.taxes, config.currency)}`,
      `Revenue Growth (30d): ${revenueGrowth.toFixed(2)}%`,
      `Sales Volatility: ${salesVolatility.toFixed(2)}%`,
      '',
      `Best Product: ${bestProduct}`,
      `Worst Product: ${worstProduct}`,
      '',
      `Inventory Risk: ${inventoryRisk} (${inventoryItem})`,
      `Recommended Reorder Quantity: ${reorderQty}`,
      '',
      `Health Score: ${healthScore} (${healthStatus})`,
      `Main Reason: ${healthReason}`,
      '',
      'Recommended Actions:',
      `- Review inventory for ${inventoryItem} and reorder if needed.`,
      `- Promote ${bestProduct} and re-evaluate ${worstProduct}.`,
      `- Track profit margin and keep costs below revenue growth pace.`,
      '',
      'Regards,',
      'BI Assistant',
    ].join('\n');

    try {
      const transporter = this.createTransporter();
      await transporter.sendMail({
        from: process.env.SMTP_FROM || config.email,
        to: config.email,
        subject,
        text,
      });
      return { sent: true };
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return { sent: false, reason: 'smtp-error' };
    }
  }
}
