import { AiAgentService } from './ai-agent.service';
export declare class AiAgentController {
    private aiAgentService;
    constructor(aiAgentService: AiAgentService);
    trigger(user: {
        companyId: string;
    }): Promise<{
        sent: boolean;
        reason: string;
    } | {
        sent: boolean;
        reason?: undefined;
    }>;
}
