import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiInsight, AiInsightDocument } from './schemas/ai-insight.schema';

@Injectable()
export class AiInsightsService {
  constructor(@InjectModel(AiInsight.name) private aiModel: Model<AiInsightDocument>) {}

  async createInsight(companyId: string, module: string, payload: Record<string, any>, explanations?: any) {
    return this.aiModel.create({ companyId, module, payload, explanations });
  }

  async getLatestInsight(companyId: string, module: string) {
    return this.aiModel.findOne({ companyId, module }).sort({ createdAt: -1 }).exec();
  }

  async getInsights(companyId: string, module?: string) {
    const filter: Record<string, any> = { companyId };
    if (module) {
      filter.module = module;
    }
    return this.aiModel.find(filter).sort({ createdAt: -1 }).limit(50).exec();
  }
}
