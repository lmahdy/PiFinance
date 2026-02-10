import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AiInsightsService } from './ai-insights.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiInsightsController {
  constructor(private aiInsightsService: AiInsightsService) {}

  @Get('insights')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  async getInsights(
    @CurrentUser() user: { companyId: string },
    @Query('module') module?: string,
  ) {
    return this.aiInsightsService.getInsights(user.companyId, module);
  }
}
