import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { GlobalNetworkService } from './global-network.service';
import type { NetworkContextInput } from '@vera/global-network';

@Controller(`${API_V1_PREFIX}/global-network`)
export class GlobalNetworkController {
  constructor(private readonly network: GlobalNetworkService) {}

  @Post('analyze')
  analyze(@Query('companyId') companyId?: string) {
    return this.network.analyzeNetwork(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.network.getDashboard();
  }

  @Get('report')
  report() {
    return this.network.getLastReport();
  }

  @Post('offline/analyze')
  offlineAnalyze(@Body() body: NetworkContextInput) {
    return this.network.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.network.syncOffline();
  }
}
