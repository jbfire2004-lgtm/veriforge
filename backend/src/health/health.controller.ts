import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  liveness() {
    return this.health.liveness();
  }

  @Public()
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async readiness() {
    return this.health.readiness();
  }

  @Public()
  @Get('health/synthetic')
  @HttpCode(HttpStatus.OK)
  async syntheticProbe() {
    const [live, ready] = await Promise.all([
      Promise.resolve(this.health.liveness()),
      this.health.readiness(),
    ]);
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      checks: {
        liveness: live,
        readiness: ready,
      },
    };
  }
}
