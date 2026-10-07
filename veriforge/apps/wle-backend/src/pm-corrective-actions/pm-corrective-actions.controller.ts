import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  PmCorrectiveActionStatus,
  PmCorrectiveActionType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmCorrectiveActionsService } from './pm-corrective-actions.service';
import { PmCapaAutoGenerateService } from './pm-capa-auto-generate.service';
import { PmCapaIntelligenceService } from './pm-capa-intelligence.service';

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

@Controller(`${API_V1_PREFIX}/pm/corrective-actions`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmCorrectiveActionsController {
  constructor(
    private readonly capa: PmCorrectiveActionsService,
    private readonly auto: PmCapaAutoGenerateService,
    private readonly intelligence: PmCapaIntelligenceService,
  ) {}

  @Get()
  list(
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: PmCorrectiveActionStatus,
    @Query('overdueOnly') overdueOnly?: string,
  ) {
    return this.capa.list({
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      status,
      overdueOnly: overdueOnly === 'true',
    });
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.capa.analytics(parseInt(projectId, 10));
  }

  @Get('intelligence/project/:projectId')
  forecast(@Param('projectId') projectId: string) {
    return this.intelligence.projectForecast(parseInt(projectId, 10));
  }

  @Get('access/worker')
  workerAccess(
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.capa.workerAccessCheck(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @Throttle(30, 60)
  sync(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      clientSyncId: string;
      companyId: number;
      projectId: number;
      title: string;
      description?: string;
      sourceModule: string;
      sourceId: string;
      actionType?: PmCorrectiveActionType;
      severity?: string;
      assignUserId?: number;
      publish?: boolean;
    },
  ) {
    return this.capa.syncOffline({
      ...body,
      createdByUserId: req.user?.userId ?? 0,
    });
  }

  @Post('escalations/run')
  @Roles(...SUPERVISOR_ROLES)
  runEscalations(@Query('projectId') projectId: string) {
    return this.capa.runEscalations(parseInt(projectId, 10));
  }

  @Post('auto/sync-project')
  @Roles(...SUPERVISOR_ROLES)
  autoSync(
    @Query('projectId') projectId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.auto.syncOpenFromModules(
      parseInt(projectId, 10),
      req.user?.userId ?? 0,
    );
  }

  @Post('auto/jha-flha/:id')
  autoJha(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.auto.fromJhaFlha(id, req.user?.userId ?? 0);
  }

  @Post('auto/inspection-deficiency/:id')
  autoDeficiency(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.auto.fromInspectionDeficiency(id, req.user?.userId ?? 0);
  }

  @Post('auto/sif-heca/:id')
  autoSif(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.auto.fromSifHecaEvent(id, req.user?.userId ?? 0);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.capa.get(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      companyId: number;
      projectId: number;
      sourceModule: string;
      sourceId: string;
      title: string;
      description?: string;
      actionType?: PmCorrectiveActionType;
      severity?: string;
      siteId?: number;
      equipmentId?: number;
      workerId?: number;
      assignUserId?: number;
      deficiencyId?: string;
      sourceItemId?: string;
      clientSyncId?: string;
    },
  ) {
    return this.capa.create({
      ...body,
      createdByUserId: req.user?.userId ?? 0,
    });
  }

  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      userId?: number;
      workerId?: number;
      role?: 'primary' | 'secondary' | 'delegate';
    },
  ) {
    return this.capa.assign(id, body, req.user?.userId);
  }

  @Post(':id/delegate')
  delegate(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: { toUserId: number },
  ) {
    return this.capa.delegate(id, body.toUserId, req.user?.userId ?? 0);
  }

  @Put(':id/in-progress')
  inProgress(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.capa.markInProgress(id, req.user?.userId);
  }

  @Post(':id/submit-verification')
  submitVerification(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.capa.submitForVerification(id, req.user?.userId ?? 0);
  }

  @Post(':id/attachments')
  addAttachment(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.capa.addAttachment(id, body as never, req.user?.userId);
  }

  @Post(':id/signatures')
  addSignature(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: { role: string; signatureData?: string },
  ) {
    return this.capa.addSignature(id, body, req.user?.userId);
  }

  @Post(':id/verify')
  @Roles(...SUPERVISOR_ROLES)
  verify(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      outcome: 'approve' | 'reject';
      role: string;
      notes?: string;
    },
  ) {
    return this.capa.verify(id, body, req.user?.userId ?? 0);
  }
}
