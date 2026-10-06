import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  SmsDrillRosterStatus,
  SmsErpScenario,
  SmsMeetingType,
  SmsPeriodGrain,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { SMS_API_PREFIX, SMS_ROLES } from '../constants';
import { SmsExceptionFilter } from '../common/sms-exception.filter';
import { SmsIdempotencyService } from '../common/sms-idempotency.service';
import { parseSmsPage } from '../common/sms-pagination';
import { getSmsScope, PlaneScopeGuard } from '../guards/plane-scope.guard';
import { smsEnvelope } from '../types';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import { IndustryBenchmarkEngine } from '../engines/industry-benchmark.engine';
import { RegionalDrilldownEngine } from '../engines/regional-drilldown.engine';
import { AiInsightsCacheService } from '../services/ai-insights-cache.service';
import { IncidentInvestigationService } from '../services/incident-investigation.service';
import { ErpGenerationService } from '../services/erp-generation.service';
import { JhaTemplateService } from '../services/jha-template.service';
import { CompetencyCorrelationService } from '../services/competency-correlation.service';
import { SmsDashboardService } from '../services/sms-dashboard.service';
import { SmsFlhaApiService } from '../services/sms-flha-api.service';
import { SmsJhaApiService } from '../services/sms-jha-api.service';
import { SmsEmsErpApiService } from '../services/sms-ems-erp-api.service';
import { ErpDrillService } from '../services/erp-drill.service';
import { evaluateDangerousOccurrences } from '../services/dangerous-occurrence.engine';
import { SmsInspectionsApiService } from '../services/sms-inspections-api.service';
import { SmsMeetingsApiService } from '../services/sms-meetings-api.service';
import { SmsActionsApiService } from '../services/sms-actions-api.service';
import { SmsAiOrchestratorService } from '../services/sms-ai-orchestrator.service';
import { SmsProductionOpsService } from '../services/sms-production-ops.service';
import { SmsDataRetentionService } from '../services/sms-data-retention.service';
import { SmsPostLaunchMonitoringService } from '../ops/sms-post-launch-monitoring.service';
import type { ErpDrillTypeId } from '../services/erp-drill.catalog';
import {
  SMS_MONITORING_DOMAINS,
  type SmsMonitoringDomainId,
} from '../ops/sms-release-cycle';
import { SmsException } from '../common/sms-errors';
import { randomUUID } from 'crypto';
import type { SmsBehaviorId } from '../constants';
import {
  SMS_CORE_TABLES,
  SMS_SUPPORT_TABLES,
  SMS_TABLE_FIELDS,
  SMS_RETENTION_RULES,
  SMS_AUDIT_EVENT_RULES,
  SMS_QUERY_OPTIMIZATION,
  SMS_RELATIONSHIPS,
  SMS_INDEXING_STRATEGY,
  SMS_BENCHMARK_SNAPSHOT_KEYS,
  SMS_REGIONAL_HIERARCHY_FIELDS,
  SMS_RBAC_COLUMNS,
  SMS_RBAC_PREDICATE,
  smsPhysicalTable,
} from '../data-model/sms-production-data-model';
import {
  listQueryWorkloads,
  rbacPredicateDoc,
  ratePer200k,
} from '../data-model/sms-query-optimization';
import {
  getSmsInteractionFlow,
  listSmsInteractionFlows,
  flowsForIntelligencePage,
  SMS_CROSS_LINK_MAP,
  SMS_FLOW_SHARED_PATTERNS,
  SMS_FLOW_VALIDATION_MATRIX,
  SMS_INTERACTION_FLOWS,
  type SmsFlowRole,
} from '../qa/sms-interaction-flows';
import {
  advanceFlow,
  describeRoleGate,
  startFlow,
} from '../qa/sms-flow-runner';

type SmsReq = { smsScope: ReturnType<typeof getSmsScope>; headers: Record<string, string> };

@Controller(SMS_API_PREFIX)
@UseGuards(JwtAuthGuard, RolesGuard, PlaneScopeGuard)
@UseFilters(SmsExceptionFilter)
@Roles(...SMS_ROLES.READ)
export class VerisuiteSmsController {
  constructor(
    private readonly idem: SmsIdempotencyService,
    private readonly ingestion: SmsDataIngestionPipeline,
    private readonly benchmarks: IndustryBenchmarkEngine,
    private readonly regional: RegionalDrilldownEngine,
    private readonly aiCache: AiInsightsCacheService,
    private readonly incidents: IncidentInvestigationService,
    private readonly erpGen: ErpGenerationService,
    private readonly jhaTemplates: JhaTemplateService,
    private readonly competency: CompetencyCorrelationService,
    private readonly dashboard: SmsDashboardService,
    private readonly flhaApi: SmsFlhaApiService,
    private readonly jhaApi: SmsJhaApiService,
    private readonly emsErp: SmsEmsErpApiService,
    private readonly erpDrill: ErpDrillService,
    private readonly inspectionsApi: SmsInspectionsApiService,
    private readonly meetingsApi: SmsMeetingsApiService,
    private readonly actionsApi: SmsActionsApiService,
    private readonly aiOrchestrator: SmsAiOrchestratorService,
    private readonly ops: SmsProductionOpsService,
    private readonly retention: SmsDataRetentionService,
    private readonly postLaunch: SmsPostLaunchMonitoringService,
  ) {}

  // ── Ops ───────────────────────────────────────────────────────────────
  @Public()
  @Get('health')
  async health() {
    return this.ops.health();
  }

