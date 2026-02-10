import { Controller, Get, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('stock')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  async getStock(@CurrentUser() user: { companyId: string }) {
    return this.inventoryService.getStock(user.companyId);
  }

  @Get('alerts')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  async getAlerts(@CurrentUser() user: { companyId: string }) {
    return this.inventoryService.getAlerts(user.companyId);
  }
}
