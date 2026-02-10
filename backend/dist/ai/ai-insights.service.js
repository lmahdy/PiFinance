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
exports.AiInsightsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ai_insight_schema_1 = require("./schemas/ai-insight.schema");
let AiInsightsService = class AiInsightsService {
    constructor(aiModel) {
        this.aiModel = aiModel;
    }
    async createInsight(companyId, module, payload, explanations) {
        return this.aiModel.create({ companyId, module, payload, explanations });
    }
    async getLatestInsight(companyId, module) {
        return this.aiModel.findOne({ companyId, module }).sort({ createdAt: -1 }).exec();
    }
    async getInsights(companyId, module) {
        const filter = { companyId };
        if (module) {
            filter.module = module;
        }
        return this.aiModel.find(filter).sort({ createdAt: -1 }).limit(50).exec();
    }
};
exports.AiInsightsService = AiInsightsService;
exports.AiInsightsService = AiInsightsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ai_insight_schema_1.AiInsight.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AiInsightsService);
//# sourceMappingURL=ai-insights.service.js.map