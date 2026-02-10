import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'ai_insights', timestamps: true })
export class AiInsight {
  @Prop({ required: true, index: true })
  companyId: string;

  @Prop({ required: true })
  module: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ type: Object })
  explanations?: Record<string, any>;
}

export type AiInsightDocument = AiInsight & Document;
export const AiInsightSchema = SchemaFactory.createForClass(AiInsight);
