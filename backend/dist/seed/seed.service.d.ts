import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDocument } from '../auth/schemas/user.schema';
import { CompanyConfigDocument } from '../company/schemas/company-config.schema';
export declare class SeedService implements OnModuleInit {
    private userModel;
    private companyModel;
    private logger;
    constructor(userModel: Model<UserDocument>, companyModel: Model<CompanyConfigDocument>);
    onModuleInit(): Promise<void>;
}
