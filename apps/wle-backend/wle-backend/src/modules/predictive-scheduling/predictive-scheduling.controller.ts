import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { PredictiveSchedulingService } from './predictive-scheduling.service';
import type { SchedulingContextInput } from '@vera/predictive-scheduling';

@Controller(`${API_V1_PREFIX}/scheduling`)
export class PredictiveSchedulingController {
  constructor(private readonly scheduling: PredictiveSchedulingService) {}

  @Post('optimize')
  optimize(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('unionHallId') unionHallId?: string,
  ) {
    return this.scheduling.optimizeCompany(
      Number(companyId),
      projectId ? Number(projectId) : undefined,
      unionHallId ? Number(unionHallId) : undefined,
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.scheduling.getDashboard();
  }

  @Get('report')
  report() {
    return this.scheduling.getLastReport();
  }

  @Post('offline/optimize')
  offlineOptimize(@Body() body: SchedulingContextInput) {
    return this.scheduling.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.scheduling.syncOffline();
  }
}
