import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { parseCsvBuffer, assertRequiredColumns, parseDate, parseNumber } from '../common/utils/csv';
import { ProductsService } from '../products/products.service';
import { MlRunnerService } from '../ml/ml-runner.service';
import { AiAgentService } from '../ai/ai-agent.service';
import { InventoryService } from '../inventory/inventory.service';

const REQUIRED_COLUMNS = ['Date', 'Client', 'Product', 'Category', 'Quantity', 'Unit_Price', 'Total'];

@Injectable()
export class SalesService {
  private logger = new Logger(SalesService.name);
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private productsService: ProductsService,
    private mlRunner: MlRunnerService,
    private aiAgent: AiAgentService,
    private inventoryService: InventoryService,
  ) {}

  async uploadSalesCsv(companyId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CSV file is required.');
    }

    const rows = await parseCsvBuffer(file.buffer);
    assertRequiredColumns(rows[0], REQUIRED_COLUMNS);

    let sales;
    try {
      sales = rows.map((row) => ({
        companyId,
        date: parseDate(row.Date, 'Date'),
        client: row.Client,
        product: row.Product,
        category: row.Category,
        quantity: parseNumber(row.Quantity, 'Quantity'),
        unitPrice: parseNumber(row.Unit_Price, 'Unit_Price'),
        total: parseNumber(row.Total, 'Total'),
      }));
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    if (sales.length === 0) {
      throw new BadRequestException('No sales rows found.');
    }

    // Replace existing sales data for a clean upload (avoids duplicate aggregation).
    await this.saleModel.deleteMany({ companyId }).exec();
    const inserted = await this.saleModel.insertMany(sales, { ordered: false });

    await this.productsService.upsertProducts(
      companyId,
      sales.map((sale) => ({ name: sale.product, category: sale.category })),
    );

    await this.inventoryService.recalculateStock(companyId);
    try {
      await this.mlRunner.run('inventory', companyId);
    } catch (error: any) {
      this.logger.error(`ML inventory run failed: ${error.message}`);
    }

    try {
      await this.mlRunner.run('sales', companyId);
    } catch (error: any) {
      this.logger.error(`ML sales run failed: ${error.message}`);
    }

    try {
      await this.mlRunner.run('report', companyId);
    } catch (error: any) {
      this.logger.error(`ML report run failed: ${error.message}`);
    }
    await this.aiAgent.sendSummaryIfNeeded(companyId, 'sales-upload');

    return { inserted: inserted.length };
  }

  async revenueOverTime(companyId: string, interval: 'day' | 'month' = 'day') {
    const safeInterval = interval === 'month' ? 'month' : 'day';
    const format = safeInterval === 'month' ? '%Y-%m' : '%Y-%m-%d';
    return this.saleModel
      .aggregate([
        { $match: { companyId } },
        {
          $group: {
            _id: { $dateToString: { format, date: '$date' } },
            revenue: { $sum: '$total' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();
  }

  async revenueByProduct(companyId: string) {
    return this.saleModel
      .aggregate([
        { $match: { companyId } },
        {
          $group: {
            _id: '$product',
            revenue: { $sum: '$total' },
            quantity: { $sum: '$quantity' },
          },
        },
        { $sort: { revenue: -1 } },
      ])
      .exec();
  }
}
