import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { StationHeartbeatService } from './station-heartbeat.service';

const PM_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety/stations`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class StationHeartbeatController {
  constructor(private readonly stations: StationHeartbeatService) {}

  @Post('heartbeat/:code')
  heartbeat(
    @Param('code') code: string,
    @Body() body: { payload?: Record<string, unknown> },
  ) {
    return this.stations.recordHeartbeat(code, body.payload);
  }

  @Get('health')
  health(@Query('siteId') siteId?: string) {
    return this.stations.stationHealth(
      siteId ? parseInt(siteId, 10) : undefined,
    );
  }

  @Get(':stationId/heartbeats')
  history(@Param('stationId') stationId: string) {
    return this.stations.listHeartbeats(parseInt(stationId, 10));
  }
}
