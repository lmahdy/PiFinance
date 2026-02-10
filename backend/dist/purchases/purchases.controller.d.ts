import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private purchasesService;
    constructor(purchasesService: PurchasesService);
    uploadPurchases(file: Express.Multer.File, user: {
        companyId: string;
    }): Promise<{
        inserted: number;
    }>;
    listPurchases(user: {
        companyId: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/purchase.schema").PurchaseDocument, {}, {}> & import("./schemas/purchase.schema").Purchase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
