import { SaleDocument } from '../sales/schemas/sale.schema';
import { PurchaseDocument } from '../purchases/schemas/purchase.schema';
export declare const sum: (values: number[]) => number;
export declare const isOverheadType: (type: string) => boolean;
export declare const calculateKpis: (sales: SaleDocument[], purchases: PurchaseDocument[], taxRate: number) => {
    revenue: number;
    cogs: number;
    overheadCosts: number;
    costs: number;
    profit: number;
    taxes: number;
    profitMargin: number;
};
export declare const calculateRevenueGrowth: (sales: SaleDocument[]) => number;
export declare const calculateSalesVolatility: (sales: SaleDocument[]) => number;
