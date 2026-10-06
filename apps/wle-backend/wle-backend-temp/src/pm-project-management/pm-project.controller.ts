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
import { PmPermitType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmProjectManagementService } from './pm-project-management.service';
import { PmProjectManagementCailIntelligenceService } from './pm-project-management-cail-intelligence.service';

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

/** Spec-aligned alias: `/api/v1/pm/project` */
@Controller(`${API_V1_PREFIX}/pm/project`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmProjectController {
  constructor(
    private readonly pm: PmProjectManagementService,
    private readonly cail: PmProjectManagementCailIntelligenceService,
  ) {}

  @Post()
  @Roles(...SUPERVISOR_ROLES)
  createProject(
    @Body()
    body: {
      companyId: number;
      name: string;
      code?: string;
      siteId?: number;
      type?: string;
      projectType?: string;
      scope?: Record<string, unknown>;
      scopeOfWorkJson?: Record<string, unknown>;
      startDate?: string;
      endDate?: string;
      autoConfigure?: boolean;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.createProject(
      {
        companyId: body.companyId,
        name: body.name,
        code: body.code,
        siteId: body.siteId,
        projectType: body.projectType ?? body.type,
        scopeOfWorkJson: body.scopeOfWorkJson ?? body.scope,
        startDate: body.startDate,
        endDate: body.endDate,
        autoConfigure: body.autoConfigure,
      },
      req.user.id,
    );
  }

  @Post('work-package')
  @Roles(...SUPERVISOR_ROLES)
  workPackage(
    @Body() body: { projectId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { projectId, ...data } = body;
    return this.pm.createWorkPackage(
      projectId,
      data as Parameters<PmProjectManagementService['createWorkPackage']>[1],
      req.user.id,
    );
  }

  @Post('task')
  @Roles(...SUPERVISOR_ROLES)
  task(
    @Body() body: { projectId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { projectId, ...data } = body;
    return this.pm.createTask(
      projectId,
      data as Parameters<PmProjectManagementService['createTask']>[1],
      req.user.id,
    );
  }

  @Post('schedule')
  @Roles(...SUPERVISOR_ROLES)
  schedule(
    @Body() body: { projectId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { projectId, ...data } = body;
    return this.pm.createScheduleEntry(
      projectId,
      data as Parameters<PmProjectManagementService['createScheduleEntry']>[1],
      req.user.id,
    );
  }

  @Post('assign/worker')
  assignWorker(
    @Body() body: { projectId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { projectId, ...data } = body;
    return this.pm.assignWorker(
      projectId,
      data as Parameters<PmProjectManagementService['assignWorker']>[1],
      req.user.id,
    );
  }

  @Post('assign/equipment')
  assignEquipment(
    @Body() body: { projectId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { projectId, ...data } = body;
    return this.pm.assignEquipment(
      projectId,
      data as Parameters<PmProjectManagementService['assignEquipment']>[1],
      req.user.id,
    );
  }

  @Post('permit')
  @Roles(...SUPERVISOR_ROLES)
  permit(
    @Body()
    body: {
      projectId: number;
      permitType: PmPermitType;
      title: string;
    } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { projectId, ...data } = body;
    return this.pm.createPermit(
      projectId,
      data as Parameters<PmProjectManagementService['createPermit']>[1],
      req.user.id,
    );
  }

  @Post('progress')
  progress(
    @Body()
    body: { projectId?: number; taskId: string; progressPct: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.updateTaskProgress(
      body.taskId,
      body.progressPct,
      req.user.id,
    );
  }

  @Post('offline/sync')
  offlineSync(
    @Body() body: { projectId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { projectId, ...payload } = body;
    return this.pm.applyOfflineSync(
      projectId,
      payload as Parameters<PmProjectManagementService['applyOfflineSync']>[1],
      req.user.id,
    );
  }

  @Get(':projectId/dashboard')
  dashboard(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.pm.getProjectDashboard(projectId);
  }

  @Get(':projectId/cail')
  cailBundle(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.pm.getCailBundle(projectId);
  }

  @Get(':projectId/analytics')
  analytics(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.pm.getAnalytics(projectId);
  }
}
