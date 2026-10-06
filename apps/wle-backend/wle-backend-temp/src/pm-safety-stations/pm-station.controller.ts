import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PmSafetyStationAccessAction, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmSafetyStationsService } from './pm-safety-stations.service';
import { PmSafetyStationsCailIntelligenceService } from './pm-safety-stations-cail-intelligence.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

const SUPERVISOR_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Spec-aligned alias: `/api/v1/pm/station` */
@Controller(`${API_V1_PREFIX}/pm/station`)
export class PmStationController {
  constructor(
    private readonly stations: PmSafetyStationsService,
    private readonly cail: PmSafetyStationsCailIntelligenceService,
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SUPERVISOR_ROLES)
  register(
    @Body() body: Parameters<PmSafetyStationsService['register']>[0],
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.register({ ...body, actorId: req.user.id });
  }

  @Post('heartbeat')
  heartbeat(
    @Body()
    body: {
      stationCode: string;
      batteryLevel?: number;
      storageFreeMb?: number;
      sensorHealth?: Record<string, boolean>;
      firmwareVersion?: string;
      online?: boolean;
    },
  ) {
    return this.stations.recordHeartbeat(body.stationCode, body);
  }

  @Post('validate/worker')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  validateWorker(
    @Body()
    body: {
      stationCode?: string;
      stationId?: number;
      workerId: number;
      projectId: number;
      zoneCode?: string;
      equipmentId?: number;
      action?: PmSafetyStationAccessAction;
      clientSyncId?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.validateWorker({ ...body, actorId: req.user.id });
  }

  @Post('validate/equipment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  validateEquipment(
    @Body()
    body: {
      stationCode?: string;
      stationId?: number;
      equipmentId: number;
      workerId?: number;
      projectId?: number;
      clientSyncId?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.validateEquipment({ ...body, actorId: req.user.id });
  }

  @Post('muster/checkin')
  musterCheckIn(
    @Body() body: Parameters<PmSafetyStationsService['musterCheckIn']>[0],
  ) {
    return this.stations.musterCheckIn(body);
  }

  @Post('emergency/mode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SUPERVISOR_ROLES)
  emergencyMode(
    @Body() body: { stationId: number; active: boolean },
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.setEmergencyMode(
      body.stationId,
      body.active,
      req.user.id,
    );
  }

  @Post('offline/sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  offlineSync(
    @Body()
    body: {
      stationId: number;
      accessLogs?: Array<Record<string, unknown>>;
      equipmentLogs?: Array<Record<string, unknown>>;
      musterLogs?: Array<Record<string, unknown>>;
      attachments?: Array<Record<string, unknown>>;
    },
  ) {
    return this.stations.applyOfflineSync(body.stationId, body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  getStation(@Param('id', ParseIntPipe) id: number) {
    return this.stations.getStation(id);
  }

  @Get(':id/predict')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  predict(
    @Param('id', ParseIntPipe) id: number,
    @Query('workerId') workerId?: string,
  ) {
    return this.stations.getStation(id).then(async (station) => {
      if (!station.projectId) return { stationId: id };
      const bundle = await this.cail.stationRiskBundle(
        station.projectId,
        workerId ? parseInt(workerId, 10) : undefined,
      );
      const insights = await this.cail.projectInsights(station.projectId);
      return { stationId: id, ...bundle, insights };
    });
  }
}
