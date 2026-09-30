import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  PmCompanyControlType,
  PmCompanyHazardCategory,
  PmCompanyPolicyType,
  PmCompanySafetyOverrideType,
  PmCompanyTrainingCategory,
  PmCompanyTrainingRoleType,
  PmEmergencyPlanType,
  PmAccessZoneType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { toSecurityActor } from '../security/actor.util';
import { TenantScopeService } from '../security/tenant-scope.service';
import type { SecurityActor } from '../security/security.types';
import { PmCompanySafetyContextService } from './pm-company-safety-context.service';
import { PmCompanySafetyCailIntelligenceService } from './pm-company-safety-cail-intelligence.service';

const PM_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Spec-aligned alias: `/api/v1/pm/company/safety` */
@Controller(`${API_V1_PREFIX}/pm/company/safety`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmCompanySafetyController {
  constructor(
    private readonly company: PmCompanySafetyContextService,
    private readonly cail: PmCompanySafetyCailIntelligenceService,
    private readonly tenant: TenantScopeService,
  ) {}

  private resolveCompany(
    req: { user?: SecurityActor },
    requested?: number,
  ): { companyId: number; actorId: number } {
    const actor = toSecurityActor(req.user!);
    return {
      companyId: this.tenant.effectiveCompanyId(actor, requested),
      actorId: actor.userId ?? actor.id,
    };
  }

  @Post('profile')
  profile(
    @Body()
    body: {
      companyId: number;
      autoGenerate?: boolean;
      publish?: boolean;
      updates?: Record<string, unknown>;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    if (body.autoGenerate) {
      return this.company
        .autoGenerateProfile(companyId, actorId)
        .then(async (profile) => {
          if (body.publish) {
            await this.company.publishProfile(companyId, actorId);
          }
          return {
            profile,
            workflowState: this.company.mapWorkflowState(profile),
          };
        });
    }
    if (body.updates) {
      return this.company
        .updateProfile(
          companyId,
          body.updates as Parameters<
            PmCompanySafetyContextService['updateProfile']
          >[1],
          actorId,
        )
        .then(async (profile) => {
          if (body.publish) {
            await this.company.publishProfile(companyId, actorId);
          }
          return {
            profile,
            workflowState: this.company.mapWorkflowState(profile),
          };
        });
    }
    return this.company.getOrCreateProfile(companyId).then((profile) => ({
      profile,
      workflowState: this.company.mapWorkflowState(profile),
    }));
  }

  @Post('hazards')
  hazards(
    @Body()
    body: {
      companyId: number;
      category: PmCompanyHazardCategory;
      title: string;
      description: string;
      severity?: number;
      likelihood?: number;
      sifPotential?: boolean;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.createHazard(companyId, body, actorId);
  }

  @Post('controls')
  controls(
    @Body()
    body: {
      companyId: number;
      controlType: PmCompanyControlType;
      title: string;
      description: string;
      controlStrength?: number;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.createControl(companyId, body, actorId);
  }

  @Post('training')
  training(
    @Body()
    body: {
      companyId: number;
      roleType: PmCompanyTrainingRoleType;
      category: PmCompanyTrainingCategory;
      trainingCode: string;
      trainingName: string;
      expiresInDays?: number;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.upsertTrainingRule(companyId, body, actorId);
  }

  @Post('policy')
  policy(
    @Body()
    body: {
      companyId: number;
      policyType: PmCompanyPolicyType;
      title: string;
      requiresAckForAccess?: boolean;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.createPolicy(companyId, body, actorId);
  }

  @Post('sds')
  sds(
    @Body()
    body: {
      companyId: number;
      productName: string;
      casNumber?: string;
      whmisClass?: string;
      ppeRequirements?: unknown[];
      expiresAt?: string;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.createSds(companyId, body, actorId);
  }

  @Post('emergency')
  emergency(
    @Body()
    body: {
      companyId: number;
      planType: PmEmergencyPlanType;
      title: string;
      contentJson?: Record<string, unknown>;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.createEmergencyPlan(companyId, body, actorId);
  }

  @Post('equipment')
  equipment(
    @Body()
    body: {
      companyId: number;
      ruleKey: string;
      requiredInspections?: unknown[];
      requiredCerts?: unknown[];
      requiredControls?: unknown[];
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.upsertEquipmentRule(companyId, body, actorId);
  }

  @Post('zones')
  zones(
    @Body()
    body: {
      companyId: number;
      templateCode: string;
      zoneType: PmAccessZoneType;
      title: string;
      requiredTraining?: unknown[];
      requiredPpe?: unknown[];
      requiresJha?: boolean;
      highRisk?: boolean;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.upsertZoneTemplate(companyId, body, actorId);
  }

  @Post('override')
  override(
    @Body()
    body: {
      companyId: number;
      overrideType: PmCompanySafetyOverrideType;
      ruleKey: string;
      reason: string;
      expiry?: string;
      expiresAt?: string;
      supervisorSig?: string;
      safetySig?: string;
    },
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId, actorId } = this.resolveCompany(req, body.companyId);
    return this.company.createOverride(
      companyId,
      {
        overrideType: body.overrideType,
        ruleKey: body.ruleKey,
        reason: body.reason,
        expiresAt:
          body.expiry ??
          body.expiresAt ??
          new Date(Date.now() + 86400000).toISOString(),
        supervisorSig: body.supervisorSig,
        safetySig: body.safetySig,
      },
      actorId,
    );
  }

  @Post('offline/sync')
  offlineSync(
    @Body() body: { companyId: number } & Record<string, unknown>,
    @Req() req: { user?: SecurityActor },
  ) {
    const { companyId: requested, ...payload } = body;
    const { companyId, actorId } = this.resolveCompany(req, requested);
    return this.company.applyOfflineSync(
      companyId,
      payload as Parameters<
        PmCompanySafetyContextService['applyOfflineSync']
      >[1],
      actorId,
    );
  }

  @Get(':companyId/score')
  score(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Req() req: { user?: SecurityActor },
  ) {
    const effective = this.tenant.effectiveCompanyId(
      toSecurityActor(req.user!),
      companyId,
    );
    return this.company.getCompanySafetyScore(effective);
  }

  @Get(':companyId/analytics')
  analytics(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Req() req: { user?: SecurityActor },
  ) {
    const effective = this.tenant.effectiveCompanyId(
      toSecurityActor(req.user!),
      companyId,
    );
    return this.company.analytics(effective);
  }

  @Get(':companyId/cail')
  cailBundle(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Req() req: { user?: SecurityActor },
  ) {
    const effective = this.tenant.effectiveCompanyId(
      toSecurityActor(req.user!),
      companyId,
    );
    return Promise.all([
      this.cail.companyInsights(effective),
      this.cail.hazardForecast(effective),
      this.company.getCompanySafetyScore(effective),
    ]).then(([insights, forecast, score]) => ({
      insights,
      hazardForecast: forecast,
      score: score.score,
      predictedRisk: score.predictedRisk,
    }));
  }
}
