import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  PmWorkerAuthorizationType,
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

/** Spec-aligned alias: `/api/v1/pm/worker/safety` */
@Controller(`${API_V1_PREFIX}/pm/worker/safety`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmWorkerSafetyController {
  constructor(
    private readonly workers: PmWorkerSafetyProfileService,
    private readonly cail: PmWorkerSafetyCailIntelligenceService,
  ) {}

  @Post('profile')
  profile(
    @Body()
    body: {
      workerId: number;
      rebuild?: boolean;
      projectId?: number;
      roleType?: string;
      tradeCode?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    if (body.rebuild) {
      return this.workers.rebuildProfile(
        body.workerId,
        body.projectId,
        req.user.id,
      );
    }
    if (body.roleType || body.tradeCode) {
      return this.workers
        .updateWorkerIdentity(
          body.workerId,
          { roleType: body.roleType, tradeCode: body.tradeCode },
          req.user.id,
        )
        .then((profile) => ({ profile }));
    }
    return this.workers.getFullProfile(body.workerId, body.projectId);
  }

  @Post('training')
  @Roles(...SUPERVISOR_ROLES)
  training(
    @Body()
    body: {
      workerId: number;
      trainingCode: string;
      courseName: string;
      completedAt?: string;
      expiryDate?: string;
      expiresAt?: string;
      competencyLevel?: number;
      certificatePath?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.upsertTrainingSnapshot(
      body.workerId,
      {
        trainingCode: body.trainingCode,
        courseName: body.courseName,
        completedAt: body.completedAt,
        expiresAt: body.expiryDate ?? body.expiresAt,
        competencyLevel: body.competencyLevel,
        certificatePath: body.certificatePath,
      },
      req.user.id,
    );
  }

  @Post('authorization')
  @Roles(...SUPERVISOR_ROLES)
  authorization(
    @Body()
    body: {
      workerId: number;
      equipmentType?: string;
      authType?: PmWorkerAuthorizationType;
      authorizationType?: PmWorkerAuthorizationType;
      equipmentId?: number;
      issueDate?: string;
      issuedAt?: string;
      expiryDate?: string;
      expiresAt?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    const authType =
      body.authType ??
      body.authorizationType ??
      (body.equipmentType as PmWorkerAuthorizationType) ??
      'forklift_operator';
    return this.workers.upsertAuthorization(
      body.workerId,
      {
        authType,
        equipmentId: body.equipmentId,
        issuedAt: body.issueDate ?? body.issuedAt,
        expiresAt: body.expiryDate ?? body.expiresAt,
      },
      req.user.id,
    );
  }

  @Post('restriction')
  @Roles(...SUPERVISOR_ROLES)
  restriction(
    @Body()
    body: {
      workerId: number;
      restrictionType: PmWorkerMedicalRestrictionType;
      description: string;
      expiry?: string;
      expiresAt?: string;
      blocksHighRisk?: boolean;
      blocksConfinedSpace?: boolean;
      blocksHotWork?: boolean;
      blocksEquipment?: boolean;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.addMedicalRestriction(
      body.workerId,
      {
        restrictionType: body.restrictionType,
        description: body.description,
        expiresAt: body.expiry ?? body.expiresAt,
        blocksHighRisk: body.blocksHighRisk,
        blocksConfinedSpace: body.blocksConfinedSpace,
        blocksHotWork: body.blocksHotWork,
        blocksEquipment: body.blocksEquipment,
      },
      req.user.id,
    );
  }

  @Post('exposure')
  exposure(
    @Body()
    body: {
      workerId: number;
      hazardId?: string;
      hazardType?: string;
      severity?: number;
      likelihood?: number;
      exposureDate?: string;
      projectId?: number;
      sifPotential?: boolean;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.recordHazardExposure(
      body.workerId,
      {
        hazardType: body.hazardType ?? body.hazardId ?? 'site_specific',
        severity: body.severity,
        likelihood: body.likelihood,
        exposureDate: body.exposureDate,
        projectId: body.projectId,
        sifPotential: body.sifPotential,
        sourceId: body.hazardId,
      },
      req.user.id,
    );
  }

  @Post('corrective')
  @Roles(...SUPERVISOR_ROLES)
  corrective(
    @Body()
    body: {
      workerId: number;
      correctiveActionId?: string;
      corrective_action_id?: string;
      status?: string;
      dueDate?: string;
      due_date?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.linkCorrectiveAction(
      body.workerId,
      {
        correctiveActionId:
          body.correctiveActionId ?? body.corrective_action_id ?? '',
        status: body.status,
        dueDate: body.dueDate ?? body.due_date,
      },
      req.user.id,
    );
  }

  @Post('override')
  @Roles(...SUPERVISOR_ROLES)
  override(
    @Body()
    body: {
      workerId: number;
      overrideType: PmWorkerSafetyOverrideType;
      ruleKey: string;
      reason: string;
      expiry?: string;
      expiresAt?: string;
      projectId?: number;
      supervisorSig?: string;
      safetySig?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.workers.createOverride(
      body.workerId,
      {
        overrideType: body.overrideType,
        ruleKey: body.ruleKey,
        reason: body.reason,
        expiresAt:
          body.expiry ??
          body.expiresAt ??
          new Date(Date.now() + 86400000).toISOString(),
        projectId: body.projectId,
        supervisorSig: body.supervisorSig,
        safetySig: body.safetySig,
      },
      req.user.id,
    );
  }

  @Post('offline/sync')
  offlineSync(
    @Body() body: { workerId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { workerId, ...payload } = body;
    return this.workers.applyOfflineSync(
      workerId,
      payload as Parameters<
        PmWorkerSafetyProfileService['applyOfflineSync']
      >[1],
      req.user.id,
    );
  }

  @Get(':workerId/score')
  score(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Query('projectId') projectId?: string,
  ) {
    return this.workers.getWorkerSafetyScore(
      workerId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get(':workerId/analytics')
  analytics(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.workers.analytics(workerId);
  }

  @Get(':workerId/cail')
  cailBundle(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Query('projectId') projectId?: string,
  ) {
    const pid = projectId ? parseInt(projectId, 10) : undefined;
    return Promise.all([
      this.cail.workerInsights(workerId, pid),
      this.cail.predictTrainingNeeds(workerId),
      this.cail.predictAuthorizationNeeds(workerId),
      this.workers.getWorkerSafetyScore(workerId, pid),
    ]).then(([insights, trainingNeeds, authorizationNeeds, score]) => ({
      insights,
      trainingNeeds,
      authorizationNeeds,
      score: score.score,
      complianceState: score.complianceState,
      incidentForecast: score.incidentForecast,
    }));
  }
}
