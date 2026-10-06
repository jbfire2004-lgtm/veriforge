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
  PmSafetyEventStatus,
  PmSafetyEventType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmSafetyEventsService } from './pm-safety-events.service';
import { PmSafetyEventsLibraryService } from './pm-safety-events-library.service';
import { PmSafetyEventsIntelligenceService } from './pm-safety-events-intelligence.service';
import { PmSafetyEventsInvestigationService } from './pm-safety-events-investigation.service';
import { PmInvestigationReportService } from './pm-investigation-report.service';
import { IncidentSifEngineService } from './incident-sif-engine.service';
import type { IncidentSifEngineInput } from './incident-sif-engine.types';
import { evaluateDangerousOccurrences } from '../verisuite-sms/services/dangerous-occurrence.engine';

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

@Controller(`${API_V1_PREFIX}/pm/incidents`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmSafetyEventsController {
  constructor(
    private readonly events: PmSafetyEventsService,
    private readonly library: PmSafetyEventsLibraryService,
    private readonly intelligence: PmSafetyEventsIntelligenceService,
    private readonly investigation: PmSafetyEventsInvestigationService,
    private readonly report: PmInvestigationReportService,
    private readonly incidentEngine: IncidentSifEngineService,
  ) {}

  /** INCIDENT_SIF_ENGINE — structured investigation with SIF focus, RCA, and CAPA */
  @Post('engine/generate')
  generateIncidentEngine(@Body() body: IncidentSifEngineInput) {
    return this.incidentEngine.generate(body);
  }

  @Get('library/root-causes')
  rootCauses(@Query('companyId') companyId: string) {
    return this.library.rootCauses(parseInt(companyId, 10));
  }

  @Get('library/contributing-factors')
  contributingFactors(@Query('companyId') companyId: string) {
    return this.library.contributingFactors(parseInt(companyId, 10));
  }

  @Post('library/seed')
  @Roles(...SUPERVISOR_ROLES)
  seedLibrary(@Query('companyId') companyId: string) {
    return this.library.ensureLibraries(parseInt(companyId, 10));
  }

  @Get()
  list(
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: PmSafetyEventStatus,
    @Query('eventType') eventType?: PmSafetyEventType,
  ) {
    return this.events.list({
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      status,
      eventType,
    });
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.intelligence.projectAnalytics(parseInt(projectId, 10));
  }

  @Get('access/worker')
  workerAccess(
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.events.workerAccessCheck(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Post('sync')
  sync(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.events.syncOffline({
      ...(body as object),
      createdByUserId:
        (body.createdByUserId as number) ?? req.user?.userId ?? 0,
    } as Parameters<PmSafetyEventsService['syncOffline']>[0]);
  }

  /** Province-specific dangerous occurrence auto-flag + required reporting. */
  @Post('ohs/evaluate')
  evaluateOhs(
    @Body() body: { text?: string; title?: string; description?: string; regionCode?: string },
  ) {
    const text = [body?.title, body?.description, body?.text]
      .filter(Boolean)
      .join(' ');
    return evaluateDangerousOccurrences(text, body?.regionCode ?? 'CA-AB');
  }

  /** Spec alias: POST /incident/offline/sync */
  @Post('offline/sync')
  syncOfflineAlias(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.events.syncOffline({
      ...(body as object),
      createdByUserId:
        (body.createdByUserId as number) ?? req.user?.userId ?? 0,
    } as Parameters<PmSafetyEventsService['syncOffline']>[0]);
  }

  @Post(':id/engine/generate')
  generateIncidentEngineFromEvent(@Param('id') id: string) {
    return this.events.get(id).then((event) => {
      const input = this.incidentEngine.inputFromEvent(event);
      return this.incidentEngine.generate(input);
    });
  }

  @Get(':id/score')
  score(@Param('id') id: string) {
    return this.intelligence.getEventScore(id);
  }

  @Get(':id/predict')
  predict(@Param('id') id: string) {
    return this.intelligence.predictFromEvent(id);
  }

  @Get(':id/timeline')
  timeline(@Param('id') id: string) {
    return this.events.listTimeline(id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.events.get(id);
  }

  @Post()
  create(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      companyId: number;
      projectId: number;
      title: string;
      description?: string;
      eventType?: PmSafetyEventType;
      siteId?: number;
      locationNote?: string;
      clientSyncId?: string;
      regionCode?: string;
    },
  ) {
    return this.events.createDraft({
      ...body,
      createdByUserId: req.user?.userId ?? 0,
    });
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.events.update(id, body as never, req.user?.userId);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.events.submit(id, req.user?.userId ?? 0);
  }

  @Post(':id/review')
  @Roles(...SUPERVISOR_ROLES)
  review(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: { action: 'approve' | 'reject' | 'request_changes'; notes?: string },
  ) {
    return this.events.review(
      id,
      body.action,
      req.user?.userId ?? 0,
      body.notes,
    );
  }

  /** Spec alias: POST /incident/{id}/approve */
  @Post(':id/approve')
  @Roles(...SUPERVISOR_ROLES)
  approve(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body?: { notes?: string },
  ) {
    return this.events.review(
      id,
      'approve',
      req.user?.userId ?? 0,
      body?.notes,
    );
  }

  @Post(':id/close')
  @Roles(...SUPERVISOR_ROLES)
  close(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.events.close(id, req.user?.userId ?? 0);
  }

  @Post(':id/timeline')
  addTimeline(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: { description: string; timestamp?: string },
  ) {
    return this.events.addTimelineEntry(id, {
      description: body.description,
      timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
      actorId: req.user?.userId,
    });
  }

  @Get(':id/rca/suggest')
  suggestRca(@Param('id') id: string) {
    return this.events.suggestRootCauses(id);
  }

  @Post(':id/rca')
  addRca(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.events.addRootCause(id, body as never, req.user?.userId);
  }

  @Post(':id/injuries')
  addInjury(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.events.addInjury(id, body as never);
  }

  @Post(':id/people')
  addPerson(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.events.addPerson(id, body as never);
  }

  @Post(':id/equipment')
  linkEquipment(
    @Param('id') id: string,
    @Body()
    body: {
      equipmentId: number;
      failureNotes?: string;
      conditionScore?: number;
    },
  ) {
    return this.events.linkEquipment(
      id,
      body.equipmentId,
      body.failureNotes,
      body.conditionScore,
    );
  }

  @Post(':id/witnesses')
  addWitness(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: { name: string; contact?: string; workerId?: number },
  ) {
    return this.events.addWitness(id, body, req.user?.userId);
  }

  @Post(':id/statements')
  addStatement(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.events.addStatement(id, body as never);
  }

  @Post(':id/attachments')
  addAttachment(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.events.addAttachment(id, body as never);
  }

  @Post(':id/contributing-factors')
  addFactor(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.events.addContributingFactor(id, body as never);
  }

  // ─── Investigation v2 endpoints ───────────────────────────────────────────

  @Post(':id/investigation/open')
  @Roles(...SUPERVISOR_ROLES)
  openInvestigation(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.investigation.getOrCreate(id, req.user?.userId);
  }

  @Get(':id/investigation')
  getInvestigation(@Param('id') id: string) {
    return this.investigation.getOrCreate(id);
  }

  @Put(':id/investigation')
  updateInvestigation(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.investigation.update(id, body as never);
  }

  @Get(':id/investigation/guided-questions')
  guidedQuestions(@Param('id') id: string) {
    return this.investigation.guidedQuestions(id);
  }

  @Post(':id/investigation/guided-answers')
  saveGuidedAnswers(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: { answers: Record<string, string> },
  ) {
    return this.investigation.saveGuidedAnswers(
      id,
      body.answers,
      req.user?.userId,
    );
  }

  @Get(':id/investigation/causal-tree')
  causalTree(@Param('id') id: string) {
    return this.investigation.getCausalTree(id);
  }

  @Post(':id/investigation/regenerate-causal-tree')
  regenerateCausalTree(@Param('id') id: string) {
    return this.investigation.regenerateCausalTree(id);
  }

  @Get(':id/investigation/suggest')
  suggestInvestigation(@Param('id') id: string) {
    return this.investigation.suggestFactorsAndRca(id);
  }

  @Get(':id/investigation/report')
  investigationReport(@Param('id') id: string) {
    return this.report.buildReport(id);
  }

  @Get(':id/investigation/report/html')
  async investigationReportHtml(@Param('id') id: string) {
    const r = await this.report.buildReport(id);
    return r.html;
  }
}
