import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdoptionEventService } from './adoption-event.service';
import { TrackEventDto } from './dto/track-event.dto';

type AuthReq = { user: { id: number; companyId?: number | null } };

@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard)
export class AdoptionAnalyticsIngestController {
  constructor(private readonly events: AdoptionEventService) {}

  @Post('event')
  trackEvent(@Req() req: AuthReq, @Body() body: TrackEventDto) {
    const companyId = body.companyId ?? req.user.companyId;
    if (!companyId) {
      return { ok: false, reason: 'companyId required' };
    }
    this.events.track({
      companyId,
      userId: body.userId ?? req.user.id,
      event: body.event,
      metadata: body.metadata,
    });
    return { ok: true, queued: true };
  }
}
