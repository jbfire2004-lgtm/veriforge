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
  PmProjectControlType,
  PmProjectHazardCategory,
  PmProjectSafetyOverrideRuleType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmProjectSafetyContextService } from './pm-project-safety-context.service';
import { PmProjectSafetyCailIntelligenceService } from './pm-project-safety-cail-intelligence.service';

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

/** Spec-aligned alias: `/api/v1/pm/project/safety` */
@Controller(`${API_V1_PREFIX}/pm/project/safety`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmProjectSafetyController {
  constructor(
    private readonly context: PmProjectSafetyContextService,
    private readonly cail: PmProjectSafetyCailIntelligenceService,
  ) {}

  @Post('profile')
  @Roles(...SUPERVISOR_ROLES)
  profile(
    @Body()
    body: {
      projectId: number;
      autoGenerate?: boolean;
      publish?: boolean;
      updates?: Record<string, unknown>;
    },
    @Req() req: { user: { id: number } },
  ) {
    const projectId = body.projectId;
    if (body.autoGenerate) {
      return this.context.autoGenerateProfile(projectId, req.user.id);
    }
    if (body.updates) {
      return this.context
        .updateProfile(
          projectId,
          body.updates as Parameters<
            PmProjectSafetyContextService['updateProfile']
          >[1],
          req.user.id,
        )
        .then(async (profile) => {
          if (body.publish) {
            await this.context.publishProfile(projectId, req.user.id);
          }
          return {
            profile,
            workflowState: this.context.mapWorkflowState(projectId, profile),
          };
        });
    }
    return this.context.getOrCreateProfile(projectId).then((profile) => ({
      profile,
      workflowState: this.context.mapWorkflowState(projectId, profile),
    }));
  }

  @Post('hazards')
  hazards(
    @Body()
    body: {
      projectId: number;
      category: PmProjectHazardCategory;
      title: string;
      description: string;
      severity?: number;
      likelihood?: number;
      sifPotential?: boolean;
      hecaCategoryKey?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.createHazard(body.projectId, body, req.user.id);
  }

  @Post('controls')
  controls(
    @Body()
    body: {
      projectId: number;
      controlType: PmProjectControlType;
      title: string;
      description: string;
      ppeRequired?: boolean;
      hazardCategoryKeys?: string[];
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.createControl(body.projectId, body, req.user.id);
  }

  @Post('zones')
  @Roles(...SUPERVISOR_ROLES)
  zones(
    @Body() body: { projectId: number; zones: Array<Record<string, unknown>> },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.upsertZoneRules(
      body.projectId,
      body.zones,
      req.user.id,
    );
  }

  @Post('equipment')
  @Roles(...SUPERVISOR_ROLES)
  equipment(
    @Body()
    body: { projectId: number; equipmentRules: Record<string, unknown> },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.upsertEquipmentRules(
      body.projectId,
      body.equipmentRules,
      req.user.id,
    );
  }

  @Post('training')
  @Roles(...SUPERVISOR_ROLES)
  training(
    @Body() body: { projectId: number; trainingRules: Record<string, unknown> },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.upsertTrainingRequirements(
      body.projectId,
      body.trainingRules,
      req.user.id,
    );
  }

  @Post('emergency')
  @Roles(...SUPERVISOR_ROLES)
  emergency(
    @Body()
    body: { projectId: number; emergencyRules: Record<string, unknown> },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.upsertEmergencyRequirements(
      body.projectId,
      body.emergencyRules,
      req.user.id,
    );
  }

  @Post('override')
  @Roles(...SUPERVISOR_ROLES)
  override(
    @Body()
    body: {
      projectId: number;
      overrideType: PmProjectSafetyOverrideRuleType;
      ruleKey: string;
      reason: string;
      overrideJson?: Record<string, unknown>;
      expiry?: string;
      expiresAt?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.createOverride(
      body.projectId,
      {
        ruleType: body.overrideType,
        ruleKey: body.ruleKey,
        reason: body.reason,
        overrideJson: body.overrideJson,
        expiresAt: body.expiry ?? body.expiresAt,
      },
      req.user.id,
    );
  }

  @Post('offline/sync')
  offlineSync(
    @Body()
    body: {
      projectId: number;
      profile?: Record<string, unknown>;
      hazards?: Array<Record<string, unknown>>;
      controls?: Array<Record<string, unknown>>;
      overrides?: Array<Record<string, unknown>>;
      zoneRules?: Array<Record<string, unknown>>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.applyOfflineSync(body.projectId, body, req.user.id);
  }

  @Get(':projectId/score')
  score(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.context.getProjectSafetyScore(projectId);
  }

  @Get(':projectId/analytics')
  analytics(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.context.analytics(projectId);
  }

  @Get(':projectId/cail')
  cailBundle(@Param('projectId', ParseIntPipe) projectId: number) {
    return Promise.all([
      this.cail.projectInsights(projectId),
      this.cail.hazardForecast(projectId),
      this.context.getProjectSafetyScore(projectId),
    ]).then(([insights, forecast, score]) => ({
      insights,
      hazardForecast: forecast,
      score: score.score,
      predictedRisk: score.predictedRisk,
    }));
  }
}