  /** Final Production Data Model catalog (§0–§12). */
  @Get('data-model')
  @Roles(...SMS_ROLES.READ)
  getDataModel() {
    return smsEnvelope({
      version: 'FINAL',
      coreTables: SMS_CORE_TABLES.map((t) => ({
        logical: t,
        physical: smsPhysicalTable(t),
        fields: SMS_TABLE_FIELDS[t],
      })),
      supportTables: SMS_SUPPORT_TABLES.map((t) => ({
        logical: t,
        physical: smsPhysicalTable(t),
      })),
      rbacColumns: SMS_RBAC_COLUMNS,
      rbacPredicate: SMS_RBAC_PREDICATE,
      regionalHierarchyFields: SMS_REGIONAL_HIERARCHY_FIELDS,
      industryBenchmarkSnapshotKeys: SMS_BENCHMARK_SNAPSHOT_KEYS,
      relationships: SMS_RELATIONSHIPS,
      indexingStrategy: SMS_INDEXING_STRATEGY,
      queryOptimization: listQueryWorkloads(),
      retentionRules: SMS_RETENTION_RULES,
      auditEventRules: SMS_AUDIT_EVENT_RULES,
      rateExamplePer200k: ratePer200k(2, 200_000),
      notes: [
        'SoR FK ids are UUID String (Nest SoR convention)',
        'Physical tables use sms_ prefix',
        'sms_audit_log is append-only (no UPDATE)',
      ],
    });
  }

  @Get('data-model/retention')
  @Roles(...SMS_ROLES.HSE)
  getRetentionRules() {
    return smsEnvelope({
      rules: this.retention.getRules(),
      sqlSnippets: SmsDataRetentionService.purgeSqlSnippets(),
      rbacPredicate: rbacPredicateDoc(),
      queryOptimization: SMS_QUERY_OPTIMIZATION,
    });
  }

  @Post('ops/retention/purge')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async retentionPurge(
    @Req() req: SmsReq,
    @Query('dryRun') dryRun?: string,
  ) {
    const scope = getSmsScope(req);
    const result = await this.retention.runNightlyPurge({
      companyId: scope.companyId,
      dryRun: dryRun === '1' || dryRun === 'true',
    });
    return smsEnvelope(result, {
      requestId: scope.requestId,
      plane: scope.plane,
    });
  }

  @Get('ops/ai-decisions')
  @Roles(...SMS_ROLES.HSE)
  async aiDecisions(
    @Req() req: SmsReq,
    @Query('limit') limit?: string,
    @Query('since') since?: string,
  ) {
    const scope = getSmsScope(req);
    const rows = await this.ops.listAiDecisions({
      companyId: scope.companyId,
      limit: limit ? Number(limit) : 50,
      since: since ? new Date(since) : undefined,
    });
    return smsEnvelope(rows, {
      requestId: scope.requestId,
      plane: scope.plane,
    });
  }

  @Post('ops/alert-test')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async alertTest(@Req() req: SmsReq) {
    const scope = getSmsScope(req);
    await this.ops.raiseAlert({
      severity: 'info',
      title: 'VeriSuite SMS alert channel test',
      detail: 'Manual ops/alert-test invocation',
      companyId: scope.companyId,
      requestId: scope.requestId,
    });
    return smsEnvelope({ ok: true }, {
      requestId: scope.requestId,
      plane: scope.plane,
    });
  }

  /** Post-launch monitoring overview (8 domains + AI perf + compliance + release cycle). */
  @Get('ops/monitoring')
  @Roles(...SMS_ROLES.HSE)
  async monitoringOverview(
    @Req() req: SmsReq,
    @Query('days') days?: string,
  ) {
    const scope = getSmsScope(req);
    const data = await this.postLaunch.overview(
      scope,
      days ? Math.min(Math.max(Number(days) || 30, 1), 365) : 30,
    );
    return smsEnvelope(data, {
      requestId: scope.requestId,
      plane: scope.plane,
      cached: data.cached,
    });
  }

  @Get('ops/monitoring/:domainId')
  @Roles(...SMS_ROLES.HSE)
  async monitoringDomain(
    @Req() req: SmsReq,
    @Param('domainId') domainId: string,
    @Query('days') days?: string,
  ) {
    const scope = getSmsScope(req);
    const allowed = SMS_MONITORING_DOMAINS.map((d) => d.id) as string[];
    if (!allowed.includes(domainId)) {
      throw new SmsException('NOT_FOUND', `Unknown monitoring domain: ${domainId}`);
    }
    const snap = await this.postLaunch.domain(
      scope,
      domainId as SmsMonitoringDomainId,
      days ? Math.min(Math.max(Number(days) || 30, 1), 365) : 30,
    );
    return smsEnvelope(snap, {
      requestId: scope.requestId,
      plane: scope.plane,
    });
  }

  @Get('ops/ai-performance')
  @Roles(...SMS_ROLES.HSE)
  async aiPerformance(
    @Req() req: SmsReq,
    @Query('days') days?: string,
  ) {
    const scope = getSmsScope(req);
    const d = days ? Math.min(Math.max(Number(days) || 30, 1), 365) : 30;
    const since = new Date(Date.now() - d * 24 * 60 * 60_000);
    const data = await this.postLaunch.aiPerformance(scope, since);
    return smsEnvelope({ windowDays: d, ...data }, {
      requestId: scope.requestId,
      plane: scope.plane,
    });
  }

  @Get('ops/compliance')
  @Roles(...SMS_ROLES.HSE)
  async complianceStatus(@Req() req: SmsReq) {
    const scope = getSmsScope(req);
    const overview = await this.postLaunch.overview(scope, 30);
    return smsEnvelope(overview.compliance, {
      requestId: scope.requestId,
      plane: scope.plane,
    });
  }

  @Get('ops/release-cycle')
  @Roles(...SMS_ROLES.HSE)
  releaseCycle(@Req() req: SmsReq) {
    const scope = getSmsScope(req);
    return smsEnvelope(this.postLaunch.releaseCycle(), {
      requestId: scope.requestId,
      plane: scope.plane,
    });
  }

  @Post('metrics/recompute')
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  async recompute(
    @Req() req: SmsReq,
    @Body()
    body?: {
      companyId?: number;
      projectId?: number;
      grains?: SmsPeriodGrain[];
      geoNodeId?: string;
    },
  ) {
    const scope = getSmsScope(req);
    const jobId = randomUUID();
    void this.ingestion.recomputeCompany(
      scope,
      body?.grains?.[0] ?? SmsPeriodGrain.month,
    );
    if (body?.geoNodeId) {
      void this.regional.rollupFromProjects(scope, body.geoNodeId);
    }
    void this.ingestion.processBatch(200);
    this.ops.emitMetric('metrics.recompute', {
      jobId,
      companyId: scope.companyId,
      geoNodeId: body?.geoNodeId,
    });
    return smsEnvelope({ jobId }, { requestId: scope.requestId, plane: scope.plane });
  }

