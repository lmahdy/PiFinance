import { Model } from 'mongoose';
import { Stock, StockDocument } from './schemas/stock.schema';
import { PurchaseDocument } from '../purchases/schemas/purchase.schema';
import { SaleDocument } from '../sales/schemas/sale.schema';
import { AiInsightsService } from '../ai/ai-insights.service';
export declare class InventoryService {
    private stockModel;
    private purchaseModel;
    private saleModel;
    private aiInsightsService;
    constructor(stockModel: Model<StockDocument>, purchaseModel: Model<PurchaseDocument>, saleModel: Model<SaleDocument>, aiInsightsService: AiInsightsService);
    private isOverhead;
    recalculateStock(companyId: string): Promise<(import("mongodb").BulkWriteResult & {
        mongoose?: {
            validationErrors: import("mongoose").Error[];
        };
    }) | {
        updated: number;
    }>;
    getStock(companyId: string): Promise<(import("mongoose").Document<unknown, {}, StockDocument, {}, {}> & Stock & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getAlerts(companyId: string): Promise<any[]>;
}
