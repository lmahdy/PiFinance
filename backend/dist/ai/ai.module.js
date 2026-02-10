"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ai_insights_service_1 = require("./ai-insights.service");
const ai_insights_controller_1 = require("./ai-insights.controller");
const ai_insight_schema_1 = require("./schemas/ai-insight.schema");
const ai_agent_service_1 = require("./ai-agent.service");
const ai_agent_controller_1 = require("./ai-agent.controller");
const company_config_schema_1 = require("../company/schemas/company-config.schema");
const sale_schema_1 = require("../sales/schemas/sale.schema");
const purchase_schema_1 = require("../purchases/schemas/purchase.schema");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: ai_insight_schema_1.AiInsight.name, schema: ai_insight_schema_1.AiInsightSchema },
                { name: company_config_schema_1.CompanyConfig.name, schema: company_config_schema_1.CompanyConfigSchema },
                { name: sale_schema_1.Sale.name, schema: sale_schema_1.SaleSchema },
                { name: purchase_schema_1.Purchase.name, schema: purchase_schema_1.PurchaseSchema },
            ]),
        ],
        controllers: [ai_insights_controller_1.AiInsightsController, ai_agent_controller_1.AiAgentController],
        providers: [ai_insights_service_1.AiInsightsService, ai_agent_service_1.AiAgentService],
        exports: [ai_insights_service_1.AiInsightsService, ai_agent_service_1.AiAgentService, mongoose_1.MongooseModule],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map