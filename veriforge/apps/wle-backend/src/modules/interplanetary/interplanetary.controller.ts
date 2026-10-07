import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { InterplanetaryService } from './interplanetary.service';
import type { InterplanetaryContextInput } from '@vera/interplanetary';

@Controller(`${API_V1_PREFIX}/interplanetary`)
export class InterplanetaryController {
  constructor(private readonly interplanetary: InterplanetaryService) {}

  @Post('operate')
  operate(@Query('companyId') companyId?: string) {
    return this.interplanetary.operate(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.interplanetary.getDashboard();
  }

  @Get('report')
  report() {
    return this.interplanetary.getLastReport();
  }

  @Post('offline/operate')
  offlineOperate(@Body() body: InterplanetaryContextInput) {
    return this.interplanetary.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.interplanetary.syncOffline();
  }
}
