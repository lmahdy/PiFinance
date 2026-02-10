import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post('upload')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSales(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.salesService.uploadSalesCsv(user.companyId, file);
  }

  @Get('revenue-over-time')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  async revenueOverTime(
    @CurrentUser() user: { companyId: string },
    @Query('interval') interval?: 'day' | 'month',
  ) {
    return this.salesService.revenueOverTime(user.companyId, interval || 'day');
  }

  @Get('revenue-by-product')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  async revenueByProduct(@CurrentUser() user: { companyId: string }) {
    return this.salesService.revenueByProduct(user.companyId);
  }
}
