import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { RegistryService } from './registry.service';
import { CompanyLinksService } from './company-links.service';
import { EquipmentLinksService } from './equipment-links.service';
import { ProjectsService } from './projects.service';
import { UnionHallsService } from './union-halls.service';
import { UnionHallTrainingService } from './union-hall-training.service';
import {
  LinkUnionHallProviderDto,
  PushUnionHallTrainingDto,
  UnionHallTrainingNotesDto,
} from './dto/union-hall-training.dto';
import { WalletsService } from './wallets.service';
import { TrainingPipelineService } from './training-pipeline.service';
import { InspectionsCoreService } from './inspections-core.service';
import { CompetencyCoreService } from './competency-core.service';
import { VeraPlatformService } from './vera-platform.service';
import { CoreReadinessService } from './core-readiness.service';
import { CoreDocumentsService } from './core-documents.service';
import { ProviderIntegrationHubService } from './provider-integration-hub.service';
import { VeraCoreHubService } from './vera-core-hub.service';
import { TrainingIngestionService } from '../../training-ingestion/training-ingestion.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { LinkEquipmentByQrDto } from './dto/link-equipment-qr.dto';
import { SearchWorkersDto } from './dto/search-workers.dto';
import { LinkWorkerDto, LinkWorkerByQrDto } from './dto/link-worker.dto';
import { MergeWorkerDto } from './dto/merge-worker.dto';
import { CreateProjectDto, AssignToProjectDto } from './dto/create-project.dto';
import {
  CreateUnionHallDto,
  AddUnionMemberDto,
  DispatchWorkerDto,
} from './dto/union-hall.dto';
import { TrainingIngestDto } from './dto/training-ingest.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { CompetencyEvaluateDto } from './dto/competency-evaluate.dto';
import {
  COMPANY_ADMIN_ROLES,
  STAFF_ROLES,
  SUPERVISOR_ROLES,
  SUPER_ADMIN_ROLES,
  UNION_HALL_ROLES,
} from './roles';
import { toSecurityActor } from '../../security/actor.util';
import { RequirePermission } from '../../security/decorators/require-permission.decorator';
import { TenantScoped } from '../../security/decorators/tenant-scoped.decorator';
import { PermissionService } from '../../security/permission.service';
import { TenantScopeService } from '../../security/tenant-scope.service';
import { Permission } from '../../security/security.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/core`)
export class VeraCoreController {
  constructor(
    private readonly registry: RegistryService,
    private readonly companyLinks: CompanyLinksService,
    private readonly equipmentLinks: EquipmentLinksService,
    private readonly projects: ProjectsService,
    private readonly unionHalls: UnionHallsService,
    private readonly unionHallTraining: UnionHallTrainingService,
    private readonly wallets: WalletsService,
    private readonly trainingPipeline: TrainingPipelineService,
    private readonly inspections: InspectionsCoreService,
    private readonly competency: CompetencyCoreService,
    private readonly platform: VeraPlatformService,
    private readonly readiness: CoreReadinessService,
    private readonly permissions: PermissionService,
    private readonly tenant: TenantScopeService,
    private readonly documents: CoreDocumentsService,
    private readonly trainingIngestion: TrainingIngestionService,
    private readonly digitalTwin: DigitalTwinService,
    private readonly providerHub: ProviderIntegrationHubService,
    private readonly hub: VeraCoreHubService,
  ) {}

  // —— Core hub dashboard metrics ——
  @Get('hub/metrics')
  @Roles(...SUPERVISOR_ROLES)
  hubMetrics(
    @Query('companyId') companyId?: string,
    @Req() req?: { user?: { id: number } },
  ) {
    return this.hub.getHubMetrics(
      companyId ? Number(companyId) : undefined,
      req?.user?.id,
    );
  }

