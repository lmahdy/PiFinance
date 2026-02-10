import { SalesService } from './sales.service';
export declare class SalesController {
    private salesService;
    constructor(salesService: SalesService);
    uploadSales(file: Express.Multer.File, user: {
        companyId: string;
    }): Promise<{
        inserted: number;
    }>;
    revenueOverTime(user: {
        companyId: string;
    }, interval?: 'day' | 'month'): Promise<any[]>;
    revenueByProduct(user: {
        companyId: string;
    }): Promise<any[]>;
}
