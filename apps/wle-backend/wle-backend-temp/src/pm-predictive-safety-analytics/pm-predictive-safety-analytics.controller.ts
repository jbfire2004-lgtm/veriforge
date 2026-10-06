import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmPredictiveSafetyAnalyticsService } from './pm-predictive-safety-analytics.service';
import { PredictiveFeatureExtractionService } from './feature-extraction.service';
import { AnalyticsSafetyCultureEngineService } from './analytics-safety-culture-engine.service';
import type { AnalyticsSafetyCultureEngineInput } from './analytics-safety-culture-engine.types';

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

@Controller(`${API_V1_PREFIX}/pm/predictive-safety-analytics`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmPredictiveSafetyAnalyticsController {
  constructor(
    private readonly analytics: PmPredictiveSafetyAnalyticsService,
    private readonly features: PredictiveFeatureExtractionService,
    private readonly cultureEngine: AnalyticsSafetyCultureEngineService,
  ) {}

  /** ANALYTICS_SAFETY_CULTURE_ENGINE — safety culture diagnosis and strategic recommendations */
  @Post('engine/generate')
  @Roles(...SUPERVISOR_ROLES)
  generateCultureEngine(@Body() body: AnalyticsSafetyCultureEngineInput) {
    return this.cultureEngine.generate(body);
  }

  @Post('engine/generate/scope')
  @Roles(...SUPERVISOR_ROLES)
  async generateCultureEngineFromScope(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    const input = await this.cultureEngine.buildInputFromScope(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
    return this.cultureEngine.generate(input);
  }

  @Get('bundle')
  getBundle(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.analytics.getBundle(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post('run')
  @Roles(...SUPERVISOR_ROLES)
  runPipeline(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('notify') notify?: string,
  ) {
    return this.analytics.runPipeline(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
      { notify: notify !== 'false' },
    );
  }

  @Get('forecasts')
  listForecasts(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.analytics.listForecasts(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('features/preview')
  @Roles(...SUPERVISOR_ROLES)
  previewFeatures(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.features.extract(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }
}
