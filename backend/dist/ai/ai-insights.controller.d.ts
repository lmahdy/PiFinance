import { AiInsightsService } from './ai-insights.service';
export declare class AiInsightsController {
    private aiInsightsService;
    constructor(aiInsightsService: AiInsightsService);
    getInsights(user: {
        companyId: string;
    }, module?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/ai-insight.schema").AiInsightDocument, {}, {}> & import("./schemas/ai-insight.schema").AiInsight & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
