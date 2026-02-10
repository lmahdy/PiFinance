import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    getStock(user: {
        companyId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/stock.schema").StockDocument, {}, {}> & import("./schemas/stock.schema").Stock & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getAlerts(user: {
        companyId: string;
    }): Promise<any[]>;
}
