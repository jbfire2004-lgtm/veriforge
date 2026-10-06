import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  PmWorkerMedicalRestrictionType,
  PmWorkerSafetyOverrideType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmWorkerSafetyProfileService } from './pm-worker-safety-profile.service';
import { PmWorkerSafetyCailIntelligenceService } from './pm-worker-safety-cail-intelligence.service';

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

@Controller(`${API_V1_PREFIX}/pm/worker-safety-profile`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmWorkerSafetyProfileController {
  constructor(
    private readonly workers: PmWorkerSafetyProfileService,
    private readonly cail: PmWorkerSafetyCailIntelligenceService,
  ) {}

  @Get(':workerId')
  getProfile(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.workers.getFullProfile(
      parseInt(workerId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post(':workerId/rebuild')
  @Roles(...SUPERVISOR_ROLES)
  rebuild(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId?: string,
    @Req() req?: { user: { id: number } },
  ) {
    return this.workers.rebuildProfile(
      parseInt(workerId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
      req?.user?.id,
    );
  }

  @Post('enforcement/evaluate')
  evaluateEnforcement(
    @Body()
    body: {
      workerId: number;
      projectId: number;
      zoneCode?: string;
      equipmentId?: number;
    },
  ) {
    return this.workers.enforcementGate(
      body.workerId,
      body.projectId,
      body.zoneCode,
      body.equipmentId,
    );
  }

  @Get(':workerId/training')
  listTraining(@Param('workerId') workerId: string) {
    return this.workers.listTraining(parseInt(workerId, 10));
  }

  @Get(':workerId/authorizations')
  listAuthorizations(@Param('workerId') workerId: string) {
    return this.workers.listAuthorizations(parseInt(workerId, 10));
  }

  @Get(':workerId/hazard-exposure')
  listHazardExposure(@Param('workerId') workerId: string) {
    return this.workers.listHazardExposure(parseInt(workerId, 10));
  }

  @Get(':workerId/medical-restrictions')
  listMedical(@Param('workerId') workerId: string) {
    return this.workers.listMedicalRestrictions(parseInt(workerId, 10));
  }

  @Post(':workerId/medical-restrictions')
  @Roles(...SUPERVISOR_ROLES)
  addMedical(
    @Param('workerId') workerId: string,
    @Body()
    body: {
      restrictionType: PmWorkerMedicalRestrictionType;
      description: string;
      blocksHighRisk?: boolean;
      blocksConfinedSpace?: boolean;
      blocksHotWork?: boolean;
      blocksEquipment?: boolean;
      expiresAt?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.addMedicalRestriction(
      parseInt(workerId, 10),
      body,
      req.user.id,
    );
  }

  @Get(':workerId/overrides')
  listOverrides(@Param('workerId') workerId: string) {
    return this.workers.listOverrides(parseInt(workerId, 10));
  }

  @Post(':workerId/overrides')
  @Roles(...SUPERVISOR_ROLES)
  createOverride(
    @Param('workerId') workerId: string,
    @Body()
    body: {
      overrideType: PmWorkerSafetyOverrideType;
      ruleKey: string;
      reason: string;
      expiresAt: string;
      projectId?: number;
      supervisorSig?: string;
      safetySig?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.createOverride(
      parseInt(workerId, 10),
      body,
      req.user.id,
    );
  }

  @Get(':workerId/analytics')
  analytics(@Param('workerId') workerId: string) {
    return this.workers.analytics(parseInt(workerId, 10));
  }

  @Get(':workerId/cail/insights')
  cailInsights(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.cail.workerInsights(
      parseInt(workerId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('sync/:workerId')
  offlineBundle(@Param('workerId') workerId: string) {
    return this.workers.buildOfflineBundle(parseInt(workerId, 10));
  }

  @Post('sync/:workerId')
  offlineSyncUpload(
    @Param('workerId') workerId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.applyOfflineSync(
      parseInt(workerId, 10),
      body as Parameters<PmWorkerSafetyProfileService['applyOfflineSync']>[1],
      req.user.id,
    );
  }

  @Get('score/:workerId')
  safetyScore(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.workers.getWorkerSafetyScore(
      parseInt(workerId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('validate/:workerId')
  validateCompliance(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.workers.validateCompliance(
      parseInt(workerId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post(':workerId/training')
  @Roles(...SUPERVISOR_ROLES)
  upsertTraining(
    @Param('workerId') workerId: string,
    @Body()
    body: Parameters<PmWorkerSafetyProfileService['upsertTrainingSnapshot']>[1],
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.upsertTrainingSnapshot(
      parseInt(workerId, 10),
      body,
      req.user.id,
    );
  }

  @Post(':workerId/authorizations')
  @Roles(...SUPERVISOR_ROLES)
  addAuthorization(
    @Param('workerId') workerId: string,
    @Body()
    body: Parameters<PmWorkerSafetyProfileService['upsertAuthorization']>[1],
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.upsertAuthorization(
      parseInt(workerId, 10),
      body,
      req.user.id,
    );
  }

  @Post(':workerId/hazard-exposure')
  recordExposure(
    @Param('workerId') workerId: string,
    @Body()
    body: Parameters<PmWorkerSafetyProfileService['recordHazardExposure']>[1],
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.recordHazardExposure(
      parseInt(workerId, 10),
      body,
      req.user.id,
    );
  }

  @Post(':workerId/corrective-actions')
  @Roles(...SUPERVISOR_ROLES)
  linkCapa(
    @Param('workerId') workerId: string,
    @Body()
    body: Parameters<PmWorkerSafetyProfileService['linkCorrectiveAction']>[1],
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.linkCorrectiveAction(
      parseInt(workerId, 10),
      body,
      req.user.id,
    );
  }
}
