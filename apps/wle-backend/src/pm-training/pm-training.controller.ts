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
  PmCompanyTrainingCategory,
  PmCompanyTrainingRoleType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmTrainingService } from './pm-training.service';
import { PmTrainingCailIntelligenceService } from './pm-training-cail-intelligence.service';
import { TrainingCompetencyEngineService } from './training-competency-engine.service';
import type { TrainingCompetencyEngineInput } from './training-competency-engine.types';

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

@Controller(`${API_V1_PREFIX}/pm/training`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmTrainingController {
  constructor(
    private readonly training: PmTrainingService,
    private readonly intelligence: PmTrainingCailIntelligenceService,
    private readonly competencyEngine: TrainingCompetencyEngineService,
  ) {}

  /** TRAINING_COMPETENCY_ENGINE — gap analysis and prioritized training plan */
  @Post('engine/generate')
  generateCompetencyEngine(@Body() body: TrainingCompetencyEngineInput) {
    return this.competencyEngine.generate(body);
  }

  @Get('courses')
  listCourses(@Query('companyId') companyId: string) {
    return this.training.listCourses(parseInt(companyId, 10));
  }

  @Post('course')
  @Roles(...SUPERVISOR_ROLES)
  createCourse(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      companyId: number;
      name: string;
      category?: PmCompanyTrainingCategory;
      trainingCode?: string;
      roleType?: PmCompanyTrainingRoleType;
      provider?: string;
      durationHours?: number;
      expiryDays?: number;
    },
  ) {
    return this.training.createCourse({
      ...body,
      actorId: req.user?.userId,
    });
  }

  @Get('matrix')
  getMatrix(@Query('companyId') companyId: string) {
    return this.training.getMatrix(parseInt(companyId, 10));
  }

  @Post('matrix')
  @Roles(...SUPERVISOR_ROLES)
  upsertMatrix(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      companyId: number;
      roleType: PmCompanyTrainingRoleType;
      requiredCourses: Array<{
        trainingCode: string;
        trainingName: string;
        category?: PmCompanyTrainingCategory;
        expiresInDays?: number;
      }>;
    },
  ) {
    return this.training.upsertMatrix({
      ...body,
      actorId: req.user?.userId,
    });
  }

  @Post('assign')
  assign(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      workerId: number;
      courseId: number | string;
      courseName?: string;
      companyId?: number;
      projectId?: number;
      expiresInDays?: number;
    },
  ) {
    return this.training.assign({ ...body, actorId: req.user?.userId });
  }

  @Post('complete')
  complete(
    @Req() req: { user?: { userId?: number } },
    @Body() body: { recordId: number },
  ) {
    return this.training.complete(body.recordId, req.user?.userId);
  }

  @Post('verify')
  @Roles(...SUPERVISOR_ROLES)
  verify(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      recordId: number;
      certificateUrl?: string;
      certificateNumber?: string;
      verifiedByUserId?: number;
    },
  ) {
    return this.training.verify(body.recordId, {
      ...body,
      actorId: req.user?.userId,
    });
  }

  @Post('auto-assign/:workerId')
  @Roles(...SUPERVISOR_ROLES)
  autoAssign(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Query('roleType') roleType?: PmCompanyTrainingRoleType,
    @Req() req?: { user?: { userId?: number } },
  ) {
    return this.training.autoAssignForWorker(
      workerId,
      roleType ?? 'worker',
      req?.user?.userId,
    );
  }

  @Post('worker/:workerId/engine/generate')
  generateCompetencyEngineForWorker(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Body()
    body?: {
      projectId?: number;
      project_scope?: TrainingCompetencyEngineInput['project_scope'];
    },
  ) {
    return this.competencyEngine
      .buildInputFromWorker(workerId, body?.projectId, body?.project_scope)
      .then((input) => this.competencyEngine.generate(input));
  }

  @Get('worker/:workerId')
  workerTraining(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Query('roleType') roleType?: PmCompanyTrainingRoleType,
  ) {
    return this.training.getWorkerTraining(workerId, roleType ?? 'worker');
  }

  @Get('worker/:workerId/predict')
  predictWorker(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Query('roleType') roleType?: PmCompanyTrainingRoleType,
  ) {
    return this.intelligence.predictWorkerLapse(workerId, roleType ?? 'worker');
  }

  @Get('analytics/company/:companyId')
  analytics(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('projectId') projectId?: string,
  ) {
    return this.intelligence.projectAnalytics(
      companyId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post('sync')
  sync(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.training.syncOffline({
      ...(body as object),
      actorId: req.user?.userId,
    } as Parameters<PmTrainingService['syncOffline']>[0]);
  }

  @Post('offline/sync')
  syncOffline(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.training.syncOffline({
      ...(body as object),
      actorId: req.user?.userId,
    } as Parameters<PmTrainingService['syncOffline']>[0]);
  }
}
