import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop({ required: true, index: true })
  companyId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  category?: string;
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);
