import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { InterstellarService } from './interstellar.service';
import type { InterstellarContextInput } from '@vera/interstellar';

@Controller(`${API_V1_PREFIX}/interstellar`)
export class InterstellarController {
  constructor(private readonly interstellar: InterstellarService) {}

  @Post('expand')
  expand(@Query('companyId') companyId?: string) {
    return this.interstellar.expand(companyId ? Number(companyId) : undefined);
  }

  @Get('dashboard')
  dashboard() {
    return this.interstellar.getDashboard();
  }

  @Get('report')
  report() {
    return this.interstellar.getLastReport();
  }

  @Post('offline/expand')
  offlineExpand(@Body() body: InterstellarContextInput) {
    return this.interstellar.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.interstellar.syncOffline();
  }
}
