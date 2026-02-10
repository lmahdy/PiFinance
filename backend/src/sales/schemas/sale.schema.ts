import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'sales', timestamps: true })
export class Sale {
  @Prop({ required: true, index: true })
  companyId: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  client: string;

  @Prop({ required: true })
  product: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  total: number;
}

export type SaleDocument = Sale & Document;
export const SaleSchema = SchemaFactory.createForClass(Sale);
