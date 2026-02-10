import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { parseCsvBuffer, assertRequiredColumns, parseDate, parseNumber } from '../common/utils/csv';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';
import { MlRunnerService } from '../ml/ml-runner.service';
import { AiAgentService } from '../ai/ai-agent.service';

const REQUIRED_COLUMNS = ['Date', 'Supplier', 'Item', 'Type', 'Quantity', 'Cost_Price'];

@Injectable()
export class PurchasesService {
  private logger = new Logger(PurchasesService.name);
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private mlRunner: MlRunnerService,
    private aiAgent: AiAgentService,
  ) {}

  private computeTotalCost(quantity: number, costPrice: number, totalCostRaw?: string) {
    if (totalCostRaw && totalCostRaw.trim().length > 0) {
      return parseNumber(totalCostRaw, 'Total_Cost');
    }
    return Number((quantity * costPrice).toFixed(2));
  }

  async uploadPurchasesCsv(companyId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('CSV file is required.');
    }

    const rows = await parseCsvBuffer(file.buffer);
    assertRequiredColumns(rows[0], REQUIRED_COLUMNS);

    let purchases;
    try {
      purchases = rows.map((row) => {
        const quantity = parseNumber(row.Quantity, 'Quantity');
        const costPrice = parseNumber(row.Cost_Price, 'Cost_Price');
        return {
          companyId,
          date: parseDate(row.Date, 'Date'),
          supplier: row.Supplier,
          item: row.Item,
          type: row.Type,
          quantity,
          costPrice,
          totalCost: this.computeTotalCost(quantity, costPrice, row.Total_Cost),
        };
      });
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }

    if (purchases.length === 0) {
      throw new BadRequestException('No purchases rows found.');
    }

    // Replace existing purchases data for a clean upload (avoids duplicate aggregation).
    await this.purchaseModel.deleteMany({ companyId }).exec();
    const inserted = await this.purchaseModel.insertMany(purchases, { ordered: false });

    await this.productsService.upsertProducts(
      companyId,
      purchases.map((purchase) => ({ name: purchase.item })),
    );

    await this.inventoryService.recalculateStock(companyId);

    try {
      await this.mlRunner.run('inventory', companyId);
    } catch (error: any) {
      this.logger.error(`ML inventory run failed: ${error.message}`);
    }

    try {
      await this.mlRunner.run('report', companyId);
    } catch (error: any) {
      this.logger.error(`ML report run failed: ${error.message}`);
    }
    await this.aiAgent.sendSummaryIfNeeded(companyId, 'purchases-upload');

    return { inserted: inserted.length };
  }

  async listPurchases(companyId: string) {
    return this.purchaseModel.find({ companyId }).sort({ date: -1 }).limit(200).exec();
  }
}
