import { Controller, Post, UseGuards } from '@nestjs/common';
import { AiAgentService } from './ai-agent.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai-agent')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiAgentController {
  constructor(private aiAgentService: AiAgentService) {}

  @Post('trigger')
  @Roles(UserRole.CompanyOwner)
  async trigger(@CurrentUser() user: { companyId: string }) {
    return this.aiAgentService.sendSummaryIfNeeded(user.companyId, 'manual-trigger');
  }
}
