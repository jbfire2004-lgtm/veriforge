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
import { PmCorrectiveActionLinkType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmUnifiedCorrectiveActionService } from './pm-unified-corrective-action.service';
import { PmUnifiedCorrectiveActionCailService } from './pm-unified-corrective-action-cail.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';

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

@Controller(`${API_V1_PREFIX}/pm/unified-corrective-action`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmUnifiedCorrectiveActionController {
  constructor(
    private readonly unified: PmUnifiedCorrectiveActionService,
    private readonly cail: PmUnifiedCorrectiveActionCailService,
    private readonly capa: PmCorrectiveActionsService,
  ) {}

  @Get('dashboard')
  dashboard(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.unified.getDashboard({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('analytics')
  analytics(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.unified.getAnalytics({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('analytics/trends')
  analyticsTrends(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.unified.getAnalyticsTrends({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('workers/:workerId/actions')
  workerActions(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.unified.workerCapaList(
      parseInt(workerId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('equipment/:equipmentId/actions')
  equipmentActions(
    @Param('equipmentId') equipmentId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.unified.equipmentCapaList(
      parseInt(equipmentId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('jha/:jhaId/approval-gate')
  jhaApprovalGate(@Param('jhaId') jhaId: string) {
    return this.unified.jhaApprovalGate(jhaId);
  }

  @Get('projects/:projectId/task-gate')
  taskStartGate(
    @Param('projectId') projectId: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.unified.pmTaskStartGate(
      parseInt(projectId, 10),
      workerId ? parseInt(workerId, 10) : undefined,
    );
  }

  @Get('list')
  list(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('overdueOnly') overdueOnly?: string,
  ) {
    return this.capa.list({
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      overdueOnly: overdueOnly === 'true',
    });
  }

  @Get('sync/bundle')
  offlineBundle(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.unified.buildOfflineBundle({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('cail/insights')
  cailInsights(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.cail.insights({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('cail/bundle')
  cailBundle(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.unified.getCailBundle({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Post('sync/apply')
  applyOfflineSync(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      actions?: Array<Record<string, unknown>>;
      clientSyncId?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.applyOfflineSync(
      body.companyId,
      body.projectId,
      { actions: body.actions, clientSyncId: body.clientSyncId },
      req.user.id,
    );
  }

  @Post('overrides/revoke-expired')
  @Roles(...SUPERVISOR_ROLES)
  revokeExpiredOverrides() {
    return this.unified.revokeExpiredOverrides();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.capa.get(id);
  }

  @Put(':id')
  @Roles(...SUPERVISOR_ROLES)
  update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.updateUnified(
      id,
      body as Parameters<PmUnifiedCorrectiveActionService['updateUnified']>[1],
      req.user.id,
    );
  }

  @Post('create')
  @Roles(...SUPERVISOR_ROLES)
  create(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.createUnified(
      {
        ...(body as object),
        createdByUserId: (body.createdByUserId as number) ?? req.user.id,
      } as Parameters<PmUnifiedCorrectiveActionService['createUnified']>[0],
      req.user.id,
    );
  }

  @Post(':id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publish(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.unified.publishAction(id, req.user.id);
  }

  @Post(':id/auto-assign')
  @Roles(...SUPERVISOR_ROLES)
  autoAssign(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.unified.autoAssign(id, req.user.id);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.unified.submitForVerification(id, req.user.id);
  }

  @Post(':id/in-progress')
  inProgress(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.unified.markInProgress(id, req.user.id);
  }

  @Post(':id/signature')
  signature(
    @Param('id') id: string,
    @Body() body: { role: string; signatureData?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.addSignature(id, body, req.user.id);
  }

  @Put(':id/assign')
  @Roles(...SUPERVISOR_ROLES)
  assign(
    @Param('id') id: string,
    @Body()
    body: {
      userId?: number;
      workerId?: number;
      role?: 'primary' | 'secondary';
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.assign(id, body, req.user.id);
  }

  @Post(':id/verify')
  @Roles(...SUPERVISOR_ROLES)
  async verify(
    @Param('id') id: string,
    @Body()
    body: { outcome: 'approve' | 'reject'; role: string; notes?: string },
    @Req() req: { user: { id: number } },
  ) {
    const result = await this.unified.verify(id, body, req.user.id);
    if (body.outcome === 'approve') {
      await this.unified.closeDeficiencyOnVerify(id);
    }
    return result;
  }

  @Post(':id/links')
  addLink(
    @Param('id') id: string,
    @Body() body: { linkType: PmCorrectiveActionLinkType; linkedId: string },
  ) {
    return this.unified.addLink(id, body.linkType, body.linkedId);
  }

  @Post('generate/batch')
  @Roles(...SUPERVISOR_ROLES)
  generateBatch(
    @Body() body: { projectId: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.generateFromAllModules(body.projectId, req.user.id);
  }

  @Post('generate/source')
  @Roles(...SUPERVISOR_ROLES)
  generateSource(
    @Body()
    body: {
      source: string;
      sourceId: string;
      rootCauseId?: string;
      deficiencyId?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.generateFromSource(
      body.source,
      body.sourceId,
      req.user.id,
      body,
    );
  }

  @Post('escalation/sweep')
  @Roles(...SUPERVISOR_ROLES)
  escalationSweep(@Body() body: { projectId: number }) {
    return this.unified.runEscalationSweep(body.projectId);
  }

  @Post('enforcement/evaluate')
  enforcement(
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      workerId?: number;
      equipmentId?: number;
    },
  ) {
    return this.unified.unifiedEnforcement(body);
  }

  @Post('overrides')
  @Roles(...SUPERVISOR_ROLES)
  createOverride(
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      actionId?: string;
      ruleType: string;
      ruleKey: string;
      reason: string;
      expiresAt: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.createOverride(body, req.user.id);
  }

  @Post('attachments')
  addAttachment(
    @Body()
    body: {
      actionId: string;
      fileName?: string;
      mimeType?: string;
      dataUrl?: string;
      phase?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.capa.addAttachment(body.actionId, body, req.user.id);
  }
}
