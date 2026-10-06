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
  PmDeficiencySeverity,
  PmInspectionStatus,
  PmInspectionTemplateStatus,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { toSecurityActor } from '../security/actor.util';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { TenantScoped } from '../security/decorators/tenant-scoped.decorator';
import { PermissionService } from '../security/permission.service';
import { TenantScopeService } from '../security/tenant-scope.service';
import { Permission } from '../security/security.types';
import type { SecurityActor } from '../security/security.types';
import { PmInspectionsService } from './pm-inspections.service';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';
import { PmInspectionsCailIntelligenceService } from './pm-inspections-cail-intelligence.service';
import { PmInspectionPhotoPipelineService } from './pm-inspection-photo-pipeline.service';
import { PmInspectionDashboardService } from './pm-inspection-dashboard.service';
import { PmInspectionContractorDispatchService } from './pm-inspection-contractor-dispatch.service';
import { PmInspectionSubcontractorResolverService } from './pm-inspection-subcontractor-resolver.service';
import { PmSafetyMeetingsService } from '../pm-safety-meetings/pm-safety-meetings.service';
import { AddInspectionSignatureDto } from './dto/add-inspection-signature.dto';
import { PmInspectionReportService } from './pm-inspection-report.service';
import { PmInspectionAccessService } from './pm-inspection-access.service';
import { PmInspectionFindingsLogService } from './pm-inspection-findings-log.service';
import { PmInspectionSharedService } from './pm-inspection-shared.service';
import { AuditInspectionCapaEngineService } from './audit-inspection-capa-engine.service';
import type { AuditInspectionCapaEngineInput } from './audit-inspection-capa-engine.types';
import { isPhotoFirstTemplate } from './pm-inspection-kind.util';
import { parseInspectionSharing } from './pm-inspection-sharing.types';
import {
  CreatePmInspectionTemplateDto,
  UpdatePmInspectionTemplateDto,
} from './dto/pm-inspection-template.dto';

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

