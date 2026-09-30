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

@Controller(`${API_V1_PREFIX}/pm/safety-stations`)
export class PmSafetyStationsController {
  constructor(
    private readonly stations: PmSafetyStationsService,
    private readonly cail: PmSafetyStationsCailIntelligenceService,
  ) {}

  @Post('device/heartbeat/:code')
  deviceHeartbeat(
    @Param('code') code: string,
    @Body()
    body: {
      batteryLevel?: number;
      storageFreeMb?: number;
      sensorHealth?: Record<string, boolean>;
      firmwareVersion?: string;
      online?: boolean;
      payload?: Record<string, unknown>;
    },
  ) {
    return this.stations.recordHeartbeat(code, body);
  }

  @Post('device/validate-worker')
  deviceValidateWorker(
    @Body()
    body: {
      stationCode: string;
      workerId: number;
      projectId: number;
      zoneCode?: string;
      equipmentId?: number;
      action?: PmSafetyStationAccessAction;
      clientSyncId?: string;
    },
  ) {
    return this.stations.validateWorker(body);
  }

  @Post('device/validate-equipment')
  deviceValidateEquipment(
    @Body()
    body: {
      stationCode: string;
      equipmentId: number;
      workerId?: number;
      projectId?: number;
      clientSyncId?: string;
    },
  ) {
    return this.stations.validateEquipment(body);
  }

  @Post('device/muster-check-in')
  deviceMusterCheckIn(
    @Body()
    body: {
      stationCode: string;
      workerId: number;
      musterPointCode?: string;
      geoJson?: Record<string, unknown>;
      clientSyncId?: string;
    },
  ) {
    return this.stations.musterCheckIn(body);
  }

  @Post('device/offline-sync/:stationId')
  deviceOfflineSync(
    @Param('stationId', ParseIntPipe) stationId: number,
    @Body()
    body: {
      accessLogs?: Array<Record<string, unknown>>;
      equipmentLogs?: Array<Record<string, unknown>>;
      musterLogs?: Array<Record<string, unknown>>;
      attachments?: Array<Record<string, unknown>>;
    },
  ) {
    return this.stations.applyOfflineSync(stationId, body);
  }

  @Get('device/offline-bundle/:stationId')
  deviceOfflineBundle(@Param('stationId', ParseIntPipe) stationId: number) {
    return this.stations.buildOfflineBundle(stationId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Post('register')
  register(
    @Body()
    body: Parameters<PmSafetyStationsService['register']>[0],
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.register({ ...body, actorId: req.user.id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SUPERVISOR_ROLES)
  @Put(':id/activate')
  activate(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.activate(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SUPERVISOR_ROLES)
  @Put(':id/deactivate')
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.deactivate(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get()
  list(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('siteId') siteId?: string,
    @Query('stationType') stationType?: string,
  ) {
    return this.stations.list({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      siteId: siteId ? parseInt(siteId, 10) : undefined,
      stationType,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get('health')
  health(
    @Query('projectId') projectId?: string,
    @Query('siteId') siteId?: string,
  ) {
    return this.stations.stationHealth(
      projectId ? parseInt(projectId, 10) : undefined,
      siteId ? parseInt(siteId, 10) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Post('validate-worker')
  validateWorker(
    @Body()
    body: Parameters<PmSafetyStationsService['validateWorker']>[0],
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.validateWorker({ ...body, actorId: req.user.id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Post('validate-equipment')
  validateEquipment(
    @Body()
    body: Parameters<PmSafetyStationsService['validateEquipment']>[0],
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.validateEquipment({ ...body, actorId: req.user.id });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Post('muster/check-in')
  musterCheckIn(
    @Body() body: Parameters<PmSafetyStationsService['musterCheckIn']>[0],
  ) {
    return this.stations.musterCheckIn(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get('muster/status')
  musterStatus(@Query('projectId') projectId: string) {
    return this.stations.musterStatus(parseInt(projectId, 10));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...SUPERVISOR_ROLES)
  @Put(':id/emergency-mode')
  emergencyMode(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { active: boolean },
    @Req() req: { user: { id: number } },
  ) {
    return this.stations.setEmergencyMode(id, body.active, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get(':id/emergency-payload')
  emergencyPayload(@Param('id', ParseIntPipe) id: number) {
    return this.stations.emergencyPayload(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get(':id/offline-bundle')
  offlineBundle(@Param('id', ParseIntPipe) id: number) {
    return this.stations.buildOfflineBundle(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Post(':id/offline-sync')
  offlineSync(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Parameters<PmSafetyStationsService['applyOfflineSync']>[1],
  ) {
    return this.stations.applyOfflineSync(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Post('attachments')
  addAttachment(
    @Body() body: Parameters<PmSafetyStationsService['addAttachment']>[0],
  ) {
    return this.stations.addAttachment(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get('access-logs')
  accessLogs(
    @Query('stationId') stationId?: string,
    @Query('projectId') projectId?: string,
    @Query('workerId') workerId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stations.accessLogs({
      stationId: stationId ? parseInt(stationId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      workerId: workerId ? parseInt(workerId, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get('equipment-logs')
  equipmentLogs(
    @Query('stationId') stationId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stations.equipmentLogs(
      stationId ? parseInt(stationId, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get('analytics')
  analytics(@Query('projectId') projectId: string) {
    return this.stations.analytics(parseInt(projectId, 10));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get('cail/insights')
  cailInsights(@Query('projectId') projectId: string) {
    return this.cail.projectInsights(parseInt(projectId, 10));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get(':id')
  getStation(@Param('id', ParseIntPipe) id: number) {
    return this.stations.getStation(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get(':id/predict')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Get(':stationId/heartbeats')
  heartbeats(
    @Param('stationId', ParseIntPipe) stationId: number,
    @Query('limit') limit?: string,
  ) {
    return this.stations.listHeartbeats(
      stationId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @Post('heartbeat/:code')
  heartbeat(
    @Param('code') code: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.stations.recordHeartbeat(code, body as never);
  }
}
