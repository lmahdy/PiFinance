import { Model } from 'mongoose';
import { SaleDocument } from './schemas/sale.schema';
import { ProductsService } from '../products/products.service';
import { MlRunnerService } from '../ml/ml-runner.service';
import { AiAgentService } from '../ai/ai-agent.service';
import { InventoryService } from '../inventory/inventory.service';
export declare class SalesService {
    private saleModel;
    private productsService;
    private mlRunner;
    private aiAgent;
    private inventoryService;
    private logger;
    constructor(saleModel: Model<SaleDocument>, productsService: ProductsService, mlRunner: MlRunnerService, aiAgent: AiAgentService, inventoryService: InventoryService);
    uploadSalesCsv(companyId: string, file: Express.Multer.File): Promise<{
        inserted: number;
    }>;
    revenueOverTime(companyId: string, interval?: 'day' | 'month'): Promise<any[]>;
    revenueByProduct(companyId: string): Promise<any[]>;
}
