import { ReportService } from './report.service';
import { MlRunnerService } from '../ml/ml-runner.service';
import { AiAgentService } from '../ai/ai-agent.service';
import { AiInsightsService } from '../ai/ai-insights.service';
export declare class ReportController {
    private reportService;
    private mlRunner;
    private aiAgent;
    private aiInsightsService;
    private logger;
    constructor(reportService: ReportService, mlRunner: MlRunnerService, aiAgent: AiAgentService, aiInsightsService: AiInsightsService);
    getKpis(user: {
        companyId: string;
    }): Promise<{
        currency: string;
        revenue: number;
        costs: number;
        overheadCosts: number;
        stockCosts: number;
        profit: number;
        taxes: number;
        profitMargin: number;
        revenueGrowth: number;
        salesVolatility: number;
        configMissing: boolean;
    }>;
    getAi(user: {
        companyId: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../ai/schemas/ai-insight.schema").AiInsightDocument, {}, {}> & import("../ai/schemas/ai-insight.schema").AiInsight & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
