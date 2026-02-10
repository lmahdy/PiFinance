import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async upsertProducts(companyId: string, products: { name: string; category?: string }[]) {
    const ops = products.map((product) => ({
      updateOne: {
        filter: { companyId, name: product.name },
        update: { $set: { companyId, name: product.name, category: product.category } },
        upsert: true,
      },
    }));

    if (ops.length === 0) {
      return { upserted: 0 };
    }

    return this.productModel.bulkWrite(ops, { ordered: false });
  }
}
