import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MlRunnerService } from '../ml/ml-runner.service';
import { AiAgentService } from '../ai/ai-agent.service';
import { AiInsightsService } from '../ai/ai-insights.service';

@Controller('report')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  private logger = new Logger(ReportController.name);
  constructor(
    private reportService: ReportService,
    private mlRunner: MlRunnerService,
    private aiAgent: AiAgentService,
    private aiInsightsService: AiInsightsService,
  ) {}

  @Get('kpis')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  async getKpis(@CurrentUser() user: { companyId: string }) {
    const kpis = await this.reportService.getKpis(user.companyId);
    try {
      await this.mlRunner.run('report', user.companyId);
    } catch (error: any) {
      this.logger.error(`ML report run failed: ${error.message}`);
    }
    await this.aiAgent.sendSummaryIfNeeded(user.companyId, 'report-check');
    return kpis;
  }

  @Get('ai')
  @Roles(UserRole.CompanyOwner, UserRole.Accountant)
  async getAi(@CurrentUser() user: { companyId: string }) {
    return this.aiInsightsService.getLatestInsight(user.companyId, 'report');
  }
}
