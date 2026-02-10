"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const sales_controller_1 = require("./sales.controller");
const sales_service_1 = require("./sales.service");
const sale_schema_1 = require("./schemas/sale.schema");
const products_module_1 = require("../products/products.module");
const ml_module_1 = require("../ml/ml.module");
const ai_module_1 = require("../ai/ai.module");
const inventory_module_1 = require("../inventory/inventory.module");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: sale_schema_1.Sale.name, schema: sale_schema_1.SaleSchema }]),
            products_module_1.ProductsModule,
            inventory_module_1.InventoryModule,
            ml_module_1.MlModule,
            ai_module_1.AiModule,
        ],
        controllers: [sales_controller_1.SalesController],
        providers: [sales_service_1.SalesService],
        exports: [sales_service_1.SalesService, mongoose_1.MongooseModule],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map