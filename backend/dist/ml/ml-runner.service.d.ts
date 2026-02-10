export declare class MlRunnerService {
    run(module: 'sales' | 'inventory' | 'report' | 'all', companyId: string): Promise<void>;
}
