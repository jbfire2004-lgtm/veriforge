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
  PmProjectControlType,
  PmProjectHazardCategory,
  PmProjectSafetyOverrideRuleType,
  PmProjectSafetyRiskLevel,
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

@Controller(`${API_V1_PREFIX}/pm/project-safety-context`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmProjectSafetyContextController {
  constructor(
    private readonly context: PmProjectSafetyContextService,
    private readonly cail: PmProjectSafetyCailIntelligenceService,
  ) {}

  @Get('project/:projectId')
  getContext(@Param('projectId') projectId: string) {
    return this.context.getProjectContext(parseInt(projectId, 10));
  }

  @Get('profile/:projectId')
  getProfile(@Param('projectId') projectId: string) {
    return this.context.getOrCreateProfile(parseInt(projectId, 10));
  }

  @Put('profile/:projectId')
  updateProfile(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.context.updateProfile(
      parseInt(projectId, 10),
      body as Parameters<PmProjectSafetyContextService['updateProfile']>[1],
      req.user.id,
    );
  }

  @Post('profile/:projectId/auto-generate')
  @Roles(...SUPERVISOR_ROLES)
  autoGenerate(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.context.autoGenerateProfile(
      parseInt(projectId, 10),
      req.user.id,
    );
  }

  @Post('profile/:projectId/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishProfile(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.context.publishProfile(parseInt(projectId, 10), req.user.id);
  }

  @Get('hazards/:projectId')
  listHazards(
    @Param('projectId') projectId: string,
    @Query('status') status?: string,
  ) {
    return this.context.listHazards(parseInt(projectId, 10), status);
  }

  @Post('hazards/:projectId')
  createHazard(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      category: PmProjectHazardCategory;
      title: string;
      description: string;
      severity?: number;
      likelihood?: number;
      sifPotential?: boolean;
      hecaCategoryKey?: string;
      subcategory?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.createHazard(
      parseInt(projectId, 10),
      body,
      req.user.id,
    );
  }

  @Post('hazards/:hazardId/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishHazard(
    @Param('hazardId') hazardId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.context.publishHazard(hazardId, req.user.id);
  }

  @Post('hazards/:projectId/import')
  @Roles(...SUPERVISOR_ROLES)
  importHazards(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      sources: Array<
        | 'company_library'
        | 'jha_flha'
        | 'inspection'
        | 'incident'
        | 'equipment_failure'
      >;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.importHazards(
      parseInt(projectId, 10),
      body.sources ?? ['company_library'],
      req.user.id,
    );
  }

  @Get('controls/:projectId')
  listControls(@Param('projectId') projectId: string) {
    return this.context.listControls(parseInt(projectId, 10));
  }

  @Post('controls/:projectId')
  createControl(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      controlType: PmProjectControlType;
      title: string;
      description: string;
      ppeRequired?: boolean;
      hazardCategoryKeys?: string[];
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.createControl(
      parseInt(projectId, 10),
      body,
      req.user.id,
    );
  }

  @Post('controls/:controlId/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishControl(
    @Param('controlId') controlId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.context.publishControl(controlId, req.user.id);
  }

  @Post('controls/:projectId/import')
  @Roles(...SUPERVISOR_ROLES)
  importControls(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.context.importControlsFromCompanyLibrary(
      parseInt(projectId, 10),
      req.user.id,
    );
  }

  @Get('overrides/:projectId')
  listOverrides(@Param('projectId') projectId: string) {
    return this.context.listOverrides(parseInt(projectId, 10));
  }

  @Post('overrides/:projectId')
  @Roles(...SUPERVISOR_ROLES)
  createOverride(
    @Param('projectId') projectId: string,
    @Body()
    body: {
      ruleType: PmProjectSafetyOverrideRuleType;
      ruleKey: string;
      reason: string;
      overrideJson?: Record<string, unknown>;
      expiresAt?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.createOverride(
      parseInt(projectId, 10),
      body,
      req.user.id,
    );
  }

  @Post('enforcement/:projectId/evaluate')
  evaluateEnforcement(
    @Param('projectId') projectId: string,
    @Body() body: { workerChecks: Record<string, boolean>; zoneCode?: string },
  ) {
    return this.context.evaluateEnforcement(
      parseInt(projectId, 10),
      body.workerChecks,
      body.zoneCode,
    );
  }

  @Get('cail/insights/:projectId')
  cailInsights(@Param('projectId') projectId: string) {
    return this.cail.projectInsights(parseInt(projectId, 10));
  }

  @Get('sync/project/:projectId')
  offlineBundle(@Param('projectId') projectId: string) {
    return this.context.buildOfflineBundle(parseInt(projectId, 10));
  }

  @Post('sync/project/:projectId')
  offlineSyncUpload(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.context.applyOfflineSync(
      parseInt(projectId, 10),
      body as Parameters<PmProjectSafetyContextService['applyOfflineSync']>[1],
      req.user.id,
    );
  }

  @Get('score/:projectId')
  safetyScore(@Param('projectId') projectId: string) {
    return this.context.getProjectSafetyScore(parseInt(projectId, 10));
  }

  @Get('analytics/:projectId')
  safetyAnalytics(@Param('projectId') projectId: string) {
    return this.context.analytics(parseInt(projectId, 10));
  }

  @Get('validate/:projectId')
  validateReadiness(@Param('projectId') projectId: string) {
    return this.context.validatePublishReadiness(parseInt(projectId, 10));
  }

  @Put('zones/:projectId')
  @Roles(...SUPERVISOR_ROLES)
  upsertZones(
    @Param('projectId') projectId: string,
    @Body() body: { zones: Array<Record<string, unknown>> },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.upsertZoneRules(
      parseInt(projectId, 10),
      body.zones,
      req.user.id,
    );
  }

  @Put('equipment/:projectId')
  @Roles(...SUPERVISOR_ROLES)
  upsertEquipment(
    @Param('projectId') projectId: string,
    @Body() body: { equipmentRules: Record<string, unknown> },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.upsertEquipmentRules(
      parseInt(projectId, 10),
      body.equipmentRules,
      req.user.id,
    );
  }

  @Put('training/:projectId')
  @Roles(...SUPERVISOR_ROLES)
  upsertTraining(
    @Param('projectId') projectId: string,
    @Body() body: { trainingRules: Record<string, unknown> },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.upsertTrainingRequirements(
      parseInt(projectId, 10),
      body.trainingRules,
      req.user.id,
    );
  }

  @Put('emergency/:projectId')
  @Roles(...SUPERVISOR_ROLES)
  upsertEmergency(
    @Param('projectId') projectId: string,
    @Body() body: { emergencyRules: Record<string, unknown> },
    @Req() req: { user: { id: number } },
  ) {
    return this.context.upsertEmergencyRequirements(
      parseInt(projectId, 10),
      body.emergencyRules,
      req.user.id,
    );
  }
}
