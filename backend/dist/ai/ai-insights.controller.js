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
exports.AiInsightsController = void 0;
const common_1 = require("@nestjs/common");
const ai_insights_service_1 = require("./ai-insights.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_enum_1 = require("../auth/roles.enum");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AiInsightsController = class AiInsightsController {
    constructor(aiInsightsService) {
        this.aiInsightsService = aiInsightsService;
    }
    async getInsights(user, module) {
        return this.aiInsightsService.getInsights(user.companyId, module);
    }
};
exports.AiInsightsController = AiInsightsController;
__decorate([
    (0, common_1.Get)('insights'),
    (0, roles_decorator_1.Roles)(roles_enum_1.UserRole.CompanyOwner, roles_enum_1.UserRole.Accountant),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiInsightsController.prototype, "getInsights", null);
exports.AiInsightsController = AiInsightsController = __decorate([
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ai_insights_service_1.AiInsightsService])
], AiInsightsController);
//# sourceMappingURL=ai-insights.controller.js.map