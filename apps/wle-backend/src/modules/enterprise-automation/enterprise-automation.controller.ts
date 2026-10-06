import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { EnterpriseAutomationService } from './enterprise-automation.service';
import type { EnterpriseContextInput } from '@vera/enterprise-automation';

@Controller(`${API_V1_PREFIX}/enterprise`)
export class EnterpriseAutomationController {
  constructor(private readonly enterprise: EnterpriseAutomationService) {}

  @Post('orchestrate')
  orchestrate(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('unionHallId') unionHallId?: string,
    @Query('autoExecute') autoExecute?: string,
  ) {
    return this.enterprise.orchestrateCompany(
      Number(companyId),
      projectId ? Number(projectId) : undefined,
      unionHallId ? Number(unionHallId) : undefined,
      autoExecute !== 'false',
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.enterprise.getDashboard();
  }

  @Get('report')
  report() {
    return this.enterprise.getLastReport();
  }

  @Post('override')
  override(@Body() body: { actionId: string; reason: string }) {
    return this.enterprise.overrideAction(body.actionId, body.reason);
  }

  @Post('rollback')
  rollback(@Body() body: { actionId: string; reason: string }) {
    return this.enterprise.rollbackAction(body.actionId, body.reason);
  }

  @Post('offline/orchestrate')
  offlineOrchestrate(@Body() body: EnterpriseContextInput) {
    return this.enterprise.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.enterprise.syncOffline();
  }
}