@Controller(`${API_V1_PREFIX}/pm/inspections`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class PmInspectionsController {
  constructor(
    private readonly permissions: PermissionService,
    private readonly tenant: TenantScopeService,
    private readonly inspections: PmInspectionsService,
    private readonly templates: PmInspectionTemplatesService,
    private readonly cailIntelligence: PmInspectionsCailIntelligenceService,
    private readonly photoPipeline: PmInspectionPhotoPipelineService,
    private readonly dashboard: PmInspectionDashboardService,
    private readonly contractorDispatch: PmInspectionContractorDispatchService,
    private readonly subcontractorResolver: PmInspectionSubcontractorResolverService,
    private readonly safetyMeetings: PmSafetyMeetingsService,
    private readonly reportService: PmInspectionReportService,
    private readonly inspectionAccess: PmInspectionAccessService,
    private readonly findingsLog: PmInspectionFindingsLogService,
    private readonly sharedReports: PmInspectionSharedService,
    private readonly auditCapaEngine: AuditInspectionCapaEngineService,
  ) {}

  /** AUDIT_INSPECTION_CAPA_ENGINE — structured findings, CAPA, and summaries from audit responses */
  @Post('engine/generate')
  generateAuditCapaEngine(@Body() body: AuditInspectionCapaEngineInput) {
    return this.auditCapaEngine.generate(body);
  }

  @Get('templates')
  listTemplates(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @Query('status') status?: PmInspectionTemplateStatus,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      this.parseOptionalCompanyId(companyId),
    );
    return this.templates.list({
      companyId: effectiveCompanyId,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      category,
      status,
    });
  }

  @Post('templates/seed')
  seedTemplates(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      this.parseOptionalCompanyId(companyId),
    );
    return this.templates.ensureDefaults(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('templates/:id')
  async getTemplate(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const tpl = await this.templates.get(id);
    this.tenant.assertCompanyAccess(toSecurityActor(req.user!), tpl.companyId);
    return tpl;
  }

  @Post('templates')
  @Roles(...SUPERVISOR_ROLES)
  @RequirePermission(Permission.TEMPLATE_MANAGE)
  createTemplate(
    @Req() req: { user?: SecurityActor },
    @Body() body: CreatePmInspectionTemplateDto,
  ) {
    const actor = toSecurityActor(req.user!);
    const companyId = this.tenant.effectiveCompanyId(actor, body.companyId);
    return this.templates.create({
      ...(body as unknown as Record<string, unknown>),
      companyId,
    } as Parameters<PmInspectionTemplatesService['create']>[0]);
  }

  @Put('templates/:id')
  @Roles(...SUPERVISOR_ROLES)
  @RequirePermission(Permission.TEMPLATE_MANAGE)
  async updateTemplate(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
    @Body() body: UpdatePmInspectionTemplateDto,
  ) {
    const tpl = await this.templates.get(id);
    this.tenant.assertCompanyAccess(toSecurityActor(req.user!), tpl.companyId);
    return this.templates.update(id, body as never);
  }

  @Post('templates/:id/publish')
  @Roles(...SUPERVISOR_ROLES)
  @RequirePermission(Permission.TEMPLATE_MANAGE)
  async publishTemplate(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor & { userId?: number } },
  ) {
    const actor = toSecurityActor(req.user!);
    const tpl = await this.templates.get(id);
    this.tenant.assertCompanyAccess(actor, tpl.companyId);
    return this.templates.publish(id, req.user?.userId ?? actor.id);
  }

  @Post('templates/:id/version')
  @Roles(...SUPERVISOR_ROLES)
  @RequirePermission(Permission.TEMPLATE_MANAGE)
  async newVersion(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const tpl = await this.templates.get(id);
    this.tenant.assertCompanyAccess(toSecurityActor(req.user!), tpl.companyId);
    return this.templates.newVersion(id);
  }

  @Post('templates/:id/archive')
  @Roles(...SUPERVISOR_ROLES)
  @RequirePermission(Permission.TEMPLATE_MANAGE)
  async archiveTemplate(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
  ) {
    const tpl = await this.templates.get(id);
    this.tenant.assertCompanyAccess(toSecurityActor(req.user!), tpl.companyId);
    return this.templates.archive(id);
  }

  @Get('shared')
  @RequirePermission(Permission.INSPECTION_VIEW)
  listSharedReports(
    @Req() req: { user?: SecurityActor },
    @Query('projectId') projectId?: string,
  ) {
    return this.sharedReports.listSharedReports(
      toSecurityActor(req.user!),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('projects/:projectId/findings-log')
  @RequirePermission(Permission.INSPECTION_VIEW)
  async projectFindingsLog(
    @Param('projectId') projectId: string,
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId?: string,
  ) {
    await this.inspectionAccess.assertCanViewProjectFindingsLog(
      toSecurityActor(req.user!),
      parseInt(projectId, 10),
    );
    return this.findingsLog.listProjectLog(parseInt(projectId, 10), {
      companyId: companyId ? parseInt(companyId, 10) : undefined,
    });
  }

  @Get('projects/:projectId/contractor-dispatches')
  listContractorDispatches(
    @Param('projectId') projectId: string,
    @Query('companyId') companyId: string,
  ) {
    return this.contractorDispatch.listForContractorCompany(
      parseInt(projectId, 10),
      parseInt(companyId, 10),
    );
  }

  @Get()
  @RequirePermission(Permission.INSPECTION_VIEW)
  @TenantScoped('companyId')
  list(
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: PmInspectionStatus,
    @Query('equipmentId') equipmentId?: string,
  ) {
    return this.inspections.list({
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      status,
      equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
    });
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.inspections.analytics(parseInt(projectId, 10));
  }

  @Get('dashboard/project/:projectId/corrective-board')
  correctiveBoard(@Param('projectId') projectId: string) {
    return this.dashboard.correctiveActionBoard(parseInt(projectId, 10));
  }

  @Get('dashboard/project/:projectId/overdue-alerts')
  overdueAlerts(@Param('projectId') projectId: string) {
    return this.dashboard.overdueAlerts(parseInt(projectId, 10));
  }

  @Get('dashboard/project/:projectId/contractor-performance')
  contractorPerformance(@Param('projectId') projectId: string) {
    return this.dashboard.contractorPerformance(parseInt(projectId, 10));
  }

  @Get('projects/:projectId/subcontractors')
  listProjectSubcontractors(@Param('projectId') projectId: string) {
    return this.subcontractorResolver.listWithNames(parseInt(projectId, 10));
  }

  @Get('intelligence/project/:projectId')
  projectIntelligence(@Param('projectId') projectId: string) {
    return this.cailIntelligence.projectInsights(parseInt(projectId, 10));
  }

  @Get('intelligence/inspector/:userId')
  inspectorScore(
    @Param('userId') userId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.cailIntelligence.inspectorPerformance(
      parseInt(userId, 10),
      parseInt(projectId, 10),
    );
  }

  @Get('access/worker')
  workerAccess(
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.inspections.workerAccessCheck(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @Throttle(30, 60)
  async sync(
    @Req() req: { user?: SecurityActor & { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    const actor = toSecurityActor(req.user!);
    const companyId = this.tenant.effectiveCompanyId(
      actor,
      typeof body.companyId === 'number' ? body.companyId : undefined,
    );
    const actorId = req.user?.userId ?? actor.id;
    const result = await this.inspections.syncOffline({
      ...(body as object),
      companyId,
      inspectorUserId: actorId,
    } as Parameters<PmInspectionsService['syncOffline']>[0]);

    const photoCaptures = body.photoCaptures as
      | Array<{
          dataUrl?: string;
          caption?: string;
          clientSyncId?: string;
          offline?: boolean;
          defaultSubcontractorCompanyId?: number;
        }>
      | undefined;

    if (photoCaptures?.length && result?.id) {
      await this.permissions.assertCanEditInspection(actor, result.id);
      // Enqueue analysis (async by default) so offline sync is not serial×LLM-bound.
      await Promise.all(
        photoCaptures.map((photo) =>
          this.photoPipeline.captureAndAnalyze({
            inspectionId: result.id,
            actorId,
            ...photo,
            offline: true,
            waitForAnalysis: false,
          }),
        ),
      );
    }

    return result;
  }

  @Get(':id')
  @RequirePermission(Permission.INSPECTION_VIEW)
  async get(@Param('id') id: string, @Req() req: { user?: SecurityActor }) {
    await this.permissions.assertCanViewInspection(
      toSecurityActor(req.user!),
      id,
    );
    return this.inspections.get(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Req() req: { user?: SecurityActor & { userId?: number } },
    @Body()
    body: {
      templateId: string;
      companyId: number;
      projectId: number;
      siteId?: number;
      equipmentId?: number;
      workerId?: number;
      title?: string;
      locationNote?: string;
      clientSyncId?: string;
    },
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      body.companyId,
    );
    return this.inspections.createFromTemplate({
      ...body,
      companyId: effectiveCompanyId,
      inspectorUserId: req.user?.userId ?? actor.id ?? 0,
    });
  }

  private parseOptionalCompanyId(raw?: string): number | undefined {
    if (!raw) return undefined;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  @Post('predict')
  predict(
    @Body() body: { templateId: string; answers: Record<string, unknown> },
  ) {
    return this.cailIntelligence.predictFromAnswers(
      body.templateId,
      body.answers,
    );
  }

  @Put(':id/answers')
  @RequirePermission(Permission.INSPECTION_EDIT)
  async saveAnswers(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor & { userId?: number } },
    @Body() body: { answers: Record<string, unknown> },
  ) {
    await this.permissions.assertCanEditInspection(
      toSecurityActor(req.user!),
      id,
    );
    return this.inspections.saveAnswers(id, body.answers, req.user?.userId);
  }

  /** Spec alias: POST /inspection/{id}/items */
  @Post(':id/items')
  @RequirePermission(Permission.INSPECTION_EDIT)
  async saveItems(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor & { userId?: number } },
    @Body()
    body: {
      answers?: Record<string, unknown>;
      items?: Record<string, unknown>;
    },
  ) {
    await this.permissions.assertCanEditInspection(
      toSecurityActor(req.user!),
      id,
    );
    const answers = body.answers ?? body.items ?? {};
    return this.inspections.saveAnswers(id, answers, req.user?.userId);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(Permission.INSPECTION_SUBMIT)
  async submit(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor & { userId?: number } },
  ) {
    await this.permissions.assertCanSubmitInspection(
      toSecurityActor(req.user!),
      id,
    );
    const actorId = req.user?.userId ?? 0;
    const inspection = await this.inspections.get(id);
    if (isPhotoFirstTemplate(inspection.template)) {
      await this.photoPipeline.assertReadyForPhotoFirstSubmit(id);
    }
    await this.photoPipeline.ensureAtRiskAssignmentsOnSubmit(id, actorId);
    return this.inspections.submit(id, actorId);
  }

  @Post(':id/review')
  @Roles(...SUPERVISOR_ROLES)
  review(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: { action: 'approve' | 'reject' | 'request_changes'; notes?: string },
  ) {
    return this.inspections.review(
      id,
      body.action,
      req.user?.userId ?? 0,
      body.notes,
    );
  }

  @Post(':id/signatures')
  addSignature(
    @Param('id') id: string,
    @Body() body: AddInspectionSignatureDto,
  ) {
    return this.inspections.addSignature(id, body);
  }

  @Post(':id/attachments')
  addAttachment(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.inspections.addAttachment(id, body as never);
  }

  @Post(':id/engine/generate')
  async generateAuditCapaEngineFromInspection(@Param('id') id: string) {
    const input = await this.auditCapaEngine.buildInputFromInspection(id);
    return this.auditCapaEngine.generate(input);
  }

  /** Instant photo capture → OCR/hazard detection → findings → CAPA → contractor dispatch */
  @Get(':id/report')
  @RequirePermission(Permission.INSPECTION_VIEW)
  async inspectionReport(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
  ) {
    await this.inspectionAccess.assertCanViewInspectionReport(
      toSecurityActor(req.user!),
      id,
    );
    return this.reportService.buildReport(id);
  }

  @Put(':id/sharing')
  @Roles(...SUPERVISOR_ROLES)
  async updateReportSharing(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
    @Body()
    body: {
      shareReportWithContractors?: boolean;
      shareReportWithWorkers?: boolean;
    },
  ) {
    await this.inspectionAccess.assertCanManageInspectionSharing(
      toSecurityActor(req.user!),
      id,
    );
    return this.inspections.updateSharing(id, body);
  }

  @Put(':id/photos/:attachmentId/metadata')
  @RequirePermission(Permission.INSPECTION_EDIT)
  async savePhotoMetadata(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @Req() req: { user?: SecurityActor & { userId?: number } },
    @Body()
    body: {
      locationDescription: string;
      pictureDescription: string;
      safetyStatus: 'safe' | 'at_risk';
      responsibleCompanyId?: number;
    },
  ) {
    await this.permissions.assertCanEditInspection(
      toSecurityActor(req.user!),
      id,
    );
    return this.photoPipeline.savePhotoMetadata({
      inspectionId: id,
      attachmentId,
      actorId: req.user?.userId ?? 0,
      ...body,
    });
  }

  @Post(':id/photos/capture')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle(60, 60)
  @RequirePermission(Permission.INSPECTION_EDIT)
  async capturePhoto(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor & { userId?: number } },
    @Body()
    body: {
      dataUrl?: string;
      coreFileId?: number;
      fileName?: string;
      mimeType?: string;
      caption?: string;
      clientSyncId?: string;
      offline?: boolean;
      defaultSubcontractorCompanyId?: number;
      checklistItemId?: string;
      locationDescription?: string;
      pictureDescription?: string;
      safetyStatus?: 'safe' | 'at_risk';
      responsibleCompanyId?: number;
    },
  ) {
    await this.permissions.assertCanEditInspection(
      toSecurityActor(req.user!),
      id,
    );
    return this.photoPipeline.captureAndAnalyze({
      inspectionId: id,
      actorId: req.user?.userId ?? 0,
      ...body,
    });
  }

  @Get(':id/photo-findings')
  @RequirePermission(Permission.INSPECTION_VIEW)
  async photoFindings(
    @Param('id') id: string,
    @Req() req: { user?: SecurityActor },
  ) {
    await this.permissions.assertCanViewInspection(
      toSecurityActor(req.user!),
      id,
    );
    return this.dashboard.photoFindingsSummary(id);
  }

  @Post('contractor-dispatch/:dispatchId/acknowledge')
  acknowledgeDispatch(
    @Param('dispatchId') dispatchId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.contractorDispatch.acknowledge(
      dispatchId,
      req.user?.userId ?? 0,
    );
  }

  @Post('contractor-dispatch/:dispatchId/complete')
  completeDispatch(
    @Param('dispatchId') dispatchId: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      storageKey?: string;
      dataUrl?: string;
      fileName?: string;
      mimeType?: string;
      notes?: string;
    },
  ) {
    return this.contractorDispatch.complete(
      dispatchId,
      req.user?.userId ?? 0,
      body,
    );
  }

  @Post('corrective-actions/:actionId/dispatch-contractor')
  @Roles(...SUPERVISOR_ROLES)
  dispatchContractor(
    @Param('actionId') actionId: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: { clientSyncId?: string },
  ) {
    return this.contractorDispatch.dispatchForCorrectiveAction(
      actionId,
      req.user?.userId ?? 0,
      body.clientSyncId,
    );
  }

  @Post(':id/escalate-to-incident')
  @Roles(...SUPERVISOR_ROLES)
  escalateToIncident(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body?: { title?: string; description?: string },
  ) {
    return this.inspections.escalateToIncident(id, req.user?.userId ?? 0, body);
  }

  @Post(':id/draft-safety-meeting')
  @Roles(...SUPERVISOR_ROLES)
  draftSafetyMeeting(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.safetyMeetings
      .createFromInspection(id, req.user?.userId ?? 0)
      .then((result) => result.meeting);
  }

  @Post(':id/deficiencies')
  createDeficiency(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      itemId: string;
      title: string;
      description?: string;
      severity?: PmDeficiencySeverity;
      assignedUserId?: number;
      assignedWorkerId?: number;
      subcontractorCompanyId?: number;
    },
  ) {
    return this.inspections.createManualDeficiency(id, body, req.user?.userId);
  }

  @Post('deficiencies/:deficiencyId/verify')
  @Roles(...SUPERVISOR_ROLES)
  verifyDeficiency(
    @Param('deficiencyId') deficiencyId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.inspections.verifyDeficiency(
      deficiencyId,
      req.user?.userId ?? 0,
    );
  }
}
