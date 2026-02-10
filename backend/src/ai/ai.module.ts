import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiInsightsService } from './ai-insights.service';
import { AiInsightsController } from './ai-insights.controller';
import { AiInsight, AiInsightSchema } from './schemas/ai-insight.schema';
import { AiAgentService } from './ai-agent.service';
import { AiAgentController } from './ai-agent.controller';
import { CompanyConfig, CompanyConfigSchema } from '../company/schemas/company-config.schema';
import { Sale, SaleSchema } from '../sales/schemas/sale.schema';
import { Purchase, PurchaseSchema } from '../purchases/schemas/purchase.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiInsight.name, schema: AiInsightSchema },
      { name: CompanyConfig.name, schema: CompanyConfigSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Purchase.name, schema: PurchaseSchema },
    ]),
  ],
  controllers: [AiInsightsController, AiAgentController],
  providers: [AiInsightsService, AiAgentService],
  exports: [AiInsightsService, AiAgentService, MongooseModule],
})
export class AiModule {}