  // —— Platform hub (all modules) ——
  @Get('platform/summary')
  @Roles(...SUPERVISOR_ROLES)
  platformSummary(@Query('companyId') companyId?: string) {
    return this.platform.getPlatformSummary(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Post('platform/notify-due')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  platformNotifyDue(@Query('companyId') companyId?: string) {
    return this.platform.runScheduledNotifications(
      companyId ? Number(companyId) : undefined,
    );
  }

  // —— Global worker registry ——
  @Get('workers/search')
  @Roles(...STAFF_ROLES)
  searchWorkers(@Query() query: SearchWorkersDto) {
    return this.registry.searchWorkers(query);
  }

  @Get('workers/:id/profile')
  @Roles(...STAFF_ROLES, UserRole.WORKER)
  workerProfile(@Param('id', ParseIntPipe) id: number) {
    return this.registry.getWorkerProfile(id);
  }

  @Get('workers/:id/duplicates')
  @Roles(...SUPER_ADMIN_ROLES, UserRole.COMPANY_ADMIN)
  workerDuplicates(@Param('id', ParseIntPipe) id: number) {
    return this.registry.findDuplicateWorkers(id);
  }

  @Post('workers/merge')
  @Roles(...SUPER_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  mergeWorkers(
    @Body() dto: MergeWorkerDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.registry.mergeWorkers(
      dto.survivorId,
      dto.mergedId,
      req.user.id,
      dto.reason,
    );
  }

  // —— Global equipment registry ——
  @Get('equipment/search')
  @Roles(...STAFF_ROLES)
  searchEquipment(
    @Query('q') q?: string,
    @Query('serial') serial?: string,
    @Query('assetTag') assetTag?: string,
    @Query('qr') qr?: string,
    @Query('limit') limit?: string,
  ) {
    return this.registry.searchEquipment({
      q,
      serial,
      assetTag,
      qr,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('equipment/:id/profile')
  @Roles(...STAFF_ROLES)
  equipmentProfile(@Param('id', ParseIntPipe) id: number) {
    return this.registry.getEquipmentProfile(id);
  }

  @Post('equipment/merge')
  @Roles(...SUPER_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  mergeEquipment(
    @Body() body: { survivorId: number; mergedId: number; reason?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.registry.mergeEquipment(
      body.survivorId,
      body.mergedId,
      req.user.id,
      body.reason,
    );
  }

  // —— Company links ——
  @Get('companies/:companyId/workers')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  companyWorkers(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.companyLinks.listByCompany(companyId, activeOnly !== 'false');
  }

  @Post('company-links')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.CREATED)
  linkWorker(@Body() dto: LinkWorkerDto) {
    return this.companyLinks.linkWorker(dto.workerId, dto.companyId, {
      role: dto.role,
      trade: dto.trade,
      deactivateOtherCompanies: dto.deactivateOtherCompanies,
    });
  }

  @Post('company-links/scan')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  linkWorkerByQr(@Body() dto: LinkWorkerByQrDto) {
    return this.companyLinks.linkByQrToken(dto.qrToken, dto.companyId);
  }

  @Post('company-links/:workerId/:companyId/end')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.OK)
  endWorkerAssignment(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyLinks.endAssignment(workerId, companyId);
  }

  @Post('company-links/:workerId/:companyId/activate')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  activateWorker(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companyLinks.activate(workerId, companyId);
  }

  // —— Equipment links ——
  @Get('companies/:companyId/equipment')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  companyEquipment(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.equipmentLinks.listByCompany(companyId, activeOnly !== 'false');
  }

  @Post('equipment-links')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.CREATED)
  linkEquipment(@Body() body: { equipmentId: number; companyId: number }) {
    return this.equipmentLinks.linkEquipment(body.equipmentId, body.companyId);
  }

  @Post('equipment-links/scan')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.OK)
  async linkEquipmentByQr(@Body() body: LinkEquipmentByQrDto) {
    const link = await this.equipmentLinks.linkByQrToken(
      body.qrToken,
      body.companyId,
    );
    const summary = await this.wallets.getEquipmentWallet(link.equipmentId);
    return {
      linked: true,
      equipmentId: link.equipmentId,
      companyId: body.companyId,
      linkId: link.id,
      complianceStatus: link.complianceStatus,
      equipmentName: link.equipment?.name ?? null,
      walletUrl: `/equipment/${link.equipmentId}/wallet`,
      summary,
    };
  }

  @Post('equipment-links/:equipmentId/:companyId/end')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  endEquipmentAssignment(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.equipmentLinks.endAssignment(equipmentId, companyId);
  }

  // —— Projects ——
  @Get('companies/:companyId/projects')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  listProjects(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.projects.listByCompany(companyId);
  }

  @Post('projects')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.PROJECT_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  createProject(@Body() dto: CreateProjectDto) {
    return this.projects.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
    });
  }

  @Post('projects/:projectId/assign-worker')
  @Roles(...SUPERVISOR_ROLES)
  assignWorker(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AssignToProjectDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.projects.assignWorker(
      projectId,
      dto.workerId!,
      req.user.id,
      dto.equipmentId,
    );
  }

  @Post('projects/:projectId/assign-equipment')
  @Roles(...SUPERVISOR_ROLES)
  assignEquipment(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AssignToProjectDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.projects.assignEquipment(
      projectId,
      dto.equipmentId!,
      req.user.id,
    );
  }

  @Post('projects/:projectId/remove-worker')
  @Roles(...SUPERVISOR_ROLES)
  removeWorker(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AssignToProjectDto,
  ) {
    return this.projects.removeWorker(projectId, dto.workerId!);
  }

  @Post('projects/:projectId/close')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.PROJECT_MANAGER)
  closeProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projects.close(projectId);
  }

