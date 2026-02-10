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
var PurchasesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const csv_1 = require("../common/utils/csv");
const purchase_schema_1 = require("./schemas/purchase.schema");
const products_service_1 = require("../products/products.service");
const inventory_service_1 = require("../inventory/inventory.service");
const ml_runner_service_1 = require("../ml/ml-runner.service");
const ai_agent_service_1 = require("../ai/ai-agent.service");
const REQUIRED_COLUMNS = ['Date', 'Supplier', 'Item', 'Type', 'Quantity', 'Cost_Price'];
let PurchasesService = PurchasesService_1 = class PurchasesService {
    constructor(purchaseModel, productsService, inventoryService, mlRunner, aiAgent) {
        this.purchaseModel = purchaseModel;
        this.productsService = productsService;
        this.inventoryService = inventoryService;
        this.mlRunner = mlRunner;
        this.aiAgent = aiAgent;
        this.logger = new common_1.Logger(PurchasesService_1.name);
    }
    computeTotalCost(quantity, costPrice, totalCostRaw) {
        if (totalCostRaw && totalCostRaw.trim().length > 0) {
            return (0, csv_1.parseNumber)(totalCostRaw, 'Total_Cost');
        }
        return Number((quantity * costPrice).toFixed(2));
    }
    async uploadPurchasesCsv(companyId, file) {
        if (!file) {
            throw new common_1.BadRequestException('CSV file is required.');
        }
        const rows = await (0, csv_1.parseCsvBuffer)(file.buffer);
        (0, csv_1.assertRequiredColumns)(rows[0], REQUIRED_COLUMNS);
        let purchases;
        try {
            purchases = rows.map((row) => {
                const quantity = (0, csv_1.parseNumber)(row.Quantity, 'Quantity');
                const costPrice = (0, csv_1.parseNumber)(row.Cost_Price, 'Cost_Price');
                return {
                    companyId,
                    date: (0, csv_1.parseDate)(row.Date, 'Date'),
                    supplier: row.Supplier,
                    item: row.Item,
                    type: row.Type,
                    quantity,
                    costPrice,
                    totalCost: this.computeTotalCost(quantity, costPrice, row.Total_Cost),
                };
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
        if (purchases.length === 0) {
            throw new common_1.BadRequestException('No purchases rows found.');
        }
        await this.purchaseModel.deleteMany({ companyId }).exec();
        const inserted = await this.purchaseModel.insertMany(purchases, { ordered: false });
        await this.productsService.upsertProducts(companyId, purchases.map((purchase) => ({ name: purchase.item })));
        await this.inventoryService.recalculateStock(companyId);
        try {
            await this.mlRunner.run('inventory', companyId);
        }
        catch (error) {
            this.logger.error(`ML inventory run failed: ${error.message}`);
        }
        try {
            await this.mlRunner.run('report', companyId);
        }
        catch (error) {
            this.logger.error(`ML report run failed: ${error.message}`);
        }
        await this.aiAgent.sendSummaryIfNeeded(companyId, 'purchases-upload');
        return { inserted: inserted.length };
    }
    async listPurchases(companyId) {
        return this.purchaseModel.find({ companyId }).sort({ date: -1 }).limit(200).exec();
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = PurchasesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(purchase_schema_1.Purchase.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        products_service_1.ProductsService,
        inventory_service_1.InventoryService,
        ml_runner_service_1.MlRunnerService,
        ai_agent_service_1.AiAgentService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map