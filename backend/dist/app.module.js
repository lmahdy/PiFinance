"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const auth_module_1 = require("./auth/auth.module");
const company_module_1 = require("./company/company.module");
const sales_module_1 = require("./sales/sales.module");
const purchases_module_1 = require("./purchases/purchases.module");
const inventory_module_1 = require("./inventory/inventory.module");
const report_module_1 = require("./report/report.module");
const ai_module_1 = require("./ai/ai.module");
const ml_module_1 = require("./ml/ml.module");
const seed_module_1 = require("./seed/seed.module");
const products_module_1 = require("./products/products.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/bi_platform'),
            auth_module_1.AuthModule,
            company_module_1.CompanyModule,
            products_module_1.ProductsModule,
            sales_module_1.SalesModule,
            purchases_module_1.PurchasesModule,
            inventory_module_1.InventoryModule,
            report_module_1.ReportModule,
            ml_module_1.MlModule,
            ai_module_1.AiModule,
            seed_module_1.SeedModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map