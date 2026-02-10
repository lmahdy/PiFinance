import { Model } from 'mongoose';
import { CompanyConfigDocument } from '../company/schemas/company-config.schema';
import { SaleDocument } from '../sales/schemas/sale.schema';
import { PurchaseDocument } from '../purchases/schemas/purchase.schema';
import { AiInsightsService } from './ai-insights.service';
export declare class AiAgentService {
    private companyModel;
    private saleModel;
    private purchaseModel;
    private aiInsightsService;
    private logger;
    constructor(companyModel: Model<CompanyConfigDocument>, saleModel: Model<SaleDocument>, purchaseModel: Model<PurchaseDocument>, aiInsightsService: AiInsightsService);
    private createTransporter;
    private formatCurrency;
    private shouldSendForReason;
    sendSummaryIfNeeded(companyId: string, reason: string): Promise<{
        sent: boolean;
        reason: string;
    } | {
        sent: boolean;
        reason?: undefined;
    }>;
}
