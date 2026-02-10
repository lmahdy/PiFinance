import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { CompanyConfig, CompanyConfigSchema } from '../company/schemas/company-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CompanyConfig.name, schema: CompanyConfigSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
