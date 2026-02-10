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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../auth/schemas/user.schema");
const roles_enum_1 = require("../auth/roles.enum");
const company_config_schema_1 = require("../company/schemas/company-config.schema");
let SeedService = SeedService_1 = class SeedService {
    constructor(userModel, companyModel) {
        this.userModel = userModel;
        this.companyModel = companyModel;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onModuleInit() {
        const count = await this.userModel.countDocuments().exec();
        if (count > 0) {
            const companyIds = await this.userModel.distinct('companyId').exec();
            for (const companyId of companyIds) {
                const existing = await this.companyModel.findOne({ companyId }).exec();
                if (existing) {
                    continue;
                }
                const owner = await this.userModel
                    .findOne({ companyId, role: roles_enum_1.UserRole.CompanyOwner })
                    .exec();
                await this.companyModel.create({
                    companyId,
                    companyName: 'Demo Company',
                    taxRate: 18,
                    currency: 'USD',
                    email: owner?.email || 'owner@demo.com',
                });
                this.logger.log(`Seeded missing company config for companyId ${companyId}.`);
            }
            return;
        }
        const companyId = new mongoose_2.Types.ObjectId().toHexString();
        const passwordHash = await bcrypt.hash('Password123!', 10);
        await this.companyModel.create({
            companyId,
            companyName: 'Demo Company',
            taxRate: 18,
            currency: 'USD',
            email: 'owner@demo.com',
        });
        await this.userModel.insertMany([
            {
                companyId,
                email: 'owner@demo.com',
                passwordHash,
                role: roles_enum_1.UserRole.CompanyOwner,
            },
            {
                companyId,
                email: 'accountant@demo.com',
                passwordHash,
                role: roles_enum_1.UserRole.Accountant,
            },
        ]);
        this.logger.log('Seeded default company config and users.');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(company_config_schema_1.CompanyConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SeedService);
//# sourceMappingURL=seed.service.js.map