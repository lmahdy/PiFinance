import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'purchases', timestamps: true })
export class Purchase {
  @Prop({ required: true, index: true })
  companyId: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  supplier: string;

  @Prop({ required: true })
  item: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  costPrice: number;

  @Prop({ required: true })
  totalCost: number;
}

export type PurchaseDocument = Purchase & Document;
export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
