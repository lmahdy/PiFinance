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
var AiAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAgentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const nodemailer = require("nodemailer");
const company_config_schema_1 = require("../company/schemas/company-config.schema");
const sale_schema_1 = require("../sales/schemas/sale.schema");
const purchase_schema_1 = require("../purchases/schemas/purchase.schema");
const ai_insights_service_1 = require("./ai-insights.service");
const report_utils_1 = require("../report/report.utils");
let AiAgentService = AiAgentService_1 = class AiAgentService {
    constructor(companyModel, saleModel, purchaseModel, aiInsightsService) {
        this.companyModel = companyModel;
        this.saleModel = saleModel;
        this.purchaseModel = purchaseModel;
        this.aiInsightsService = aiInsightsService;
        this.logger = new common_1.Logger(AiAgentService_1.name);
    }
    createTransporter() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    formatCurrency(value, currency) {
        return `${currency} ${value.toFixed(2)}`;
    }
    async shouldSendForReason(companyId, reason) {
        if (reason === 'report-check') {
            const insights = await this.aiInsightsService.getInsights(companyId, 'report');
            if (insights.length < 2) {
                return true;
            }
            const [latest, previous] = insights;
            return latest?.payload?.status !== previous?.payload?.status;
        }
        return true;
    }
    async sendSummaryIfNeeded(companyId, reason) {
        const config = await this.companyModel.findOne({ companyId }).exec();
        if (!config?.email) {
            this.logger.warn('Company config missing email, skipping AI agent email.');
            return { sent: false, reason: 'missing-email' };
        }
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            this.logger.warn('SMTP not configured; skipping AI agent email.');
            return { sent: false, reason: 'smtp-not-configured' };
        }
        const shouldSend = await this.shouldSendForReason(companyId, reason);
        if (!shouldSend) {
            return { sent: false, reason: 'no-change' };
        }
        const [sales, purchases, salesInsight, inventoryInsight, reportInsight] = await Promise.all([
            this.saleModel.find({ companyId }).exec(),
            this.purchaseModel.find({ companyId }).exec(),
            this.aiInsightsService.getLatestInsight(companyId, 'sales'),
            this.aiInsightsService.getLatestInsight(companyId, 'inventory'),
            this.aiInsightsService.getLatestInsight(companyId, 'report'),
        ]);
        const kpis = (0, report_utils_1.calculateKpis)(sales, purchases, config.taxRate);
        const revenueGrowth = (0, report_utils_1.calculateRevenueGrowth)(sales);
        const salesVolatility = (0, report_utils_1.calculateSalesVolatility)(sales);
        const bestProduct = salesInsight?.payload?.best_product || 'N/A';
        const worstProduct = salesInsight?.payload?.worst_product || 'N/A';
        const inventoryRisk = inventoryInsight?.payload?.risk_level || 'Unknown';
        const inventoryItem = inventoryInsight?.payload?.item || 'N/A';
        const reorderQty = inventoryInsight?.payload?.recommended_reorder ?? 'N/A';
        const healthScore = reportInsight?.payload?.health_score ?? 'N/A';
        const healthStatus = reportInsight?.payload?.status || 'Unknown';
        const healthReason = reportInsight?.payload?.main_reason || 'No reason available.';
        const subject = `BI Summary for ${config.companyName} (${new Date().toLocaleDateString()})`;
        const text = [
            `Hello ${config.companyName} team,`,
            '',
            `Here is your latest BI summary (trigger: ${reason}):`,
            '',
            `Revenue: ${this.formatCurrency(kpis.revenue, config.currency)}`,
            `Costs: ${this.formatCurrency(kpis.costs, config.currency)}`,
            `Profit: ${this.formatCurrency(kpis.profit, config.currency)}`,
            `Taxes (est.): ${this.formatCurrency(kpis.taxes, config.currency)}`,
            `Revenue Growth (30d): ${revenueGrowth.toFixed(2)}%`,
            `Sales Volatility: ${salesVolatility.toFixed(2)}%`,
            '',
            `Best Product: ${bestProduct}`,
            `Worst Product: ${worstProduct}`,
            '',
            `Inventory Risk: ${inventoryRisk} (${inventoryItem})`,
            `Recommended Reorder Quantity: ${reorderQty}`,
            '',
            `Health Score: ${healthScore} (${healthStatus})`,
            `Main Reason: ${healthReason}`,
            '',
            'Recommended Actions:',
            `- Review inventory for ${inventoryItem} and reorder if needed.`,
            `- Promote ${bestProduct} and re-evaluate ${worstProduct}.`,
            `- Track profit margin and keep costs below revenue growth pace.`,
            '',
            'Regards,',
            'BI Assistant',
        ].join('\n');
        try {
            const transporter = this.createTransporter();
            await transporter.sendMail({
                from: process.env.SMTP_FROM || config.email,
                to: config.email,
                subject,
                text,
            });
            return { sent: true };
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            return { sent: false, reason: 'smtp-error' };
        }
    }
};
exports.AiAgentService = AiAgentService;
exports.AiAgentService = AiAgentService = AiAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(company_config_schema_1.CompanyConfig.name)),
    __param(1, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(2, (0, mongoose_1.InjectModel)(purchase_schema_1.Purchase.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        ai_insights_service_1.AiInsightsService])
], AiAgentService);
//# sourceMappingURL=ai-agent.service.js.map