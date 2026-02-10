"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const report_controller_1 = require("./report.controller");
const report_service_1 = require("./report.service");
const company_config_schema_1 = require("../company/schemas/company-config.schema");
const sale_schema_1 = require("../sales/schemas/sale.schema");
const purchase_schema_1 = require("../purchases/schemas/purchase.schema");
const ml_module_1 = require("../ml/ml.module");
const ai_module_1 = require("../ai/ai.module");
let ReportModule = class ReportModule {
};
exports.ReportModule = ReportModule;
exports.ReportModule = ReportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: company_config_schema_1.CompanyConfig.name, schema: company_config_schema_1.CompanyConfigSchema },
                { name: sale_schema_1.Sale.name, schema: sale_schema_1.SaleSchema },
                { name: purchase_schema_1.Purchase.name, schema: purchase_schema_1.PurchaseSchema },
            ]),
            ml_module_1.MlModule,
            ai_module_1.AiModule,
        ],
        controllers: [report_controller_1.ReportController],
        providers: [report_service_1.ReportService],
        exports: [report_service_1.ReportService],
    })
], ReportModule);
//# sourceMappingURL=report.module.js.map