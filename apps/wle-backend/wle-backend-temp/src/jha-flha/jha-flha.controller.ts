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
import {
  JhaFlhaKind,
  JhaFlhaSignatureRole,
  JhaFlhaStatus,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { JhaFlhaService } from './jha-flha.service';
import { JhaLibraryService } from './jha-library.service';
import { JhaFlhaOrchestratorService } from './jha-flha-orchestrator.service';
import { JhaFlhaEngineService } from './jha-flha-engine.service';
import type { JhaFlhaEngineInput } from './jha-flha-engine.types';
import { packLabels } from './jha-industry-packs';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/jha-flha`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class JhaFlhaController {
  constructor(
    private readonly jha: JhaFlhaService,
    private readonly library: JhaLibraryService,
    private readonly orchestrator: JhaFlhaOrchestratorService,
    private readonly engine: JhaFlhaEngineService,
  ) {}

  /** JHA_FLHA_ENGINE — structured JHA/FLHA generation for field crews */
  @Post('engine/generate')
  generateJhaFlha(@Body() body: JhaFlhaEngineInput) {
    return this.engine.generate(body);
  }

  @Get()
  list(
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: JhaFlhaStatus,
    @Query('kind') kind?: JhaFlhaKind,
  ) {
    return this.jha.list({
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      status,
      kind,
    });
  }

  @Post()
  create(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      kind?: JhaFlhaKind;
      companyId: number;
      projectId: number;
      siteId?: number;
      workPackageId?: string;
      taskId?: string;
      taskLibraryId?: string;
      taskDescription: string;
      workScope?: string;
      locationNote?: string;
      environmentalJson?: Record<string, unknown>;
      clientSyncId?: string;
    },
  ) {
    return this.jha.create({ ...body, createdByUserId: req.user?.userId });
  }

  @Get('library/energy-wheel')
  energyWheel() {
    return this.library.energyWheel();
  }

  @Get('library/hazards')
  async hazards(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('taskCode') taskCode?: string,
  ) {
    const rows = await this.library.listHazards(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
      taskCode,
    );
    return rows.map((h) => this.library.mapHazardRow(h));
  }

  @Get('library/controls')
  async controls(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
  ) {
    const rows = await this.library.listControls(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
      category,
    );
    return rows.map((c) => this.library.mapControlRow(c));
  }

  @Get('library/tasks')
  tasks(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.library.listTasks(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('library/packs')
  async libraryPacks(@Query('companyId') companyId: string) {
    const cid = parseInt(companyId, 10);
    const packIds = await this.library.resolveCompanyPacks(cid);
    return { packIds, labels: packLabels(packIds) };
  }

  @Get('library/learnings')
  async projectLearnings(@Query('projectId') projectId: string) {
    return this.library.getProjectLearnings(parseInt(projectId, 10));
  }

  @Get('library/suggest')
  async suggestLibrary(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('taskDescription') taskDescription?: string,
    @Query('locationNote') locationNote?: string,
    @Query('weather') weather?: string,
    @Query('hazardCategories') hazardCategories?: string,
    @Query('energyTypes') energyTypes?: string,
    @Query('existingHazards') existingHazards?: string,
    @Query('existingControls') existingControls?: string,
    @Query('focusedHazardCategory') focusedHazardCategory?: string,
    @Query('focusedHazardEnergyTypes') focusedHazardEnergyTypes?: string,
    @Query('focusedHazardDescription') focusedHazardDescription?: string,
  ) {
    const cid = parseInt(companyId, 10);
    const pid = projectId ? parseInt(projectId, 10) : undefined;
    const hazards = await this.library.listHazards(cid, pid);
    const controls = await this.library.listControls(cid, pid);
    const categories = hazardCategories?.split(',').filter(Boolean) ?? [];
    const energies = energyTypes?.split(',').filter(Boolean) ?? [];
    const existingH = existingHazards?.split('|').filter(Boolean) ?? [];
    const existingC = existingControls?.split('|').filter(Boolean) ?? [];
    const focusedEnergies =
      focusedHazardEnergyTypes?.split(',').filter(Boolean) ?? [];

    return this.library.suggest(
      {
        taskDescription,
        locationNote,
        weather,
        selectedHazardCategories: categories,
        selectedEnergyTypes: energies,
        existingHazardDescriptions: existingH,
        existingControlDescriptions: existingC,
        focusedHazardCategory,
        focusedHazardEnergyTypes: focusedEnergies,
        focusedHazardDescription,
        hazardLibrary: hazards.map((h) => this.library.mapHazardRow(h)),
        controlLibrary: controls.map((c) => this.library.mapControlRow(c)),
      },
      pid,
    );
  }

  @Post('library/hazards')
  createLibraryHazard(
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      category: string;
      description: string;
      subcategory?: string;
      defaultEnergyTypes?: string[];
    },
  ) {
    return this.library.createHazard(body);
  }

  @Post('library/controls')
  createLibraryControl(
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      controlType: string;
      description: string;
      hazardCategories?: string[];
      ppeRequired?: boolean;
    },
  ) {
    return this.library.createControl(body);
  }

  @Get('analytics')
  analytics(@Query('projectId') projectId: string) {
    return this.jha.getProjectAnalytics(parseInt(projectId, 10));
  }

  @Get('compliance/worker')
  workerCompliance(
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.jha.workerCompliance(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Post('sync')
  sync(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.jha.syncOffline({
      ...(body as Parameters<JhaFlhaService['syncOffline']>[0]),
      actorId: req.user?.userId,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.jha.getById(id);
  }

  @Put(':id')
  updateDraft(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.jha.updateDraft(
      id,
      body as Parameters<JhaFlhaService['updateDraft']>[1],
      req.user?.userId,
    );
  }

  @Post(':id/hazards')
  addHazard(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: Parameters<JhaFlhaService['addHazard']>[1],
  ) {
    return this.jha.addHazard(id, body, req.user?.userId);
  }

  @Post(':id/controls')
  addControl(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: Parameters<JhaFlhaService['addControl']>[1],
  ) {
    return this.jha.addControl(id, body, req.user?.userId);
  }

  @Post(':id/energy-sources')
  setEnergy(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: { sources: Parameters<JhaFlhaService['setEnergySources']>[1] },
  ) {
    return this.jha.setEnergySources(id, body.sources, req.user?.userId);
  }

  @Post(':id/crew')
  setCrew(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: { workers: Array<{ workerId: number; role?: string }> },
  ) {
    return this.jha.setCrew(id, body.workers, req.user?.userId);
  }

  @Post(':id/equipment')
  setEquipment(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: { items: Array<{ equipmentId: number; authorized?: boolean }> },
  ) {
    return this.jha.setEquipment(id, body.items, req.user?.userId);
  }

  @Get(':id/score')
  score(@Param('id') id: string) {
    return this.jha.getScore(id);
  }

  @Post(':id/evaluate')
  evaluate(@Param('id') id: string) {
    return this.jha.evaluate(id);
  }

  @Get(':id/orchestrator')
  orchestratorAnalysis(@Param('id') id: string) {
    return this.orchestrator.analyze(id);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.jha.submit(id, req.user?.userId);
  }

  @Post(':id/review')
  review(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      action: 'approve' | 'reject' | 'request_changes';
      reviewNotes?: string;
    },
  ) {
    return this.jha.supervisorReview(
      id,
      body.action,
      req.user?.userId,
      body.reviewNotes,
    );
  }

  @Post(':id/lock')
  lock(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.jha.lock(id, req.user?.userId);
  }

  @Post(':id/sign')
  sign(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      role: JhaFlhaSignatureRole;
      signatureData: string;
      signerName?: string;
      workerId?: number;
    },
  ) {
    return this.jha.sign(id, { ...body, signerUserId: req.user?.userId });
  }

  @Post(':id/attachments')
  addAttachment(
    @Param('id') id: string,
    @Body()
    body: {
      fileName: string;
      mimeType?: string;
      storageKey?: string;
      dataUrl?: string;
    },
  ) {
    return this.jha.addAttachment(id, body);
  }

  @Get(':id/suggestions')
  suggestions(@Param('id') id: string) {
    return this.jha.getSuggestions(id);
  }
}
