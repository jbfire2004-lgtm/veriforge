import {
  BadRequestException,
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
  PmEquipmentOperationalStatus,
  PmEquipmentSafetyCategory,
  PmEquipmentFailureStatus,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { toSecurityActor } from '../security/actor.util';
import { TenantScopeService } from '../security/tenant-scope.service';
import type { SecurityActor } from '../security/security.types';
import { PmEquipmentSafetyService } from './pm-equipment-safety.service';
import { PmEquipmentCailIntelligenceService } from './pm-equipment-cail-intelligence.service';

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

const PROFILE_UPDATE_KEYS = [
  'name',
  'serialNumber',
  'manufacturer',
  'model',
  'yearMade',
  'capacity',
  'safetyCategory',
  'operationalStatus',
  'loadChartJson',
  'pmSafetyMetadataJson',
] as const;

type ProfileUpdateBody = {
  name?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  yearMade?: number;
  capacity?: string;
  safetyCategory?: PmEquipmentSafetyCategory;
  operationalStatus?: PmEquipmentOperationalStatus;
  loadChartJson?: Record<string, unknown>;
  pmSafetyMetadataJson?: Record<string, unknown>;
};

@Controller(`${API_V1_PREFIX}/pm/equipment-safety`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmEquipmentSafetyController {
  constructor(
    private readonly equipment: PmEquipmentSafetyService,
    private readonly cail: PmEquipmentCailIntelligenceService,
    private readonly tenant: TenantScopeService,
  ) {}

  private actor(req: { user?: SecurityActor }): SecurityActor {
    return toSecurityActor(req.user!);
  }

  private parseOptionalCompanyId(raw?: string): number | undefined {
    if (!raw) return undefined;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  private pickProfileUpdate(body: Record<string, unknown>): ProfileUpdateBody {
    const out: ProfileUpdateBody = {};
    for (const key of PROFILE_UPDATE_KEYS) {
      if (body[key] !== undefined) {
        (out as Record<string, unknown>)[key] = body[key];
      }
    }
    return out;
  }

  @Get('profiles')
  listProfiles(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('safetyCategory') safetyCategory?: PmEquipmentSafetyCategory,
    @Query('operationalStatus')
    operationalStatus?: PmEquipmentOperationalStatus,
  ) {
    const actor = this.actor(req);
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      this.parseOptionalCompanyId(companyId),
    );
    return this.equipment.listProfiles({
      companyId: effectiveCompanyId,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      safetyCategory,
      operationalStatus,
    });
  }

  @Get('profiles/:id')
  async getProfile(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const equipmentId = parseInt(id, 10);
    await this.tenant.assertEquipmentInTenant(this.actor(req), equipmentId);
    return this.equipment.getProfile(equipmentId);
  }

  @Put('profiles/:id')
  @Roles(...SUPERVISOR_ROLES)
  async updateProfile(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user?: SecurityActor },
  ) {
    const equipmentId = parseInt(id, 10);
    const actor = this.actor(req);
    await this.tenant.assertEquipmentInTenant(actor, equipmentId);
    return this.equipment.updateProfile(
      equipmentId,
      this.pickProfileUpdate(body),
      actor.userId ?? actor.id,
    );
  }

  @Post('profiles/:id/condition')
  async recalculateCondition(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
    @Query('projectId') projectId?: string,
  ) {
    const equipmentId = parseInt(id, 10);
    await this.tenant.assertEquipmentInTenant(this.actor(req), equipmentId);
    return this.equipment.recalculateCondition(
      equipmentId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('profiles/:id/certifications')
  async listCertifications(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const equipmentId = parseInt(id, 10);
    await this.tenant.assertEquipmentInTenant(this.actor(req), equipmentId);
    return this.equipment.listCertifications(equipmentId);
  }

  @Post('certifications')
  @Roles(...SUPERVISOR_ROLES)
  async createCertification(
    @Body() body: Record<string, unknown>,
    @Req() req: { user?: SecurityActor },
  ) {
    const actor = this.actor(req);
    const equipmentId = Number(body.equipmentId);
    if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
      throw new BadRequestException('equipmentId required');
    }
    await this.tenant.assertEquipmentInTenant(actor, equipmentId);
    return this.equipment.createCertification(
      body as Parameters<PmEquipmentSafetyService['createCertification']>[0],
      actor.userId ?? actor.id,
    );
  }

  @Post('certifications/:id/approve')
  @Roles(...SUPERVISOR_ROLES)
  approveCertification(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const actor = this.actor(req);
    return this.equipment.approveCertification(id, actor.userId ?? actor.id);
  }

  @Post('certifications/flag-expired')
  @Roles(...SUPERVISOR_ROLES)
  flagExpired(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId?: string,
  ) {
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      this.actor(req),
      this.parseOptionalCompanyId(companyId),
    );
    return this.equipment.flagExpiredCertifications(effectiveCompanyId);
  }

  @Post('inspections/register')
  async registerInspection(
    @Body() body: Record<string, unknown>,
    @Req() req: { user?: SecurityActor },
  ) {
    const equipmentId = Number(body.equipmentId);
    if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
      throw new BadRequestException('equipmentId required');
    }
    await this.tenant.assertEquipmentInTenant(this.actor(req), equipmentId);
    return this.equipment.registerEquipmentInspection(
      body as Parameters<
        PmEquipmentSafetyService['registerEquipmentInspection']
      >[0],
    );
  }

  @Post('failures')
  async reportFailure(
    @Body() body: Record<string, unknown>,
    @Req() req: { user?: SecurityActor },
  ) {
    const actor = this.actor(req);
    const equipmentId = Number(body.equipmentId);
    if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
      throw new BadRequestException('equipmentId required');
    }
    await this.tenant.assertEquipmentInTenant(actor, equipmentId);
    return this.equipment.reportFailure(
      body as Parameters<PmEquipmentSafetyService['reportFailure']>[0],
      actor.userId ?? actor.id,
    );
  }

  @Put('failures/:id/status')
  @Roles(...SUPERVISOR_ROLES)
  transitionFailure(
    @Param('id') id: string,
    @Body('status') status: PmEquipmentFailureStatus,
    @Req() req: { user?: SecurityActor },
  ) {
    const actor = this.actor(req);
    return this.equipment.transitionFailure(
      id,
      status,
      actor.userId ?? actor.id,
    );
  }

  @Get('loto/equipment/:equipmentId')
  async listLoto(
    @Param('equipmentId') equipmentId: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const id = parseInt(equipmentId, 10);
    await this.tenant.assertEquipmentInTenant(this.actor(req), id);
    return this.equipment.listActiveLoto(id);
  }

  @Post('loto')
  async createLoto(
    @Body() body: Record<string, unknown>,
    @Req() req: { user?: SecurityActor },
  ) {
    const actor = this.actor(req);
    const equipmentId = Number(body.equipmentId);
    if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
      throw new BadRequestException('equipmentId required');
    }
    await this.tenant.assertEquipmentInTenant(actor, equipmentId);
    return this.equipment.createLoto(
      body as Parameters<PmEquipmentSafetyService['createLoto']>[0],
      actor.userId ?? actor.id,
    );
  }

  @Post('loto/:id/verify')
  @Roles(...SUPERVISOR_ROLES)
  verifyLoto(@Param('id') id: string, @Req() req: { user?: SecurityActor }) {
    const actor = this.actor(req);
    return this.equipment.verifyLoto(id, actor.userId ?? actor.id);
  }

  @Post('loto/:id/remove')
  @Roles(...SUPERVISOR_ROLES)
  removeLoto(@Param('id') id: string, @Req() req: { user?: SecurityActor }) {
    const actor = this.actor(req);
    return this.equipment.removeLoto(id, actor.userId ?? actor.id);
  }

  @Get('authorizations')
  listAuthorizations(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId?: string,
    @Query('workerId') workerId?: string,
    @Query('equipmentId') equipmentId?: string,
  ) {
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      this.actor(req),
      this.parseOptionalCompanyId(companyId),
    );
    return this.equipment.listAuthorizations({
      companyId: effectiveCompanyId,
      workerId: workerId ? parseInt(workerId, 10) : undefined,
      equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
    });
  }

  @Post('authorizations')
  @Roles(...SUPERVISOR_ROLES)
  async grantAuthorization(
    @Body() body: Record<string, unknown>,
    @Req() req: { user?: SecurityActor },
  ) {
    const actor = this.actor(req);
    const equipmentId = Number(body.equipmentId);
    if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
      throw new BadRequestException('equipmentId required');
    }
    await this.tenant.assertEquipmentInTenant(actor, equipmentId);
    return this.equipment.grantAuthorization(
      body as Parameters<PmEquipmentSafetyService['grantAuthorization']>[0],
      actor.userId ?? actor.id,
    );
  }

  @Get('authorizations/validate')
  async validateAuth(
    @Req() req: { user?: SecurityActor },
    @Query('workerId') workerId: string,
    @Query('equipmentId') equipmentId: string,
  ) {
    const actor = this.actor(req);
    const eqId = parseInt(equipmentId, 10);
    const wId = parseInt(workerId, 10);
    await this.tenant.assertEquipmentInTenant(actor, eqId);
    await this.tenant.assertWorkerInTenant(actor, wId);
    return this.equipment.validateWorkerAuthorization(wId, eqId);
  }

  @Post('assignments/validate')
  async validateAssignment(
    @Body() body: { workerId: number; equipmentId: number; projectId?: number },
    @Req() req: { user?: SecurityActor },
  ) {
    const actor = this.actor(req);
    await this.tenant.assertEquipmentInTenant(actor, body.equipmentId);
    await this.tenant.assertWorkerInTenant(actor, body.workerId);
    return this.equipment.validateAssignment({
      ...body,
      actorId: actor.userId ?? actor.id,
    });
  }

  @Get('access/worker')
  async workerAccess(
    @Req() req: { user?: SecurityActor },
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    const wId = parseInt(workerId, 10);
    await this.tenant.assertWorkerInTenant(this.actor(req), wId);
    return this.equipment.workerAccessCheck(wId, parseInt(projectId, 10));
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.equipment.analytics(parseInt(projectId, 10));
  }

  @Get('intelligence/project/:projectId')
  intelligence(@Param('projectId') projectId: string) {
    return this.cail.projectInsights(parseInt(projectId, 10));
  }

  @Get('intelligence/operator/:workerId')
  async operatorRisk(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const wId = parseInt(workerId, 10);
    await this.tenant.assertWorkerInTenant(this.actor(req), wId);
    return this.cail.operatorRiskScore(wId, parseInt(projectId, 10));
  }

  @Get('sync/project/:projectId')
  syncBundle(@Param('projectId') projectId: string) {
    return this.equipment.syncBundle(parseInt(projectId, 10));
  }

  @Post('sync/project/:projectId')
  applySync(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user?: SecurityActor },
  ) {
    const actor = this.actor(req);
    return this.equipment.applyOfflineSync(
      parseInt(projectId, 10),
      body as Parameters<PmEquipmentSafetyService['applyOfflineSync']>[1],
      actor.userId ?? actor.id,
    );
  }

  @Get('station/:companyId')
  stationPayload(
    @Param('companyId') companyId: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      this.actor(req),
      parseInt(companyId, 10),
    );
    return this.equipment.stationPayload(effectiveCompanyId);
  }
}
