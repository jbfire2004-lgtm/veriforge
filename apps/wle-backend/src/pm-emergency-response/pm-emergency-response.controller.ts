import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  PmEmergencyEventStatus,
  PmEmergencyEventType,
  PmEmergencyPlanType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmEmergencyResponseService } from './pm-emergency-response.service';
import { PmEmergencyCailIntelligenceService } from './pm-emergency-cail-intelligence.service';

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

@Controller(`${API_V1_PREFIX}/pm/emergency-response`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmEmergencyResponseController {
  constructor(
    private readonly emergency: PmEmergencyResponseService,
    private readonly cail: PmEmergencyCailIntelligenceService,
  ) {}

  @Get('plans')
  listPlans(
    @Query('companyId') companyId: string,
    @Query('siteId') siteId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.emergency.listPlans({
      companyId: parseInt(companyId, 10),
      siteId: siteId ? parseInt(siteId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Post('plans')
  @Roles(...SUPERVISOR_ROLES)
  createPlan(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.createPlan(
      body as Parameters<PmEmergencyResponseService['createPlan']>[0],
      req.user.id,
    );
  }

  @Post('plans/:id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishPlan(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.emergency.publishPlan(id, req.user.id);
  }

  @Post('plans/acknowledge')
  acknowledgePlan(
    @Body() body: { planId: string; workerId: number; signatureData?: string },
  ) {
    return this.emergency.acknowledgePlan(body);
  }

  @Post('events/declare')
  @Roles(...SUPERVISOR_ROLES)
  declareEvent(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.declareEmergency(
      body as Parameters<PmEmergencyResponseService['declareEmergency']>[0],
      req.user.id,
    );
  }

  @Put('events/:id/status')
  @Roles(...SUPERVISOR_ROLES)
  transitionEvent(
    @Param('id') id: string,
    @Body('status') status: PmEmergencyEventStatus,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.transitionEvent(id, status, req.user.id);
  }

  @Post('events/:id/attachments')
  addAttachment(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.emergency.addEventAttachment(id, body);
  }

  @Post('muster/start')
  @Roles(...SUPERVISOR_ROLES)
  startMuster(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.startMuster(
      body as Parameters<PmEmergencyResponseService['startMuster']>[0],
      req.user.id,
    );
  }

  @Get('muster/active')
  activeMuster(@Query('siteId') siteId: string) {
    return this.emergency.getActiveMuster(parseInt(siteId, 10));
  }

  @Post('muster/:id/checkin')
  checkIn(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.emergency.musterCheckIn({
      musterEventId: id,
      ...(body as object),
    } as Parameters<PmEmergencyResponseService['musterCheckIn']>[0]);
  }

  @Post('muster/:id/all-clear')
  @Roles(...SUPERVISOR_ROLES)
  allClear(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.emergency.musterAllClear(id, req.user.id);
  }

  @Post('equipment')
  @Roles(...SUPERVISOR_ROLES)
  createEquipment(@Body() body: Record<string, unknown>) {
    return this.emergency.createEmergencyEquipment(
      body as Parameters<
        PmEmergencyResponseService['createEmergencyEquipment']
      >[0],
    );
  }

  @Get('equipment')
  listEquipment(
    @Query('companyId') companyId: string,
    @Query('siteId') siteId?: string,
  ) {
    return this.emergency.listEmergencyEquipment(
      parseInt(companyId, 10),
      siteId ? parseInt(siteId, 10) : undefined,
    );
  }

  @Post('equipment/:id/inspect')
  inspectEquipment(
    @Param('id') id: string,
    @Body() body: { passed: boolean; notes?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.recordEquipmentInspection(id, body, req.user.id);
  }

  @Post('equipment/scan')
  @Roles(...SUPERVISOR_ROLES)
  scanEquipment(
    @Query('companyId') companyId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.scanEmergencyEquipment(
      parseInt(companyId, 10),
      req.user.id,
    );
  }

  @Get('access/worker')
  workerAccess(
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.emergency.workerAccessCheck(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Get('site-lock/:projectId')
  siteLock(@Param('projectId') projectId: string) {
    return this.emergency.isSiteLocked(parseInt(projectId, 10));
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.emergency.analytics(parseInt(projectId, 10));
  }

  @Get('intelligence/project/:projectId')
  intelligence(@Param('projectId') projectId: string) {
    return this.cail.projectInsights(parseInt(projectId, 10));
  }

  @Get('sync/project/:projectId')
  syncBundle(@Param('projectId') projectId: string) {
    return this.emergency.syncBundle(parseInt(projectId, 10));
  }

  @Post('sync/project/:projectId')
  applySync(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.applyOfflineSync(
      parseInt(projectId, 10),
      body as Parameters<PmEmergencyResponseService['applyOfflineSync']>[1],
      req.user.id,
    );
  }

  @Get('station/:companyId')
  station(
    @Param('companyId') companyId: string,
    @Query('siteId') siteId: string,
  ) {
    return this.emergency.stationPayload(
      parseInt(companyId, 10),
      parseInt(siteId, 10),
    );
  }
}
