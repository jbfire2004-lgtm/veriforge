import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PublicRateLimited } from '../security/decorators/public-rate-limit.decorator';
import { AccessService } from './access.service';

/** Site gate check — public, rate-limited, minimal response (no internal tenant ids). */
@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @PublicRateLimited(30)
  @Get(':workerId/:siteId')
  check(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Param('siteId', ParseIntPipe) siteId: number,
  ) {
    return this.accessService.check(workerId, siteId);
  }
}
