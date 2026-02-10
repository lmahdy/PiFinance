import { Document } from 'mongoose';
export declare class AiInsight {
    companyId: string;
    module: string;
    payload: Record<string, any>;
    explanations?: Record<string, any>;
}
export type AiInsightDocument = AiInsight & Document;
export declare const AiInsightSchema: import("mongoose").Schema<AiInsight, import("mongoose").Model<AiInsight, any, any, any, Document<unknown, any, AiInsight, any, {}> & AiInsight & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AiInsight, Document<unknown, {}, import("mongoose").FlatRecord<AiInsight>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AiInsight> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
