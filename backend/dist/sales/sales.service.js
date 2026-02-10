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
var SalesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sale_schema_1 = require("./schemas/sale.schema");
const csv_1 = require("../common/utils/csv");
const products_service_1 = require("../products/products.service");
const ml_runner_service_1 = require("../ml/ml-runner.service");
const ai_agent_service_1 = require("../ai/ai-agent.service");
const inventory_service_1 = require("../inventory/inventory.service");
const REQUIRED_COLUMNS = ['Date', 'Client', 'Product', 'Category', 'Quantity', 'Unit_Price', 'Total'];
let SalesService = SalesService_1 = class SalesService {
    constructor(saleModel, productsService, mlRunner, aiAgent, inventoryService) {
        this.saleModel = saleModel;
        this.productsService = productsService;
        this.mlRunner = mlRunner;
        this.aiAgent = aiAgent;
        this.inventoryService = inventoryService;
        this.logger = new common_1.Logger(SalesService_1.name);
    }
    async uploadSalesCsv(companyId, file) {
        if (!file) {
            throw new common_1.BadRequestException('CSV file is required.');
        }
        const rows = await (0, csv_1.parseCsvBuffer)(file.buffer);
        (0, csv_1.assertRequiredColumns)(rows[0], REQUIRED_COLUMNS);
        let sales;
        try {
            sales = rows.map((row) => ({
                companyId,
                date: (0, csv_1.parseDate)(row.Date, 'Date'),
                client: row.Client,
                product: row.Product,
                category: row.Category,
                quantity: (0, csv_1.parseNumber)(row.Quantity, 'Quantity'),
                unitPrice: (0, csv_1.parseNumber)(row.Unit_Price, 'Unit_Price'),
                total: (0, csv_1.parseNumber)(row.Total, 'Total'),
            }));
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
        if (sales.length === 0) {
            throw new common_1.BadRequestException('No sales rows found.');
        }
        await this.saleModel.deleteMany({ companyId }).exec();
        const inserted = await this.saleModel.insertMany(sales, { ordered: false });
        await this.productsService.upsertProducts(companyId, sales.map((sale) => ({ name: sale.product, category: sale.category })));
        await this.inventoryService.recalculateStock(companyId);
        try {
            await this.mlRunner.run('inventory', companyId);
        }
        catch (error) {
            this.logger.error(`ML inventory run failed: ${error.message}`);
        }
        try {
            await this.mlRunner.run('sales', companyId);
        }
        catch (error) {
            this.logger.error(`ML sales run failed: ${error.message}`);
        }
        try {
            await this.mlRunner.run('report', companyId);
        }
        catch (error) {
            this.logger.error(`ML report run failed: ${error.message}`);
        }
        await this.aiAgent.sendSummaryIfNeeded(companyId, 'sales-upload');
        return { inserted: inserted.length };
    }
    async revenueOverTime(companyId, interval = 'day') {
        const safeInterval = interval === 'month' ? 'month' : 'day';
        const format = safeInterval === 'month' ? '%Y-%m' : '%Y-%m-%d';
        return this.saleModel
            .aggregate([
            { $match: { companyId } },
            {
                $group: {
                    _id: { $dateToString: { format, date: '$date' } },
                    revenue: { $sum: '$total' },
                },
            },
            { $sort: { _id: 1 } },
        ])
            .exec();
    }
    async revenueByProduct(companyId) {
        return this.saleModel
            .aggregate([
            { $match: { companyId } },
            {
                $group: {
                    _id: '$product',
                    revenue: { $sum: '$total' },
                    quantity: { $sum: '$quantity' },
                },
            },
            { $sort: { revenue: -1 } },
        ])
            .exec();
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = SalesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        products_service_1.ProductsService,
        ml_runner_service_1.MlRunnerService,
        ai_agent_service_1.AiAgentService,
        inventory_service_1.InventoryService])
], SalesService);
//# sourceMappingURL=sales.service.js.map