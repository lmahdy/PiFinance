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
var ReportController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const report_service_1 = require("./report.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_enum_1 = require("../auth/roles.enum");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const ml_runner_service_1 = require("../ml/ml-runner.service");
const ai_agent_service_1 = require("../ai/ai-agent.service");
const ai_insights_service_1 = require("../ai/ai-insights.service");
let ReportController = ReportController_1 = class ReportController {
    constructor(reportService, mlRunner, aiAgent, aiInsightsService) {
        this.reportService = reportService;
        this.mlRunner = mlRunner;
        this.aiAgent = aiAgent;
        this.aiInsightsService = aiInsightsService;
        this.logger = new common_1.Logger(ReportController_1.name);
    }
    async getKpis(user) {
        const kpis = await this.reportService.getKpis(user.companyId);
        try {
            await this.mlRunner.run('report', user.companyId);
        }
        catch (error) {
            this.logger.error(`ML report run failed: ${error.message}`);
        }
        await this.aiAgent.sendSummaryIfNeeded(user.companyId, 'report-check');
        return kpis;
    }
    async getAi(user) {
        return this.aiInsightsService.getLatestInsight(user.companyId, 'report');
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)('kpis'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.CompanyOwner, roles_enum_1.UserRole.Accountant),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getKpis", null);
__decorate([
    (0, common_1.Get)('ai'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.CompanyOwner, roles_enum_1.UserRole.Accountant),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "getAi", null);
exports.ReportController = ReportController = ReportController_1 = __decorate([
    (0, common_1.Controller)('report'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [report_service_1.ReportService,
        ml_runner_service_1.MlRunnerService,
        ai_agent_service_1.AiAgentService,
        ai_insights_service_1.AiInsightsService])
], ReportController);
//# sourceMappingURL=report.controller.js.map