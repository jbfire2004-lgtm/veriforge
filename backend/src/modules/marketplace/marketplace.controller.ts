import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { MarketplaceService } from './marketplace.service';
import type { MarketplaceContextInput } from '@vera/marketplace';

@Controller(`${API_V1_PREFIX}/marketplace`)
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Post('run')
  run(@Query('companyId') companyId?: string) {
    return this.marketplace.runMarketplace(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Get('dashboard')
  dashboard() {
    return this.marketplace.getDashboard();
  }

  @Get('report')
  report() {
    return this.marketplace.getLastReport();
  }

  @Post('offline/run')
  offlineRun(@Body() body: MarketplaceContextInput) {
    return this.marketplace.applyOffline(body);
  }

  @Post('offline/sync')
  offlineSync() {
    return this.marketplace.syncOffline();
  }
}