  // ── Dashboard ─────────────────────────────────────────────────────────
  @Get('dashboard/home')
  @Roles(...SMS_ROLES.READ)
  async dashboardHome(
    @Req() req: SmsReq,
    @Query('period') period?: string,
    @Query('periodStart') periodStart?: string,
  ) {
    const scope = getSmsScope(req);
    const data = await this.dashboard.home(scope, { period, periodStart });
    return smsEnvelope(data, {
      requestId: scope.requestId,
      plane: scope.plane,
      cached: data.cached,
      revision: data.revision,
    });
  }

  @Get('dashboard/modules/:module')
  async dashboardModule(
    @Req() req: SmsReq,
    @Param('module') module: string,
    @Query('period') period?: string,
  ) {
    const scope = getSmsScope(req);
    const data = await this.dashboard.module(scope, module, { period });
    return smsEnvelope(data, {
      plane: scope.plane,
      cached: data.cached,
      revision: data.revision,
    });
  }

  // ── FLHA ──────────────────────────────────────────────────────────────
  @Post('flha')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SMS_ROLES.WRITE, UserRole.WORKER, UserRole.CONTRACTOR_USER)
  async createFlha(
    @Req() req: SmsReq,
    @Body() body: Parameters<SmsFlhaApiService['create']>[1],
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const scope = getSmsScope(req);
    const cached = this.idem.peek(scope.companyId, idempotencyKey, 'POST /flha');
    if (cached) return cached.response;
    const data = await this.flhaApi.create(scope, body);
    const envelope = smsEnvelope(data, { plane: scope.plane, revision: data.rowVersion });
    this.idem.remember(scope.companyId, idempotencyKey, 'POST /flha', envelope);
    return envelope;
  }

  @Get('flha')
  async listFlha(@Req() req: SmsReq, @Query() query: Record<string, string>) {
    const scope = getSmsScope(req);
    const data = await this.flhaApi.list(scope, query);
    return smsEnvelope(data, {
      plane: scope.plane,
      nextCursor: data.nextCursor,
    });
  }

  @Get('flha/:id')
  async getFlha(@Req() req: SmsReq, @Param('id') id: string) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.flhaApi.get(scope, id), { plane: scope.plane });
  }

  @Put('flha/:id')
  @Roles(...SMS_ROLES.WRITE)
  async updateFlha(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body: Parameters<SmsFlhaApiService['update']>[2],
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.flhaApi.update(scope, id, body), {
      plane: scope.plane,
    });
  }

  @Post('flha/:id/score')
  @Roles(...SMS_ROLES.WRITE)
  async scoreFlha(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body?: { includeHazardPrediction?: boolean },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.flhaApi.score(scope, id, body));
  }

  // ── JHA ───────────────────────────────────────────────────────────────
  @Get('jha/templates')
  listJhaTemplates(@Query() query: Record<string, string>) {
    return smsEnvelope(this.jhaApi.listTemplates(query));
  }

  @Get('jha/templates/:templateId')
  getJhaTemplate(@Param('templateId') templateId: string) {
    return smsEnvelope(this.jhaApi.getTemplate(templateId));
  }

  @Post('jha')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SMS_ROLES.WRITE)
  async createJha(
    @Req() req: SmsReq,
    @Body() body: Parameters<SmsJhaApiService['create']>[1],
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const scope = getSmsScope(req);
    const cached = this.idem.peek(scope.companyId, idempotencyKey, 'POST /jha');
    if (cached) return cached.response;
    const data = await this.jhaApi.create(scope, body);
    const envelope = smsEnvelope(data, { revision: data.rowVersion });
    this.idem.remember(scope.companyId, idempotencyKey, 'POST /jha', envelope);
    return envelope;
  }

  @Post('jha/suggest')
  @Roles(...SMS_ROLES.WRITE)
  async suggestJha(
    @Req() req: SmsReq,
    @Body()
    body: {
      workType: string;
      industry?: string;
      templateId?: string;
      energies?: string[];
      regionCode?: string;
      projectId?: number;
      title?: string;
    },
  ) {
    const scope = getSmsScope(req);
    const result = await this.jhaTemplates.suggest(scope, body);
    const full = (result.insights[0]?.payloadJson ?? {}) as {
      template?: {
        hazards: string[];
        controls: string[];
        title: string;
      };
    };
    return smsEnvelope({
      suggestions: {
        tasks: full.template ? [{ label: full.template.title }] : [],
        hazards: (full.template?.hazards ?? []).map((label) => ({ label })),
        controls: (full.template?.controls ?? []).map((label) => ({ label })),
        ppe: [],
      },
      confidence: result.insights[0]
        ? Number(result.insights[0].confidence)
        : 0.7,
      modelId: 'sms-d0-jha-1.0',
      suggestionId: result.insights[0]?.id,
      source: result.insights[0]?.source ?? 'rules',
    });
  }

  @Post('jha/:id/risk-rank')
  @Roles(...SMS_ROLES.WRITE)
  async riskRankJha(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() _body?: { taskOverrides?: unknown[] },
  ) {
    const scope = getSmsScope(req);
    const result = await this.jhaTemplates.riskRank(scope, id);
    return smsEnvelope({
      residualRiskMax: Number(result.jha.residualRiskMax ?? 0),
      tasks: [
        {
          id: 'primary',
          rank: (result.jha.riskRankJson as { rank?: number } | null)?.rank ?? null,
          residualScore: Number(result.jha.residualRiskMax ?? 0),
          sifPotential: result.jha.sifPotential,
        },
      ],
      recommendedErpScenario: result.requiresErp ? 'general' : null,
      suggestionId: result.insight.insights[0]?.id,
    });
  }

  @Put('jha/:id')
  @Roles(...SMS_ROLES.WRITE)
  async updateJha(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body: Parameters<SmsJhaApiService['update']>[2],
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.jhaApi.update(scope, id, body));
  }

  @Get('jha')
  async listJha(@Req() req: SmsReq, @Query() query: Record<string, string>) {
    const scope = getSmsScope(req);
    const data = await this.jhaApi.list(scope, query);
    return smsEnvelope(data, { nextCursor: data.nextCursor });
  }

  @Get('jha/:id')
  async getJha(@Req() req: SmsReq, @Param('id') id: string) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.jhaApi.get(scope, id));
  }

  // ── EMS / ERP ─────────────────────────────────────────────────────────
  @Get('ems')
  async emsLookup(
    @Req() req: SmsReq,
    @Query('regionCode') regionCode: string,
    @Query('scenario') scenario?: string,
    @Query('projectId') projectId?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(
      await this.emsErp.lookupEms(scope, {
        regionCode,
        scenario,
        projectId,
        lat,
        lng,
      }),
    );
  }

  @Post('ohs/dangerous-occurrences/evaluate')
  @Roles(...SMS_ROLES.READ)
  evaluateDangerousOccurrences(
    @Body() body: { text?: string; regionCode?: string },
  ) {
    return smsEnvelope(
      evaluateDangerousOccurrences(
        body?.text ?? '',
        body?.regionCode ?? 'CA-AB',
      ),
    );
  }

  @Post('erp/generate')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async generateErp(
    @Req() req: SmsReq,
    @Body()
    body: {
      projectId: number;
      workType: string;
      regionCode: string;
      projectScope?: string;
      scenario: SmsErpScenario;
      hazards?: string[];
      includeEmsIds?: string[];
      title?: string;
      userInputs?: {
        musterPoints?: Array<{ name: string; description?: string }>;
        equipment?: Array<{ name: string; location?: string; qty?: number }>;
        roles?: Array<{
          role: string;
          primaryName?: string;
          backupName?: string;
        }>;
        communication?: {
          radioChannel?: string;
          phoneTree?: string;
          assemblySignal?: string;
          allClearSignal?: string;
        };
        additionalHazards?: string[];
        siteAddress?: string;
      };
    },
  ) {
    const scope = getSmsScope(req);
    const result = await this.erpGen.generate(scope, {
      title: body.title ?? `ERP — ${body.scenario}`,
      scenario: body.scenario,
      projectId: body.projectId,
      workType: body.workType,
      regionCode: body.regionCode,
      emsProviderIds: body.includeEmsIds,
      projectScope: body.projectScope,
      hazards: body.hazards,
      userInputs: body.userInputs,
    });
    return smsEnvelope({
      draft: result.draft,
      document: result.document,
      qualityScore: result.qualityScore,
      notes: result.notes,
      suggestionId: result.suggestionId,
      modelId: result.modelId,
    });
  }

  @Post('erp')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SMS_ROLES.HSE)
  async persistErp(
    @Req() req: SmsReq,
    @Body() body: Parameters<SmsEmsErpApiService['persist']>[1],
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const scope = getSmsScope(req);
    const cached = this.idem.peek(scope.companyId, idempotencyKey, 'POST /erp');
    if (cached) return cached.response;
    const data = await this.emsErp.persist(scope, body);
    const envelope = smsEnvelope(data, { revision: data.rowVersion });
    this.idem.remember(scope.companyId, idempotencyKey, 'POST /erp', envelope);
    return envelope;
  }

  @Post('erp/:id/simulate')
  @Roles(...SMS_ROLES.WRITE)
  async simulateErp(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() _body?: { branchChoices?: Array<{ minute: number; choice: string }> },
  ) {
    const scope = getSmsScope(req);
    const result = await this.erpGen.simulate(scope, id);
    if (!result) throw new SmsException('NOT_FOUND', 'ERP not found');
    return smsEnvelope({
      timeline: (result.gates ?? []).map((g, i) => ({
        minute: i * 5,
        event: g,
        expectedAction: g,
        passCriteria: 'completed',
        result: 'pass',
      })),
      outcomeScore: result.score,
      failedGates: result.failed,
      suggestionId: undefined,
    });
  }

  @Get('erp/drills/catalog')
  async drillCatalog() {
    return smsEnvelope(this.erpDrill.catalog());
  }

  @Post('erp/:id/drills')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SMS_ROLES.WRITE)
  async startDrill(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body()
    body?: {
      trackEveryone?: boolean;
      drillType?: ErpDrillTypeId;
      musterPoint?: string;
      title?: string;
      facilitator?: string;
      projectName?: string;
      attendance?: Array<{
        id: string;
        name: string;
        role?: string;
        crew?: string;
      }>;
    },
  ) {
    const scope = getSmsScope(req);
    if (body?.drillType) {
      return smsEnvelope(
        await this.erpDrill.start(scope, id, {
          drillType: body.drillType,
          trackEveryone: body.trackEveryone,
          musterPoint: body.musterPoint,
          title: body.title,
          facilitator: body.facilitator,
          projectName: body.projectName,
          attendance: body.attendance,
        }),
      );
    }
    return smsEnvelope(await this.emsErp.startDrill(scope, id, body));
  }

  @Put('erp/drills/:drillId')
  @Roles(...SMS_ROLES.WRITE)
  async patchDrill(
    @Req() req: SmsReq,
    @Param('drillId') drillId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(
      await this.erpDrill.patch(scope, drillId, body as never),
    );
  }

  @Post('erp/drills/:drillId/complete')
  @Roles(...SMS_ROLES.WRITE)
  async completeDrill(
    @Req() req: SmsReq,
    @Param('drillId') drillId: string,
    @Body() body?: Record<string, unknown>,
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(
      await this.erpDrill.complete(scope, drillId, body as never),
    );
  }

  @Get('erp/drills/:drillId/summary')
  async drillSummary(
    @Req() req: SmsReq,
    @Param('drillId') drillId: string,
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.erpDrill.getSummary(scope, drillId));
  }

  @Put('erp/drills/:drillId/roster/:personId')
  @Roles(...SMS_ROLES.WRITE)
  async updateRoster(
    @Req() req: SmsReq,
    @Param('drillId') drillId: string,
    @Param('personId') personId: string,
    @Body() body: { status: SmsDrillRosterStatus },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(
      await this.emsErp.updateRoster(scope, drillId, personId, body),
    );
  }

  @Get('erp')
  async listErp(@Req() req: SmsReq, @Query() query: Record<string, string>) {
    const scope = getSmsScope(req);
    const data = await this.emsErp.list(scope, query);
    return smsEnvelope(data, { nextCursor: data.nextCursor });
  }

  @Get('erp/:id')
  async getErp(@Req() req: SmsReq, @Param('id') id: string) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.emsErp.get(scope, id));
  }

  // ── Inspections ───────────────────────────────────────────────────────
  @Post('inspections')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SMS_ROLES.WRITE)
  async createInspection(
    @Req() req: SmsReq,
    @Body() body: Parameters<SmsInspectionsApiService['create']>[1],
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const scope = getSmsScope(req);
    const cached = this.idem.peek(scope.companyId, idempotencyKey, 'POST /inspections');
    if (cached) return cached.response;
    const data = await this.inspectionsApi.create(scope, body);
    const envelope = smsEnvelope(data, { revision: data.rowVersion });
    this.idem.remember(
      scope.companyId,
      idempotencyKey,
      'POST /inspections',
      envelope,
    );
    return envelope;
  }

  @Get('inspections/trends')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async inspectionTrends(
    @Req() req: SmsReq,
    @Query('period') period?: string,
    @Query('grain') grain?: 'week' | 'month',
    @Query('periodStart') periodStart?: string,
  ) {
    const scope = getSmsScope(req);
    const data = await this.inspectionsApi.trends(scope, {
      period,
      grain,
      periodStart,
    });
    return smsEnvelope(data, { cached: data.cached, plane: scope.plane });
  }

  @Post('inspections/focus-packs')
  @Roles(...SMS_ROLES.HSE)
  async focusPacks(
    @Req() req: SmsReq,
    @Body() body: { projectId: number; lookbackDays?: number },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.inspectionsApi.focusPacksPost(scope, body));
  }

  @Get('inspections')
  async listInspections(
    @Req() req: SmsReq,
    @Query() query: Record<string, string>,
  ) {
    const scope = getSmsScope(req);
    const data = await this.inspectionsApi.list(scope, query);
    return smsEnvelope(data, { nextCursor: data.nextCursor });
  }

  @Post('inspections/:id/score')
  @Roles(...SMS_ROLES.WRITE)
  async scoreInspection(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body?: { recalculate?: boolean },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.inspectionsApi.score(scope, id, body));
  }

  // ── Incidents ─────────────────────────────────────────────────────────
  @Post('incidents')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SMS_ROLES.READ)
  async createIncident(
    @Req() req: SmsReq,
    @Body() body: Parameters<IncidentInvestigationService['create']>[1],
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const scope = getSmsScope(req);
    const cached = this.idem.peek(scope.companyId, idempotencyKey, 'POST /incidents');
    if (cached) return cached.response;
    const data = await this.incidents.create(scope, body);
    const envelope = smsEnvelope(data, { revision: data.rowVersion });
    this.idem.remember(
      scope.companyId,
      idempotencyKey,
      'POST /incidents',
      envelope,
    );
    return envelope;
  }

  @Get('incidents/log')
  @Roles(...SMS_ROLES.INVESTIGATION)
  async incidentLog(@Req() req: SmsReq, @Query() query: Record<string, string>) {
    const scope = getSmsScope(req);
    const data = await this.incidents.smartLog(scope, query);
    return smsEnvelope(data, { nextCursor: data.nextCursor });
  }

  @Get('incidents/metrics')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async incidentMetrics(@Req() req: SmsReq) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.incidents.getMetrics(scope));
  }

  @Get('incidents/:id/investigation')
  @Roles(...SMS_ROLES.INVESTIGATION)
  async investigationPackage(@Req() req: SmsReq, @Param('id') id: string) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.incidents.getInvestigationPackage(scope, id));
  }

  @Put('incidents/:id/investigation')
  @Roles(...SMS_ROLES.INVESTIGATION)
  async updateInvestigation(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body()
    body: Parameters<IncidentInvestigationService['updateInvestigation']>[2],
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.incidents.updateInvestigation(scope, id, body));
  }

  @Post('incidents/:id/investigation/helper')
  @Roles(...SMS_ROLES.INVESTIGATION)
  async investigationHelper(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body?: { descriptionOverride?: string },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.incidents.investigationHelper(scope, id, body));
  }

  @Post('incidents/:id/root-causes/suggest')
  @Roles(...SMS_ROLES.INVESTIGATION)
  async rootCauses(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body?: { findings?: unknown[]; pathway?: string },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.incidents.suggestRootCauses(scope, id, body));
  }

  @Get('incidents/:id')
  @Roles(...SMS_ROLES.INVESTIGATION)
  async getIncident(@Req() req: SmsReq, @Param('id') id: string) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.incidents.get(scope, id));
  }

  // ── Meetings ──────────────────────────────────────────────────────────
  @Post('meetings/topics/generate')
  @Roles(...SMS_ROLES.WRITE)
  async meetingTopics(
    @Req() req: SmsReq,
    @Body()
    body: { projectId: number; lookbackDays?: number; limit?: number },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.meetingsApi.generateTopics(scope, body));
  }

  @Post('meetings')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SMS_ROLES.WRITE)
  async createMeeting(
    @Req() req: SmsReq,
    @Body()
    body: {
      projectId: number;
      title: string;
      meetingType: SmsMeetingType | string;
      scheduledAt: string;
      location?: string;
      topicTitles?: string[];
      acceptSuggestionIds?: string[];
      linkedIncidentIds?: string[];
      linkedActionIds?: string[];
    },
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const scope = getSmsScope(req);
    const cached = this.idem.peek(scope.companyId, idempotencyKey, 'POST /meetings');
    if (cached) return cached.response;
    const data = await this.meetingsApi.create(scope, body);
    const envelope = smsEnvelope(data, { revision: data.rowVersion });
    this.idem.remember(
      scope.companyId,
      idempotencyKey,
      'POST /meetings',
      envelope,
    );
    return envelope;
  }

  @Put('meetings/:id')
  @Roles(...SMS_ROLES.WRITE)
  async updateMeeting(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body: Parameters<SmsMeetingsApiService['update']>[2],
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.meetingsApi.update(scope, id, body));
  }

  @Get('meetings')
  async listMeetings(
    @Req() req: SmsReq,
    @Query() query: Record<string, string>,
  ) {
    const scope = getSmsScope(req);
    const data = await this.meetingsApi.list(scope, query);
    return smsEnvelope(data, { nextCursor: data.nextCursor });
  }

  @Post('meetings/:id/attendees/sign-in')
  @Roles(...SMS_ROLES.READ)
  async meetingSignIn(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body: { workerId?: number; badgeCode?: string },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.meetingsApi.signIn(scope, id, body));
  }

  // ── Actions ───────────────────────────────────────────────────────────
  @Post('actions/suggest')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async suggestActions(
    @Req() req: SmsReq,
    @Body() body: Parameters<SmsActionsApiService['suggest']>[1],
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.actionsApi.suggest(scope, body));
  }

  @Post('actions')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SMS_ROLES.WRITE)
  async createAction(
    @Req() req: SmsReq,
    @Body() body: Parameters<SmsActionsApiService['create']>[1],
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const scope = getSmsScope(req);
    const cached = this.idem.peek(scope.companyId, idempotencyKey, 'POST /actions');
    if (cached) return cached.response;
    const data = await this.actionsApi.create(scope, body);
    const envelope = smsEnvelope(data, { revision: data.rowVersion });
    this.idem.remember(
      scope.companyId,
      idempotencyKey,
      'POST /actions',
      envelope,
    );
    return envelope;
  }

  @Get('actions/metrics')
  @Roles(...SMS_ROLES.HSE)
  async actionMetrics(
    @Req() req: SmsReq,
    @Query('period') period?: string,
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.actionsApi.metrics(scope, { period }));
  }

  @Get('actions')
  @Roles(...SMS_ROLES.READ)
  async listActions(
    @Req() req: SmsReq,
    @Query() query: Record<string, string>,
  ) {
    const scope = getSmsScope(req);
    const data = await this.actionsApi.list(scope, query);
    return smsEnvelope(data, { nextCursor: data.nextCursor });
  }

  @Put('actions/:id')
  @Roles(...SMS_ROLES.WRITE)
  async updateAction(
    @Req() req: SmsReq,
    @Param('id') id: string,
    @Body() body: Parameters<SmsActionsApiService['update']>[2],
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.actionsApi.update(scope, id, body));
  }

  @Get('actions/:id')
  async getAction(@Req() req: SmsReq, @Param('id') id: string) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.actionsApi.get(scope, id));
  }

  // ── Competency ────────────────────────────────────────────────────────
  @Get('competency/metrics')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async competencyMetrics(@Req() req: SmsReq) {
    const scope = getSmsScope(req);
    const result = await this.competency.metrics(scope);
    const visible = result.cells.filter((c) => !c.suppressed);
    const coverage =
      visible.length > 0
        ? visible.reduce((s, c) => s + (c.coveragePct ?? 0), 0) / visible.length
        : null;
    return smsEnvelope(
      {
        coveragePct: coverage,
        overdue: visible.reduce((s, c) => s + c.overdueCount, 0),
        authGaps: visible.reduce((s, c) => s + c.authGapCount, 0),
        riskIndex:
          visible.length > 0
            ? Math.max(...visible.map((c) => c.riskIndex ?? 0))
            : null,
        heatmap: {
          rows: [...new Set(visible.map((c) => c.roleKey))],
          cols: [...new Set(visible.map((c) => c.competencyKey))],
          cells: result.cells.map((c) => ({
            role: c.roleKey,
            competency: c.competencyKey,
            coveragePct: c.suppressed ? null : c.coveragePct,
            headcount: c.headcount,
            suppressed: c.suppressed,
          })),
        },
        forecast: [],
      },
      { cached: result.cached },
    );
  }

  @Get('competency/gaps')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async competencyGaps(
    @Req() req: SmsReq,
    @Query('roleKey') roleKey?: string,
    @Query('competencyKey') competencyKey?: string,
    @Query('gapType') gapType?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const scope = getSmsScope(req);
    const { take } = parseSmsPage({ cursor, limit });
    const { gaps } = await this.competency.gaps(scope);
    let items = gaps.map((g) => ({
      role: g.roleKey,
      competency: g.competencyKey,
      daysToExpiry: g.expiring30dCount > 0 ? 30 : null,
      risk: g.riskIndex,
      workerCount: g.headcount,
    }));
    if (roleKey) items = items.filter((i) => i.role === roleKey);
    if (competencyKey) {
      items = items.filter((i) => i.competency === competencyKey);
    }
    if (gapType === 'overdue') {
      items = items.filter((i) => (i.risk ?? 0) >= 60);
    } else if (gapType === 'expiring') {
      items = items.filter((i) => i.daysToExpiry != null);
    } else if (gapType === 'auth') {
      items = items.filter((i) => (i.risk ?? 0) >= 50);
    }
    const start = cursor
      ? items.findIndex((i) => `${i.role}:${i.competency}` === cursor) + 1
      : 0;
    const slice = items.slice(Math.max(0, start), Math.max(0, start) + take);
    return smsEnvelope({
      items: slice,
      nextCursor:
        slice.length === take
          ? `${slice[slice.length - 1]?.role}:${slice[slice.length - 1]?.competency}`
          : null,
    });
  }

  @Post('competency/forecast')
  @Roles(...SMS_ROLES.HSE)
  async competencyForecast(
    @Req() req: SmsReq,
    @Body() body?: { projectId?: number; horizonDays?: number },
  ) {
    const scope = getSmsScope(req);
    const scoped = body?.projectId
      ? { ...scope, projectId: body.projectId }
      : scope;
    const result = await this.competency.forecast(scoped);
    const series =
      (
        result.insight.insights[0]?.payloadJson as {
          series?: Array<{ riskIndex: number | null }>;
        }
      )?.series?.map((s, i) => ({
        asOf: new Date(Date.now() + i * 7 * 86_400_000).toISOString(),
        riskIndex: s.riskIndex,
      })) ?? [];
    return smsEnvelope({
      riskIndex: result.cells[0]?.riskIndex ?? null,
      series,
      recommendations: result.cells.slice(0, 3).map((c) => ({
        role: c.roleKey,
        competency: c.competencyKey,
        action: 'Schedule refresher',
      })),
      suggestionId: result.insight.insights[0]?.id,
      modelId: 'sms-d1-competency-1.0',
      horizonDays: body?.horizonDays ?? 90,
    });
  }

  // ── Benchmarks ────────────────────────────────────────────────────────
  @Get('benchmarks/industry')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async industryBenchmark(
    @Req() req: SmsReq,
    @Query('industryCode') industryCode?: string,
    @Query('regionScope') regionScope?: string,
    @Query('metricKeys') metricKeys?: string,
    @Query('period') _period?: string,
  ) {
    const scope = getSmsScope(req);
    if (scope.role === UserRole.WORKER) {
      throw new SmsException('FORBIDDEN', 'Workers cannot access industry benchmarks');
    }
    const keys = (metricKeys ?? 'incident_rate_per_200k').split(',');
    const rows = [];
    let suppressed = false;
    let cohortN = 0;
    for (const metricKey of keys) {
      const result = await this.benchmarks.getIndustryCompare(scope, {
        industryCode,
        regionScope,
        metricKey: metricKey.trim(),
      });
      suppressed = suppressed || result.suppressed;
      cohortN = Math.max(cohortN, result.snapshot.cohortN);
      rows.push({
        label: metricKey.trim(),
        entity: result.entityValue,
        industry: result.snapshot.industryP50,
        unit: '/200k',
        delta: result.snapshot.delta,
        betterThanIndustry: result.snapshot.betterThanIndustry,
      });
    }
    return smsEnvelope(
      {
        mode: 'industry_compare',
        rows,
        summary: suppressed
          ? 'Cohort suppressed (n<5)'
          : 'Comparison vs anonymized industry cohort',
        suppressed,
        cohortN,
        asOf: new Date().toISOString(),
      },
      { suppressed },
    );
  }

  // ── Regions ───────────────────────────────────────────────────────────
  @Get('regions/tree')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async regionTree(
    @Req() req: SmsReq,
    @Query('parentCode') parentCode?: string,
    @Query('parentGeoNodeId') parentGeoNodeId?: string,
  ) {
    const scope = getSmsScope(req);
    const tree = await this.regional.getTree(scope);
    let children = tree.nodes;
    if (parentCode) {
      const parent = tree.nodes.find((n) => n.geoCode === parentCode);
      children = tree.nodes.filter((n) => n.parentGeoNodeId === parent?.id);
    } else if (parentGeoNodeId) {
      children = tree.nodes.filter((n) => n.parentGeoNodeId === parentGeoNodeId);
    } else {
      children = tree.nodes.filter((n) => !n.parentGeoNodeId);
    }
    return smsEnvelope(
      {
        breadcrumbs: [],
        children: children.map((c) => ({
          code: c.geoCode,
          label: c.available ? c.displayName : null,
          level: c.geoLevel,
          available: c.available,
        })),
        activeCode: parentCode ?? null,
      },
      { cached: tree.cached },
    );
  }

  @Get('regions/:geoCode/metrics')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async regionMetrics(@Req() req: SmsReq, @Param('geoCode') geoCode: string) {
    const scope = getSmsScope(req);
    const data = await this.regional.getMetrics(scope, geoCode);
    const m = data.metric;
    return smsEnvelope(
      {
        ...data,
        kpis: m
          ? [
              {
                id: 'incident_rate',
                value:
                  m.incidentRatePer200k != null
                    ? Number(m.incidentRatePer200k)
                    : null,
                unit: '/200k',
              },
              { id: 'open_incidents', value: m.openIncidents, unit: 'count' },
            ]
          : [],
        parentCompare: m
          ? {
              deltaVsParentRate:
                m.deltaVsParentRate != null
                  ? Number(m.deltaVsParentRate)
                  : null,
              parentIncidentRate:
                m.parentIncidentRatePer200k != null
                  ? Number(m.parentIncidentRatePer200k)
                  : null,
            }
          : null,
      },
      { cached: data.cached },
    );
  }

  @Get('regions/:geoCode/insights')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async regionInsights(@Req() req: SmsReq, @Param('geoCode') geoCode: string) {
    const scope = getSmsScope(req);
    const data = await this.regional.getInsights(scope, geoCode);
    return smsEnvelope({
      insights: data.insights,
      hotspots: data.hotspotChildren,
      nextActions: data.hotspotChildren.slice(0, 3).map((h) => ({
        label: `Drill into ${h.geoCode}`,
        href: `/pm?geo=${h.geoCode}`,
      })),
      suggestionId: undefined,
      modelId: 'sms-d1-regional-1.0',
    });
  }

  @Get('regions/:geoCode/projects')
  @Roles(...SMS_ROLES.HSE, UserRole.SUPERVISOR)
  async regionProjects(
    @Req() req: SmsReq,
    @Param('geoCode') geoCode: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const scope = getSmsScope(req);
    const { take } = parseSmsPage({ cursor, limit });
    const data = await this.regional.getProjects(scope, geoCode);
    let items = data.projects;
    if (status) {
      // Status filter applied at Project join when available; keep rate payload intact
      items = items.filter((p) =>
        status === 'active' ? true : p.name.length > 0,
      );
    }
    const start = cursor
      ? items.findIndex((p) => String(p.projectId) === cursor) + 1
      : 0;
    const slice = items.slice(Math.max(0, start), Math.max(0, start) + take);
    return smsEnvelope({
      items: slice,
      nextCursor:
        slice.length === take
          ? String(slice[slice.length - 1]?.projectId)
          : null,
    });
  }

  // ── Interaction flows ─────────────────────────────────────────────────
  @Get('flows')
  @Roles(...SMS_ROLES.READ)
  listFlows(@Query('page') page?: string) {
    if (page) {
      return smsEnvelope({
        flows: flowsForIntelligencePage(page).map((f) => ({
          id: f.id,
          name: f.name,
          route: f.route,
          stepCount: f.steps.length,
          aiTriggers: f.aiTriggers,
        })),
        patterns: SMS_FLOW_SHARED_PATTERNS,
        crossLinks: SMS_CROSS_LINK_MAP,
      });
    }
    return smsEnvelope({
      flows: listSmsInteractionFlows(),
      patterns: SMS_FLOW_SHARED_PATTERNS,
      validationMatrix: SMS_FLOW_VALIDATION_MATRIX,
      crossLinks: SMS_CROSS_LINK_MAP,
      total: SMS_INTERACTION_FLOWS.length,
    });
  }

  @Get('flows/:flowId')
  @Roles(...SMS_ROLES.READ)
  getFlow(
    @Param('flowId') flowId: string,
    @Query('role') role?: string,
  ) {
    const flow = getSmsInteractionFlow(flowId);
    if (!flow) {
      throw new SmsException('NOT_FOUND', 'Interaction flow not found');
    }
    const gate = role
      ? describeRoleGate(flow, role as SmsFlowRole)
      : undefined;
    return smsEnvelope({ flow, roleGate: gate });
  }

  @Post('flows/:flowId/progress')
  @Roles(...SMS_ROLES.READ)
  flowProgress(
    @Param('flowId') flowId: string,
    @Body() body?: { stepIndex?: number; action?: 'start' | 'advance' },
  ) {
    if (!getSmsInteractionFlow(flowId)) {
      throw new SmsException('NOT_FOUND', 'Interaction flow not found');
    }
    if (body?.action === 'advance' && body.stepIndex != null) {
      return smsEnvelope(advanceFlow(flowId, body.stepIndex));
    }
    return smsEnvelope(startFlow(flowId));
  }

  // ── Intelligence ──────────────────────────────────────────────────────
  @Get('intelligence/catalog')
  aiCatalog() {
    return smsEnvelope(this.aiOrchestrator.catalog());
  }

  @Get('intelligence')
  async intelligencePage(
    @Req() req: SmsReq,
    @Query('page') page?: string,
    @Query('geoCode') geoCode?: string,
    @Query('bustCache') bustCache?: string,
  ) {
    const scope = getSmsScope(req);
    const bundle = await this.aiOrchestrator.forPage(scope, page ?? 'home', {
      geoCode,
      bustCache: bustCache === 'true',
      markShown: true,
    });
    return smsEnvelope(
      {
        chains: bundle.chains,
        suggestions: bundle.suggestions,
        nextSteps: bundle.suggestions.slice(0, 3).map((s) => s.headline),
        riskForecast: [],
        industryCompare: [],
        insights: bundle.suggestions,
        chips: bundle.chips,
        behaviors: bundle.behaviors,
        modelId: bundle.modelId,
        cached: bundle.cached,
        fallbackUsed: bundle.fallbackUsed,
        generatedAt: bundle.generatedAt,
      },
      { cached: bundle.cached },
    );
  }

  @Post('intelligence/run')
  @Roles(...SMS_ROLES.WRITE, ...SMS_ROLES.READ)
  async runBehavior(
    @Req() req: SmsReq,
    @Body() body: { behaviorId: SmsBehaviorId; input?: Record<string, unknown> },
  ) {
    const scope = getSmsScope(req);
    if (!body.behaviorId) {
      throw new SmsException('VALIDATION_ERROR', 'behaviorId is required');
    }
    const result = await this.aiOrchestrator.runBehavior(
      scope,
      body.behaviorId,
      body.input ?? {},
    );
    return smsEnvelope(result, { cached: false });
  }

  @Get('intelligence/insights/home')
  async intelligenceHome(@Req() req: SmsReq) {
    const scope = getSmsScope(req);
    const bundle = await this.aiOrchestrator.forPage(scope, 'home', {
      markShown: true,
    });
    return smsEnvelope(
      {
        chips: bundle.chips,
        items: bundle.suggestions.map((s) => ({
          id: s.id,
          tone: s.tone,
          headline: s.headline,
          body: s.body,
          confidence: s.confidence,
          href: s.href,
          behaviorId: s.behaviorId,
          visibility: s.visibility,
          guardrails: s.guardrails,
        })),
        suggestionIds: bundle.suggestions.map((s) => s.id),
        fallbackUsed: bundle.fallbackUsed,
      },
      { cached: bundle.cached },
    );
  }

  @Post('intelligence/accept')
  @Roles(...SMS_ROLES.WRITE)
  async acceptInsight(
    @Req() req: SmsReq,
    @Body()
    body: {
      suggestionId: string;
      action?:
        | 'create_action'
        | 'create_meeting'
        | 'apply_flha_flag'
        | 'persist_erp'
        | 'create_inspection_focus'
        | 'dismiss';
      payload?: Record<string, unknown>;
    },
  ) {
    const scope = getSmsScope(req);
    return smsEnvelope(await this.aiOrchestrator.acceptAndApply(scope, body));
  }

  @Post('intelligence/dismiss')
  @Roles(...SMS_ROLES.WRITE)
  async dismissInsight(
    @Req() req: SmsReq,
    @Body() body: { suggestionId: string; reason?: string },
  ) {
    const scope = getSmsScope(req);
    await this.aiCache.dismiss(scope, body.suggestionId, body.reason);
    return smsEnvelope({ status: 'dismissed' });
  }
}
