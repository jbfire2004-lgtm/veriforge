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
import { SafetyFormType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { API_V1_PREFIX } from '../config/routes';
import { STAFF_ROLES } from '../modules/vera-core/roles';
import { SafetyWorkflowEngineService } from './workflows/safety-workflow-engine.service';

type AuthReq = { user?: { id: number; role: UserRole } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES, UserRole.WORKER)
@Controller(`${API_V1_PREFIX}/projects`)
export class ProjectSafetyController {
  constructor(private readonly engine: SafetyWorkflowEngineService) {}

  @Get(':projectId/safety/forms')
  listProjectForms(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('formType') formType?: SafetyFormType,
    @Query('workerId') workerId?: string,
    @Query('awaitingReview') awaitingReview?: string,
  ) {
    const wid = workerId ? parseInt(workerId, 10) : undefined;
    return this.engine.listForms({
      projectId,
      formType,
      workerId: Number.isFinite(wid) ? wid : undefined,
      awaitingReview: awaitingReview === 'true',
    });
  }

  @Post(':projectId/safety/forms')
  createProjectForm(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body()
    body: {
      formType: SafetyFormType;
      workerId?: number;
      companyId?: number;
      title?: string;
      formData?: Record<string, unknown>;
    },
    @Req() req: AuthReq,
  ) {
    return this.engine.createForm(
      { ...body, projectId },
      { id: req.user!.id, role: req.user!.role },
    );
  }
}
