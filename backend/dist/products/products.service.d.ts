import { Model } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
export declare class ProductsService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    upsertProducts(companyId: string, products: {
        name: string;
        category?: string;
    }[]): Promise<(import("mongodb").BulkWriteResult & {
        mongoose?: {
            validationErrors: import("mongoose").Error[];
        };
    }) | {
        upserted: number;
    }>;
}
