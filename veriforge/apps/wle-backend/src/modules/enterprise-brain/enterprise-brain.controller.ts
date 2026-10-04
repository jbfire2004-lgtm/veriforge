import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { EnterpriseBrainService } from './enterprise-brain.service';
import type { BrainContextInput } from '@vera/enterprise-brain';

@Controller(`${API_V1_PREFIX}/brain`)
export class EnterpriseBrainController {
  constructor(private readonly brain: EnterpriseBrainService) {}

  @Post('think')
  think(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('unionHallId') unionHallId?: string,
  ) {
    return this.brain.thinkCompany(
      Number(companyId),
      projectId ? Number(projectId) : undefined,
      unionHallId ? Number(unionHallId) : undefined,
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.brain.getDashboard();
  }

  @Get('report')
  report() {
    return this.brain.getLastReport();
  }

  @Post('offline/think')
  offlineThink(@Body() body: BrainContextInput) {
    return this.brain.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.brain.syncOffline();
  }
}
