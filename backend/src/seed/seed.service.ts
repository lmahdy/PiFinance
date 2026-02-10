import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { UserRole } from '../auth/roles.enum';
import { CompanyConfig, CompanyConfigDocument } from '../company/schemas/company-config.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CompanyConfig.name) private companyModel: Model<CompanyConfigDocument>,
  ) {}

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
          .findOne({ companyId, role: UserRole.CompanyOwner })
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

    const companyId = new Types.ObjectId().toHexString();
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
        role: UserRole.CompanyOwner,
      },
      {
        companyId,
        email: 'accountant@demo.com',
        passwordHash,
        role: UserRole.Accountant,
      },
    ]);

    this.logger.log('Seeded default company config and users.');
  }
}
