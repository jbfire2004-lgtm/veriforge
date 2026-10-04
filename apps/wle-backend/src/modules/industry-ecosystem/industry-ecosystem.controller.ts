import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { IndustryEcosystemService } from './industry-ecosystem.service';
import type { IndustryContextInput } from '@vera/industry-ecosystem';

@Controller(`${API_V1_PREFIX}/industry-ecosystem`)
export class IndustryEcosystemController {
  constructor(private readonly ecosystem: IndustryEcosystemService) {}

  @Post('orchestrate')
  orchestrate(@Query('companyId') companyId?: string) {
    return this.ecosystem.orchestrateIndustry(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.ecosystem.getDashboard();
  }

  @Get('report')
  report() {
    return this.ecosystem.getLastReport();
  }

  @Post('offline/orchestrate')
  offlineOrchestrate(@Body() body: IndustryContextInput) {
    return this.ecosystem.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.ecosystem.syncOffline();
  }
}
