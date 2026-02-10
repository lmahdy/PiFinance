import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'stock', timestamps: true })
export class Stock {
  @Prop({ required: true, index: true })
  companyId: string;

  @Prop({ required: true })
  item: string;

  @Prop({ required: true })
  currentStock: number;

  @Prop({ default: 0 })
  backorder: number;

  @Prop({ required: true })
  lastUpdated: Date;
}

export type StockDocument = Stock & Document;
export const StockSchema = SchemaFactory.createForClass(Stock);
