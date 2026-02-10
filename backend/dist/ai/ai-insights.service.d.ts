import { Model } from 'mongoose';
import { AiInsight, AiInsightDocument } from './schemas/ai-insight.schema';
export declare class AiInsightsService {
    private aiModel;
    constructor(aiModel: Model<AiInsightDocument>);
    createInsight(companyId: string, module: string, payload: Record<string, any>, explanations?: any): Promise<import("mongoose").Document<unknown, {}, AiInsightDocument, {}, {}> & AiInsight & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getLatestInsight(companyId: string, module: string): Promise<import("mongoose").Document<unknown, {}, AiInsightDocument, {}, {}> & AiInsight & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getInsights(companyId: string, module?: string): Promise<(import("mongoose").Document<unknown, {}, AiInsightDocument, {}, {}> & AiInsight & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