  // —— Union halls ——
  @Get('union-halls')
  @Roles(...UNION_HALL_ROLES)
  listUnionHalls() {
    return this.unionHalls.listHalls();
  }

  @Post('union-halls')
  @Roles(...SUPER_ADMIN_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createUnionHall(@Body() dto: CreateUnionHallDto) {
    return this.unionHalls.createHall(dto);
  }

  @Get('union-halls/:id/members')
  @Roles(...UNION_HALL_ROLES)
  unionMembers(@Param('id', ParseIntPipe) id: number) {
    return this.unionHalls.listMembers(id);
  }

  @Post('union-halls/:id/members')
  @Roles(...UNION_HALL_ROLES)
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddUnionMemberDto,
  ) {
    return this.unionHalls.addMember(id, dto);
  }

  @Post('union-halls/:id/dispatch')
  @Roles(...UNION_HALL_ROLES)
  dispatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DispatchWorkerDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.unionHalls.dispatchWorker(
      id,
      dto.workerId,
      dto.companyId,
      req.user.id,
      dto.notes,
    );
  }

  @Post('union-halls/:id/recall')
  @Roles(...UNION_HALL_ROLES)
  recall(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DispatchWorkerDto,
  ) {
    return this.unionHalls.recallWorker(id, dto.workerId, dto.companyId);
  }

  @Get('union-halls/:id/training-dashboard')
  @Roles(...UNION_HALL_ROLES, ...SUPER_ADMIN_ROLES)
  unionHallTrainingDashboard(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: number; role: string; unionHallId?: number } },
  ) {
    return this.unionHallTraining.getDashboard(id, req.user);
  }

  @Get('union-halls/:id/training/pending')
  @Roles(...UNION_HALL_ROLES, ...SUPER_ADMIN_ROLES)
  unionHallPendingTraining(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: number; role: string; unionHallId?: number } },
  ) {
    return this.unionHallTraining.listPending(id, req.user);
  }

  @Post('union-halls/:id/providers/link')
  @Roles(...UNION_HALL_ROLES, ...SUPER_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  linkUnionHallProvider(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LinkUnionHallProviderDto,
    @Req() req: { user: { id: number; role: string; unionHallId?: number } },
  ) {
    return this.unionHallTraining.linkProvider(
      id,
      dto.trainingProviderId,
      req.user,
    );
  }

  @Post('union-halls/:id/training/:recordId/accept')
  @Roles(...UNION_HALL_ROLES, ...SUPER_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  acceptUnionHallTraining(
    @Param('id', ParseIntPipe) id: number,
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() dto: UnionHallTrainingNotesDto,
    @Req() req: { user: { id: number; role: string; unionHallId?: number } },
  ) {
    return this.unionHallTraining.acceptTraining(
      id,
      recordId,
      req.user,
      dto.notes,
    );
  }

  @Post('union-halls/:id/training/:recordId/reject')
  @Roles(...UNION_HALL_ROLES, ...SUPER_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  rejectUnionHallTraining(
    @Param('id', ParseIntPipe) id: number,
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() dto: UnionHallTrainingNotesDto,
    @Req() req: { user: { id: number; role: string; unionHallId?: number } },
  ) {
    return this.unionHallTraining.rejectTraining(
      id,
      recordId,
      req.user,
      dto.notes,
    );
  }

  @Post('union-halls/:id/training/:recordId/validate')
  @Roles(...UNION_HALL_ROLES, ...SUPER_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  validateUnionHallTraining(
    @Param('id', ParseIntPipe) id: number,
    @Param('recordId', ParseIntPipe) recordId: number,
    @Req() req: { user: { id: number; role: string; unionHallId?: number } },
  ) {
    return this.unionHallTraining.validateTraining(id, recordId, req.user);
  }

  @Post('union-halls/:id/training/:recordId/push')
  @Roles(...UNION_HALL_ROLES, ...SUPER_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  pushUnionHallTraining(
    @Param('id', ParseIntPipe) id: number,
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() dto: PushUnionHallTrainingDto,
    @Req() req: { user: { id: number; role: string; unionHallId?: number } },
  ) {
    return this.unionHallTraining.pushTraining(id, recordId, req.user, dto);
  }

  // —— Wallets ——
  @Get('wallets/worker/:id')
  @Roles(...STAFF_ROLES)
  workerWallet(@Param('id', ParseIntPipe) id: number) {
    return this.wallets.getWorkerWallet(id);
  }

  @Get('wallets/worker/:id/full')
  @Roles(...STAFF_ROLES)
  workerWalletFull(@Param('id', ParseIntPipe) id: number) {
    return this.wallets.getWorkerWallet(id);
  }

  @Get('wallets/equipment/:id')
  @Roles(...STAFF_ROLES)
  equipmentWallet(@Param('id', ParseIntPipe) id: number) {
    return this.wallets.getEquipmentWallet(id);
  }

  @Get('wallets/equipment/:id/full')
  @Roles(...STAFF_ROLES)
  equipmentWalletFull(@Param('id', ParseIntPipe) id: number) {
    return this.wallets.getEquipmentWalletFull(id);
  }

  // —— Training pipeline ——
  @Post('training/ingest')
  @Roles(...COMPANY_ADMIN_ROLES, ...UNION_HALL_ROLES, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.CREATED)
  trainingIngest(@Body() dto: TrainingIngestDto) {
    return this.trainingPipeline.ingest({
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
    });
  }

  // —— Inspections ——
  @Post('inspections')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createInspection(
    @Body() dto: CreateInspectionDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.inspections.createInspection({
      ...dto,
      inspectorId: req.user.id,
    });
  }

  @Get('equipment/:id/inspections')
  @Roles(...STAFF_ROLES)
  equipmentInspections(@Param('id', ParseIntPipe) id: number) {
    return this.inspections.listForEquipment(id);
  }

  // —— Competency ——
  @Post('competency/evaluate')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  competencyEvaluate(
    @Body() dto: CompetencyEvaluateDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.competency.evaluate({
      ...dto,
      evaluatorUserId: req.user.id,
    });
  }

  @Get('workers/:id/competency')
  @Roles(...STAFF_ROLES)
  workerCompetency(@Param('id', ParseIntPipe) id: number) {
    return this.competency.listForWorker(id);
  }

  // —— Readiness engine ——
  @Get('readiness/summary')
  @Roles(...SUPERVISOR_ROLES)
  @RequirePermission(Permission.COMPANY_READINESS_VIEW)
  @TenantScoped('companyId')
  async readinessSummary(
    @Query('companyId') companyId: string | undefined,
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
  ) {
    const actor = toSecurityActor(req.user);
    const resolved = companyId ? Number(companyId) : undefined;
    await this.permissions.assertCanViewCompanyReadiness(actor, resolved);
    return this.readiness.summary(resolved, actor.id);
  }

  @Get('readiness/workers/:id')
  @Roles(...STAFF_ROLES)
  @RequirePermission(Permission.WORKER_VIEW)
  async workerReadiness(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
  ) {
    await this.permissions.assertCanViewWorker(toSecurityActor(req.user), id);
    return this.readiness.workerScore(id);
  }

  @Get('readiness/equipment/:id')
  @Roles(...STAFF_ROLES)
  async equipmentReadiness(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
  ) {
    const actor = toSecurityActor(req.user);
    this.permissions.assertPermission(actor, Permission.CORE_ACCESS);
    await this.tenant.assertEquipmentInTenant(actor, id);
    return this.readiness.equipmentScore(id);
  }

  // —— Document storage ——
  @Get('documents')
  @Roles(...STAFF_ROLES)
  listDocuments(
    @Query('purpose') purpose?: string,
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('linked_project_id') linkedProjectId?: string,
    @Query('limit') limit?: string,
    @Query('mine') mine?: string,
    @Req() req?: { user?: { id: number; companyId?: number | null } },
  ) {
    const parsedCompany = companyId ? Number(companyId) : undefined;
    const resolvedCompany =
      parsedCompany != null && Number.isFinite(parsedCompany)
        ? parsedCompany
        : req?.user?.companyId ?? undefined;
    const projectRaw = projectId ?? linkedProjectId;
    const parsedProject = projectRaw ? Number(projectRaw) : undefined;
    const mineOnly = mine === '1' || mine === 'true';
    return this.documents.listDocuments({
      purpose,
      companyId: resolvedCompany,
      projectId:
        parsedProject != null && Number.isFinite(parsedProject)
          ? parsedProject
          : undefined,
      userId: mineOnly ? req?.user?.id : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // —— Training ingestion (Core facade) ——
  @Get('training/runs')
  @Roles(...COMPANY_ADMIN_ROLES, ...UNION_HALL_ROLES, UserRole.SUPERVISOR)
  trainingIngestionRuns(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.trainingIngestion.listRuns({
      companyId,
      status,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('training/verification-queue')
  @Roles(...COMPANY_ADMIN_ROLES, ...UNION_HALL_ROLES, UserRole.SUPERVISOR)
  trainingVerificationQueue(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('limit') limit?: string,
  ) {
    return this.trainingIngestion.verificationQueue(
      companyId,
      limit ? Number(limit) : undefined,
    );
  }

  // —— Provider integration hub ——
  @Get('provider-hub/summary')
  @Roles(...SUPERVISOR_ROLES)
  @RequirePermission(Permission.CORE_ACCESS)
  @TenantScoped('companyId')
  async providerHubSummary(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
  ) {
    const actor = toSecurityActor(req.user);
    this.tenant.assertCompanyAccess(actor, companyId);
    return this.providerHub.getSummary(companyId);
  }

  // —— Digital twin generator ——
  @Post('twins/hydrate')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.OK)
  hydrateTwins(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.digitalTwin.hydrateCompany(companyId);
  }

  @Get('twins/dashboard')
  @Roles(...SUPERVISOR_ROLES)
  twinsDashboard() {
    return this.digitalTwin.getDashboard();
  }
}
