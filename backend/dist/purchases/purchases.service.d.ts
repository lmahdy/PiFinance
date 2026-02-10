import { Model } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { MlRunnerService } from '../ml/ml-runner.service';
import { AiAgentService } from '../ai/ai-agent.service';
export declare class PurchasesService {
    private purchaseModel;
    private productsService;
    private inventoryService;
    private mlRunner;
    private aiAgent;
    private logger;
    constructor(purchaseModel: Model<PurchaseDocument>, productsService: ProductsService, inventoryService: InventoryService, mlRunner: MlRunnerService, aiAgent: AiAgentService);
    private computeTotalCost;
    uploadPurchasesCsv(companyId: string, file: Express.Multer.File): Promise<{
        inserted: number;
    }>;
    listPurchases(companyId: string): Promise<(import("mongoose").Document<unknown, {}, PurchaseDocument, {}, {}> & Purchase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
