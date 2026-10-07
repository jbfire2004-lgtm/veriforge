import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { CivilizationService } from './civilization.service';
import type { CivilizationContextInput } from '@vera/civilization';

@Controller(`${API_V1_PREFIX}/civilization`)
export class CivilizationController {
  constructor(private readonly civilization: CivilizationService) {}

  @Post('govern')
  govern(@Query('companyId') companyId?: string) {
    return this.civilization.govern(companyId ? Number(companyId) : undefined);
  }

  @Get('dashboard')
  dashboard() {
    return this.civilization.getDashboard();
  }

  @Get('report')
  report() {
    return this.civilization.getLastReport();
  }

  @Post('offline/govern')
  offlineGovern(@Body() body: CivilizationContextInput) {
    return this.civilization.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.civilization.syncOffline();
  }
}
