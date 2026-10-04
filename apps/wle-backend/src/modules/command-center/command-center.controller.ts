import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { CommandCenterService } from './command-center.service';
import type { CommandContextInput } from '@vera/command-center';

@Controller(`${API_V1_PREFIX}/command-center`)
export class CommandCenterController {
  constructor(private readonly commandCenter: CommandCenterService) {}

  @Post('refresh')
  refresh(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('unionHallId') unionHallId?: string,
  ) {
    return this.commandCenter.refreshCompany(
      Number(companyId),
      projectId ? Number(projectId) : undefined,
      unionHallId ? Number(unionHallId) : undefined,
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.commandCenter.getDashboard();
  }

  @Get('report')
  report() {
    return this.commandCenter.getLastReport();
  }

  @Post('offline/refresh')
  offlineRefresh(@Body() body: CommandContextInput) {
    return this.commandCenter.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.commandCenter.syncOffline();
  }
}
