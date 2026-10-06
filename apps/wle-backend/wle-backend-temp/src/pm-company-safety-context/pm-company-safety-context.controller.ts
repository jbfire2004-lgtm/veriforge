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
  PmCompanyControlType,
  PmCompanyHazardCategory,
  PmCompanyPolicyType,
  PmCompanySafetyOverrideType,
  PmCompanyTrainingCategory,
  PmCompanyTrainingRoleType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmCompanySafetyContextService } from './pm-company-safety-context.service';
import { PmCompanySafetyCailIntelligenceService } from './pm-company-safety-cail-intelligence.service';

const PM_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/company-safety-context`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmCompanySafetyContextController {
  constructor(
    private readonly company: PmCompanySafetyContextService,
    private readonly cail: PmCompanySafetyCailIntelligenceService,
  ) {}

  @Get('company/:companyId')
  getContext(@Param('companyId') companyId: string) {
    return this.company.getCompanyContext(parseInt(companyId, 10));
  }

  @Get('profile/:companyId')
  getProfile(@Param('companyId') companyId: string) {
    return this.company.getOrCreateProfile(parseInt(companyId, 10));
  }

  @Post('profile/:companyId/auto-generate')
  autoGenerate(
    @Param('companyId') companyId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.company.autoGenerateProfile(
      parseInt(companyId, 10),
      req.user.id,
    );
  }

  @Post('profile/:companyId/publish')
  publishProfile(
    @Param('companyId') companyId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.company.publishProfile(parseInt(companyId, 10), req.user.id);
  }

  @Post('profile/:companyId/sync-projects')
  syncProjects(
    @Param('companyId') companyId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.company.syncPublishedAssetsToProjects(
      parseInt(companyId, 10),
      req.user.id,
    );
  }

  @Get('hazards/:companyId')
  listHazards(
    @Param('companyId') companyId: string,
    @Query('status') status?: string,
  ) {
    return this.company.listHazards(parseInt(companyId, 10), status);
  }

  @Post('hazards/:companyId')
  createHazard(
    @Param('companyId') companyId: string,
    @Body()
    body: {
      category: PmCompanyHazardCategory;
      title: string;
      description: string;
      severity?: number;
      likelihood?: number;
      sifPotential?: boolean;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.company.createHazard(
      parseInt(companyId, 10),
      body,
      req.user.id,
    );
  }

  @Post('hazards/:hazardId/publish')
  publishHazard(
    @Param('hazardId') hazardId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.company.publishHazard(hazardId, req.user.id);
  }

  @Get('controls/:companyId')
  listControls(@Param('companyId') companyId: string) {
    return this.company.listControls(parseInt(companyId, 10));
  }

  @Post('controls/:companyId')
  createControl(
    @Param('companyId') companyId: string,
    @Body()
    body: {
      controlType: PmCompanyControlType;
      title: string;
      description: string;
      controlStrength?: number;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.company.createControl(
      parseInt(companyId, 10),
      body,
      req.user.id,
    );
  }

  @Post('controls/:controlId/publish')
  publishControl(
    @Param('controlId') controlId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.company.publishControl(controlId, req.user.id);
  }

  @Get('training-matrix/:companyId')
  listTraining(@Param('companyId') companyId: string) {
    return this.company.listTrainingMatrix(parseInt(companyId, 10));
  }

  @Put('training-matrix/:companyId')
  upsertTraining(
    @Param('companyId') companyId: string,
    @Body()
    body: {
      roleType: PmCompanyTrainingRoleType;
      category: PmCompanyTrainingCategory;
      trainingCode: string;
      trainingName: string;
      expiresInDays?: number;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.company.upsertTrainingRule(
      parseInt(companyId, 10),
      body,
      req.user.id,
    );
  }

  @Get('policies/:companyId')
  listPolicies(@Param('companyId') companyId: string) {
    return this.company.listPolicies(parseInt(companyId, 10));
  }

  @Post('policies/:companyId')
  createPolicy(
    @Param('companyId') companyId: string,
    @Body()
    body: {
      policyType: PmCompanyPolicyType;
      title: string;
      requiresAckForAccess?: boolean;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.company.createPolicy(
      parseInt(companyId, 10),
      body,
      req.user.id,
    );
  }

  @Post('policies/:policyId/publish')
  publishPolicy(
    @Param('policyId') policyId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.company.publishPolicy(policyId, req.user.id);
  }

  @Get('sds/:companyId')
  listSds(@Param('companyId') companyId: string) {
    return this.company.listSds(parseInt(companyId, 10));
  }

  @Post('sds/:companyId/import-legacy')
  importSds(@Param('companyId') companyId: string) {
    return this.company.importSdsFromLegacy(parseInt(companyId, 10));
  }

  @Get('emergency-plans/:companyId')
  listEmergency(@Param('companyId') companyId: string) {
    return this.company.listEmergencyPlans(parseInt(companyId, 10));
  }

  @Post('emergency-plans/:companyId/import-legacy')
  importEmergency(@Param('companyId') companyId: string) {
    return this.company.importEmergencyFromLegacy(parseInt(companyId, 10));
  }

  @Get('equipment-rules/:companyId')
  listEquipmentRules(@Param('companyId') companyId: string) {
    return this.company.listEquipmentRules(parseInt(companyId, 10));
  }

  @Get('zone-templates/:companyId')
  listZones(@Param('companyId') companyId: string) {
    return this.company.listZoneTemplates(parseInt(companyId, 10));
  }

  @Get('overrides/:companyId')
  listOverrides(@Param('companyId') companyId: string) {
    return this.company.listOverrides(parseInt(companyId, 10));
  }

  @Post('overrides/:companyId')
  createOverride(
    @Param('companyId') companyId: string,
    @Body()
    body: {
      overrideType: PmCompanySafetyOverrideType;
      ruleKey: string;
      reason: string;
      expiresAt: string;
      supervisorSig?: string;
      safetySig?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.company.createOverride(
      parseInt(companyId, 10),
      body,
      req.user.id,
    );
  }

  @Post('enforcement/evaluate')
  evaluateEnforcement(
    @Body() body: { workerId: number; workerChecks: Record<string, boolean> },
  ) {
    return this.company.enforcementGate(body.workerId, body.workerChecks);
  }

  @Get('analytics/:companyId')
  analytics(@Param('companyId') companyId: string) {
    return this.company.analytics(parseInt(companyId, 10));
  }

  @Get('cail/insights/:companyId')
  cailInsights(@Param('companyId') companyId: string) {
    return this.cail.companyInsights(parseInt(companyId, 10));
  }

  @Get('sync/company/:companyId')
  offlineBundle(@Param('companyId') companyId: string) {
    return this.company.buildOfflineBundle(parseInt(companyId, 10));
  }

  @Post('sync/company/:companyId')
  offlineSyncUpload(
    @Param('companyId') companyId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.company.applyOfflineSync(
      parseInt(companyId, 10),
      body as Parameters<PmCompanySafetyContextService['applyOfflineSync']>[1],
      req.user.id,
    );
  }

  @Get('score/:companyId')
  safetyScore(@Param('companyId') companyId: string) {
    return this.company.getCompanySafetyScore(parseInt(companyId, 10));
  }

  @Get('validate/:companyId')
  validateReadiness(@Param('companyId') companyId: string) {
    return this.company.validatePublishReadiness(parseInt(companyId, 10));
  }

  @Put('equipment-rules/:companyId')
  upsertEquipment(
    @Param('companyId') companyId: string,
    @Body()
    body: Parameters<PmCompanySafetyContextService['upsertEquipmentRule']>[1],
    @Req() req: { user: { id: number } },
  ) {
    return this.company.upsertEquipmentRule(
      parseInt(companyId, 10),
      body,
      req.user.id,
    );
  }

  @Put('zone-templates/:companyId')
  upsertZone(
    @Param('companyId') companyId: string,
    @Body()
    body: Parameters<PmCompanySafetyContextService['upsertZoneTemplate']>[1],
    @Req() req: { user: { id: number } },
  ) {
    return this.company.upsertZoneTemplate(
      parseInt(companyId, 10),
      body,
      req.user.id,
    );
  }

  @Post('sds/:companyId')
  createSds(
    @Param('companyId') companyId: string,
    @Body() body: Parameters<PmCompanySafetyContextService['createSds']>[1],
    @Req() req: { user: { id: number } },
  ) {
    return this.company.createSds(parseInt(companyId, 10), body, req.user.id);
  }

  @Post('emergency-plans/:companyId')
  createEmergency(
    @Param('companyId') companyId: string,
    @Body()
    body: Parameters<PmCompanySafetyContextService['createEmergencyPlan']>[1],
    @Req() req: { user: { id: number } },
  ) {
    return this.company.createEmergencyPlan(
      parseInt(companyId, 10),
      body,
      req.user.id,
    );
  }
}
