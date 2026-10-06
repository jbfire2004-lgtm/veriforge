import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { DigitalTwinService } from './digital-twin.service';
import type { TwinEventPayload, TwinType } from '@vera/digital-twin';

@Controller(`${API_V1_PREFIX}/twins`)
export class DigitalTwinController {
  constructor(private readonly twins: DigitalTwinService) {}

  @Post('hydrate')
  hydrate(@Query('companyId') companyId: string) {
    return this.twins.hydrateCompany(Number(companyId));
  }

  @Get('dashboard')
  dashboard() {
    return this.twins.getDashboard();
  }

  @Get(':type/:id')
  getTwin(@Param('type') type: TwinType, @Param('id') id: string) {
    return this.twins.getTwin(type, id);
  }

  @Get(':type/:id/timeline')
  timeline(@Param('type') type: TwinType, @Param('id') id: string) {
    return this.twins.getTimeline(type, id);
  }

  @Get(':type/:id/history')
  history(@Param('type') type: TwinType, @Param('id') id: string) {
    return this.twins.getHistory(type, id);
  }

  @Post('events')
  applyEvent(@Body() body: TwinEventPayload) {
    return this.twins.applyEvent(body);
  }

  @Post('offline/events')
  offlineEvent(@Body() body: TwinEventPayload & { clientVersion: number }) {
    this.twins.applyOfflineEvent(body, body.clientVersion ?? 1);
    return { ok: true };
  }

  @Post(':type/:id/sync')
  sync(@Param('type') type: TwinType, @Param('id') id: string) {
    return this.twins.syncTwin(type, id);
  }
}
