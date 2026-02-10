"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const company_config_schema_1 = require("../company/schemas/company-config.schema");
const sale_schema_1 = require("../sales/schemas/sale.schema");
const purchase_schema_1 = require("../purchases/schemas/purchase.schema");
const report_utils_1 = require("./report.utils");
let ReportService = class ReportService {
    constructor(companyModel, saleModel, purchaseModel) {
        this.companyModel = companyModel;
        this.saleModel = saleModel;
        this.purchaseModel = purchaseModel;
    }
    async getKpis(companyId) {
        const config = await this.companyModel.findOne({ companyId }).exec();
        const configMissing = !config;
        const companyConfig = {
            companyId,
            companyName: config?.companyName || 'Unknown Company',
            taxRate: config?.taxRate ?? 0,
            currency: config?.currency || 'USD',
            email: config?.email || '',
        };
        const [sales, purchases] = await Promise.all([
            this.saleModel.find({ companyId }).exec(),
            this.purchaseModel.find({ companyId }).exec(),
        ]);
        const kpis = (0, report_utils_1.calculateKpis)(sales, purchases, companyConfig.taxRate);
        const revenueGrowth = (0, report_utils_1.calculateRevenueGrowth)(sales);
        const salesVolatility = (0, report_utils_1.calculateSalesVolatility)(sales);
        return {
            currency: companyConfig.currency,
            revenue: kpis.revenue,
            costs: kpis.costs,
            overheadCosts: kpis.overheadCosts,
            stockCosts: kpis.cogs,
            profit: kpis.profit,
            taxes: kpis.taxes,
            profitMargin: kpis.profitMargin,
            revenueGrowth,
            salesVolatility,
            configMissing,
        };
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(company_config_schema_1.CompanyConfig.name)),
    __param(1, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(2, (0, mongoose_1.InjectModel)(purchase_schema_1.Purchase.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReportService);
//# sourceMappingURL=report.service.js.map