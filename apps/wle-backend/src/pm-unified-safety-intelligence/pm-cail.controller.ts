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
  CailIntelPredictionType,
  CailIntelScoreType,
  UserRole,
} from '@prisma/client';
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

/** Spec-aligned alias: `/api/v1/pm/cail` */
@Controller(`${API_V1_PREFIX}/pm/cail`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmCailController {
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

  @Post('predict')
  predict(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      workerId?: number;
      equipmentId?: number;
      predictionType?: CailIntelPredictionType;
    },
  ) {
    return this.intel.predict(body);
  }

  @Post('score')
  score(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      workerId?: number;
      equipmentId?: number;
      scoreType?: CailIntelScoreType;
    },
  ) {
    return this.intel.score(body);
  }

  @Post('recommend')
  @Roles(...SUPERVISOR_ROLES)
  recommend(@Body() body: { companyId: number; projectId: number }) {
    return this.intel.recommend(body);
  }

  @Post('correlate')
  @Roles(...SUPERVISOR_ROLES)
  correlate(@Body() body: { companyId: number; projectId: number }) {
    return this.intel.correlate(body);
  }

  @Post('explain')
  explain(
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      explainabilityId?: string;
      predictionType?: string;
      entityType?: string;
      entityId?: string;
    },
  ) {
    return this.intel.explain(body);
  }

  @Post('model/train')
  @Roles(...SUPERVISOR_ROLES)
  trainModel(
    @Body() body: { companyId: number; projectId: number; modelId?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.intel.trainModel(body, req.user.id);
  }

  @Post('model/deploy')
  @Roles(...SUPERVISOR_ROLES)
  deployModel(
    @Body() body: { modelId: string; version: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.intel.deployModel(body.modelId, body.version, req.user.id);
  }

  @Post('model/rollback')
  @Roles(...SUPERVISOR_ROLES)
  rollbackModel(
    @Body() body: { modelId: string; toVersion: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.intel.rollbackModel(body.modelId, body.toVersion, req.user.id);
  }

  @Post('offline/infer')
  offlineInfer(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      workerId?: number;
      equipmentId?: number;
      localScores?: Array<Record<string, unknown>>;
      localPredictions?: Array<Record<string, unknown>>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.intel.offlineInfer(body, req.user.id);
  }

  @Post('offline/sync')
  offlineSync(
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

  @Get('model/:id')
  getModel(@Param('id') id: string) {
    return this.intel.getModel(id);
  }
}
