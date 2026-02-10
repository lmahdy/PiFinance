import { Model } from 'mongoose';
import { CompanyConfigDocument } from '../company/schemas/company-config.schema';
import { SaleDocument } from '../sales/schemas/sale.schema';
import { PurchaseDocument } from '../purchases/schemas/purchase.schema';
export declare class ReportService {
    private companyModel;
    private saleModel;
    private purchaseModel;
    constructor(companyModel: Model<CompanyConfigDocument>, saleModel: Model<SaleDocument>, purchaseModel: Model<PurchaseDocument>);
    getKpis(companyId: string): Promise<{
        currency: string;
        revenue: number;
        costs: number;
        overheadCosts: number;
        stockCosts: number;
        profit: number;
        taxes: number;
        profitMargin: number;
        revenueGrowth: number;
        salesVolatility: number;
        configMissing: boolean;
    }>;
}
