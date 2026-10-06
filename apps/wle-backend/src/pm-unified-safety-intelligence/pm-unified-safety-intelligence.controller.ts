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
import { CailIntelScoreType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmUnifiedSafetyIntelligenceService } from './pm-unified-safety-intelligence.service';

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

@Controller(`${API_V1_PREFIX}/pm/unified-safety-intelligence`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmUnifiedSafetyIntelligenceController {
  constructor(private readonly intel: PmUnifiedSafetyIntelligenceService) {}

  @Get('dashboard')
  dashboard(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.intel.getDashboard({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('analytics/trends')
  trends(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.intel.getAnalyticsTrends({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('predictions')
  predictions(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.intel.listPredictions({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('scores')
  scores(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('scoreType') scoreType?: CailIntelScoreType,
    @Query('limit') limit?: string,
  ) {
    return this.intel.listScores({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      scoreType,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('recommendations')
  recommendations(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.intel.listRecommendations({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      status,
    });
  }

  @Get('correlations')
  correlations(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.intel.listCorrelations({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('explainability/:id')
  explainability(@Param('id') id: string) {
    return this.intel.getExplainability(id);
  }

  @Get('models')
  models(@Query('companyId') companyId: string) {
    return this.intel.listModels(parseInt(companyId, 10));
  }

  @Get('models/:modelId')
  getModelById(@Param('modelId') modelId: string) {
    return this.intel.getModel(modelId);
  }

  @Post('sync/apply')
  offlineSyncApply(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      predictions?: Array<Record<string, unknown>>;
      scores?: Array<Record<string, unknown>>;
      recommendations?: Array<Record<string, unknown>>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.intel.applyOfflineSync(
      body.companyId,
      body.projectId,
      body,
      req.user.id,
    );
  }

  @Get('sync/bundle')
  offlineBundle(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.intel.buildOfflineBundle({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Post('inference/batch')
  @Roles(...SUPERVISOR_ROLES)
  batchInference(
    @Body() body: { companyId: number; projectId: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.intel.runBatchInference(
      body.companyId,
      body.projectId,
      req.user.id,
    );
  }

  @Post('inference/realtime')
  realtime(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      workerId?: number;
      equipmentId?: number;
      zoneCode?: string;
    },
  ) {
    return this.intel.runRealtimeInference(body);
  }

  @Post('enforcement/evaluate')
  enforcement(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      workerId?: number;
      equipmentId?: number;
    },
  ) {
    return this.intel.evaluateSafetyGate(body);
  }

  @Post('ingest')
  @Roles(...SUPERVISOR_ROLES)
  ingest(@Body() body: { companyId: number; projectId: number }) {
    return this.intel.ingestProjectData(body.companyId, body.projectId);
  }

  @Post('correlations/build')
  @Roles(...SUPERVISOR_ROLES)
  buildCorrelations(@Body() body: { companyId: number; projectId: number }) {
    return this.intel.buildCorrelations(body.companyId, body.projectId);
  }

  @Post('models/:modelId/deploy')
  @Roles(...SUPERVISOR_ROLES)
  deployModel(
    @Param('modelId') modelId: string,
    @Body() body: { version: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.intel.deployModel(modelId, body.version, req.user.id);
  }

  @Post('models/:modelId/rollback')
  @Roles(...SUPERVISOR_ROLES)
  rollbackModel(
    @Param('modelId') modelId: string,
    @Body() body: { toVersion: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.intel.rollbackModel(modelId, body.toVersion, req.user.id);
  }
}
