import { Document } from 'mongoose';
export declare class Sale {
    companyId: string;
    date: Date;
    client: string;
    product: string;
    category: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
export type SaleDocument = Sale & Document;
export declare const SaleSchema: import("mongoose").Schema<Sale, import("mongoose").Model<Sale, any, any, any, Document<unknown, any, Sale, any, {}> & Sale & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Sale, Document<unknown, {}, import("mongoose").FlatRecord<Sale>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Sale> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
