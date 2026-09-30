import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { AutonomousSafetyService } from './autonomous-safety.service';
import type { SafetyContextInput } from '@vera/autonomous-safety';

@Controller(`${API_V1_PREFIX}/safety`)
export class AutonomousSafetyController {
  constructor(private readonly safety: AutonomousSafetyService) {}

  @Post('analyze')
  analyze(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.safety.analyzeCompany(
      Number(companyId),
      projectId ? Number(projectId) : undefined,
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.safety.getDashboard();
  }

  @Get('report')
  report() {
    return this.safety.getLastReport();
  }

  @Post('offline/analyze')
  offlineAnalyze(@Body() body: SafetyContextInput) {
    return this.safety.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.safety.syncOffline();
  }
}
