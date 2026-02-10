import { Document } from 'mongoose';
export declare class Stock {
    companyId: string;
    item: string;
    currentStock: number;
    backorder: number;
    lastUpdated: Date;
}
export type StockDocument = Stock & Document;
export declare const StockSchema: import("mongoose").Schema<Stock, import("mongoose").Model<Stock, any, any, any, Document<unknown, any, Stock, any, {}> & Stock & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Stock, Document<unknown, {}, import("mongoose").FlatRecord<Stock>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Stock> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
