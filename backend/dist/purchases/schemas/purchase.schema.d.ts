import { Document } from 'mongoose';
export declare class Purchase {
    companyId: string;
    date: Date;
    supplier: string;
    item: string;
    type: string;
    quantity: number;
    costPrice: number;
    totalCost: number;
}
export type PurchaseDocument = Purchase & Document;
export declare const PurchaseSchema: import("mongoose").Schema<Purchase, import("mongoose").Model<Purchase, any, any, any, Document<unknown, any, Purchase, any, {}> & Purchase & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Purchase, Document<unknown, {}, import("mongoose").FlatRecord<Purchase>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Purchase> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
