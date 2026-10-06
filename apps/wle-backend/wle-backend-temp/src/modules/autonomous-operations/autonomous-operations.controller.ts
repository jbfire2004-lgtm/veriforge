import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { AutonomousOperationsService } from './autonomous-operations.service';
import type { OperationsContextInput } from '@vera/autonomous-operations';

@Controller(`${API_V1_PREFIX}/operations`)
export class AutonomousOperationsController {
  constructor(private readonly operations: AutonomousOperationsService) {}

  @Post('run')
  run(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('unionHallId') unionHallId?: string,
    @Query('autoExecute') autoExecute?: string,
  ) {
    return this.operations.runCompany(
      Number(companyId),
      projectId ? Number(projectId) : undefined,
      unionHallId ? Number(unionHallId) : undefined,
      autoExecute !== 'false',
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.operations.getDashboard();
  }

  @Get('report')
  report() {
    return this.operations.getLastReport();
  }

  @Post('override')
  override(@Body() body: { actionId: string; reason: string }) {
    return this.operations.overrideAction(body.actionId, body.reason);
  }

  @Post('rollback')
  rollback(@Body() body: { actionId: string; reason: string }) {
    return this.operations.rollbackAction(body.actionId, body.reason);
  }

  @Post('offline/run')
  offlineRun(@Body() body: OperationsContextInput) {
    return this.operations.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.operations.syncOffline();
  }
}
