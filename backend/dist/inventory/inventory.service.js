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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const stock_schema_1 = require("./schemas/stock.schema");
const purchase_schema_1 = require("../purchases/schemas/purchase.schema");
const sale_schema_1 = require("../sales/schemas/sale.schema");
const ai_insights_service_1 = require("../ai/ai-insights.service");
let InventoryService = class InventoryService {
    constructor(stockModel, purchaseModel, saleModel, aiInsightsService) {
        this.stockModel = stockModel;
        this.purchaseModel = purchaseModel;
        this.saleModel = saleModel;
        this.aiInsightsService = aiInsightsService;
    }
    isOverhead(type) {
        const normalized = (type || '').toLowerCase();
        return ['overhead', 'expense', 'utility', 'rent', 'salary', 'service'].some((key) => normalized.includes(key));
    }
    async recalculateStock(companyId) {
        const purchases = await this.purchaseModel.find({ companyId }).exec();
        const sales = await this.saleModel.find({ companyId }).exec();
        const purchaseMap = new Map();
        for (const purchase of purchases) {
            if (this.isOverhead(purchase.type)) {
                continue;
            }
            purchaseMap.set(purchase.item, (purchaseMap.get(purchase.item) || 0) + purchase.quantity);
        }
        const salesMap = new Map();
        for (const sale of sales) {
            salesMap.set(sale.product, (salesMap.get(sale.product) || 0) + sale.quantity);
        }
        const items = new Set([...purchaseMap.keys(), ...salesMap.keys()]);
        const now = new Date();
        const ops = Array.from(items).map((item) => {
            const purchased = purchaseMap.get(item) || 0;
            const sold = salesMap.get(item) || 0;
            const rawStock = purchased - sold;
            const currentStock = Math.max(rawStock, 0);
            const backorder = Math.max(sold - purchased, 0);
            return {
                updateOne: {
                    filter: { companyId, item },
                    update: {
                        $set: { companyId, item, currentStock, backorder, lastUpdated: now },
                    },
                    upsert: true,
                },
            };
        });
        if (ops.length === 0) {
            return { updated: 0 };
        }
        return this.stockModel.bulkWrite(ops, { ordered: false });
    }
    async getStock(companyId) {
        return this.stockModel.find({ companyId }).sort({ item: 1 }).exec();
    }
    async getAlerts(companyId) {
        const latest = await this.aiInsightsService.getLatestInsight(companyId, 'inventory');
        if (!latest) {
            const backorders = await this.stockModel.find({ companyId, backorder: { $gt: 0 } }).exec();
            return backorders.map((row) => ({
                item: row.item,
                risk_level: 'High',
                predicted_stockout_days: 0,
                recommended_reorder: 0,
            }));
        }
        const payload = latest.payload || {};
        const explanationItems = latest.explanations?.items;
        if (Array.isArray(payload.items)) {
            return payload.items.filter((item) => item.risk_level === 'High');
        }
        if (Array.isArray(explanationItems)) {
            return explanationItems.filter((item) => item.risk_level === 'High');
        }
        if (payload.risk_level === 'High') {
            return [payload];
        }
        return [];
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(stock_schema_1.Stock.name)),
    __param(1, (0, mongoose_1.InjectModel)(purchase_schema_1.Purchase.name)),
    __param(2, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        ai_insights_service_1.AiInsightsService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map