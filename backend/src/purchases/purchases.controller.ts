import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Post('upload')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPurchases(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.purchasesService.uploadPurchasesCsv(user.companyId, file);
  }

  @Get('list')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  async listPurchases(@CurrentUser() user: { companyId: string }) {
    return this.purchasesService.listPurchases(user.companyId);
  }
}
