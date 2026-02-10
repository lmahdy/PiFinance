"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const purchases_controller_1 = require("./purchases.controller");
const purchases_service_1 = require("./purchases.service");
const purchase_schema_1 = require("./schemas/purchase.schema");
const products_module_1 = require("../products/products.module");
const inventory_module_1 = require("../inventory/inventory.module");
const ml_module_1 = require("../ml/ml.module");
const ai_module_1 = require("../ai/ai.module");
let PurchasesModule = class PurchasesModule {
};
exports.PurchasesModule = PurchasesModule;
exports.PurchasesModule = PurchasesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: purchase_schema_1.Purchase.name, schema: purchase_schema_1.PurchaseSchema }]),
            products_module_1.ProductsModule,
            inventory_module_1.InventoryModule,
            ml_module_1.MlModule,
            ai_module_1.AiModule,
        ],
        controllers: [purchases_controller_1.PurchasesController],
        providers: [purchases_service_1.PurchasesService],
        exports: [purchases_service_1.PurchasesService, mongoose_1.MongooseModule],
    })
], PurchasesModule);
//# sourceMappingURL=purchases.module.js.map