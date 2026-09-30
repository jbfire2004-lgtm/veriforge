import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PmPredictiveSafetyAnalyticsService } from '../pm-predictive-safety-analytics/pm-predictive-safety-analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import type {
  LeadingIndicator,
  PredictiveSafetyAnalyticsAiInput,
  PredictiveSafetyAnalyticsAiJson,
  PredictiveSafetyAnalyticsAiResult,
  RecommendedIntervention,
  RiskForecastItem,
} from './predictive-safety-analytics-ai.types';

const EXPIRY_CLUSTER_DAYS = 30;

@Injectable()
export class PredictiveSafetyAnalyticsAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: PmPredictiveSafetyAnalyticsService,
  ) {}

  async analyze(
    input: PredictiveSafetyAnalyticsAiInput,
  ): Promise<PredictiveSafetyAnalyticsAiResult> {
    if (!input.companyId)
      throw new BadRequestException('companyId is required');

    const windowDays = input.windowDays ?? 90;
    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    const bundle = await this.analytics.getBundle(
      input.companyId,
      input.projectId,
    );

    const risk_forecast = this.buildRiskForecast(bundle, input);
    const leading_indicators = await this.buildLeadingIndicators(input, since);
    const recommended_interventions = this.buildInterventions(
      bundle,
      risk_forecast,
      leading_indicators,
    );

    const core: PredictiveSafetyAnalyticsAiJson = {
      risk_forecast,
      leading_indicators,
      recommended_interventions,
    };

    return {
      ...core,
      analysis_id: randomUUID(),
      company_id: input.companyId,
      project_id: input.projectId,
      field_summary: this.buildFieldSummary(
        core,
        bundle.summary.overallRiskLevel,
      ),
      source: 'rule_engine',
      model: null,
    };
  }

  private buildRiskForecast(
    bundle: Awaited<
      ReturnType<PmPredictiveSafetyAnalyticsService['getBundle']>
    >,
    input: PredictiveSafetyAnalyticsAiInput,
  ): RiskForecastItem[] {
    const forecast: RiskForecastItem[] = [];
    const window = `Next 7 days (${bundle.weeklyForecast.weekStart} → ${bundle.weeklyForecast.weekEnd})`;

    if (input.projectId) {
      forecast.push({
        entity_type: 'project',
        entity_id: input.projectId,
        label: `Project #${input.projectId}`,
        risk_score: bundle.summary.overallRiskIndex,
        risk_level: bundle.summary.overallRiskLevel,
        drivers: bundle.weeklyForecast.days[0]?.drivers ?? [
          'Aggregate project signals',
        ],
        forecast_window: window,
      });
    }

    for (const w of bundle.highRiskWorkers.slice(0, 8)) {
      forecast.push({
        entity_type: 'worker',
        entity_id: w.entityId,
        label: w.label,
        risk_score: w.riskScore,
        risk_level: w.riskLevel,
        drivers: w.factors,
        forecast_window: window,
      });
    }

    for (const t of bundle.highRiskTasks.slice(0, 6)) {
      forecast.push({
        entity_type: 'task',
        entity_id: t.entityId,
        label: t.label,
        risk_score: t.riskScore,
        risk_level: t.riskLevel,
        drivers: t.factors,
        forecast_window: window,
      });
    }

    for (const l of bundle.highRiskLocations.slice(0, 4)) {
      forecast.push({
        entity_type: 'location',
        entity_id: l.entityId,
        label: l.label,
        risk_score: l.riskScore,
        risk_level: l.riskLevel,
        drivers: l.factors,
        forecast_window: window,
      });
    }

    for (const c of bundle.highRiskContractors.slice(0, 4)) {
      forecast.push({
        entity_type: 'contractor',
        entity_id: c.entityId,
        label: c.label,
        risk_score: c.riskScore,
        risk_level: c.riskLevel,
        drivers: c.factors,
        forecast_window: window,
      });
    }

    return forecast.sort((a, b) => b.risk_score - a.risk_score).slice(0, 20);
  }

  private async buildLeadingIndicators(
    input: PredictiveSafetyAnalyticsAiInput,
    since: Date,
  ): Promise<LeadingIndicator[]> {
    const indicators: LeadingIndicator[] = [];

    const expiryClusters = await this.detectTrainingExpiryClusters(input);
    indicators.push(...expiryClusters);

    const repeatedHazards = await this.detectRepeatedHazards(input, since);
    indicators.push(...repeatedHazards);

    const controlFailures = await this.detectControlFailures(input, since);
    indicators.push(...controlFailures);

    const jhaQuality = await this.detectJhaQualityGaps(input);
    indicators.push(...jhaQuality);

    const incidentPatterns = await this.detectIncidentPatterns(input, since);
    indicators.push(...incidentPatterns);

    const readinessGaps = await this.detectReadinessGaps(input);
    indicators.push(...readinessGaps);

    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return indicators
      .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
      .slice(0, 24);
  }

  private async detectTrainingExpiryClusters(
    input: PredictiveSafetyAnalyticsAiInput,
  ): Promise<LeadingIndicator[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + EXPIRY_CLUSTER_DAYS);

    const expiring = await this.prisma.trainingRecord.findMany({
      where: {
        companyId: input.companyId,
        expiresAt: { gte: new Date(), lte: cutoff },
        ...(input.projectId
          ? { OR: [{ projectId: input.projectId }, { projectId: null }] }
          : {}),
      },
      include: { certification: { select: { name: true, code: true } } },
      take: 200,
    });

    const byCert = new Map<string, number>();
    for (const r of expiring) {
      const key = r.certification.name;
      byCert.set(key, (byCert.get(key) ?? 0) + 1);
    }

    return [...byCert.entries()]
      .filter(([, count]) => count >= 3)
      .map(([cert, count]) => ({
        indicator_type: 'training_expiry_cluster' as const,
        description: `${count} workers have ${cert} expiring within ${EXPIRY_CLUSTER_DAYS} days`,
        severity: count >= 8 ? ('critical' as const) : ('warning' as const),
        evidence: [
          `certification=${cert}`,
          `count=${count}`,
          `window_days=${EXPIRY_CLUSTER_DAYS}`,
        ],
        trend: 'increasing' as const,
      }));
  }

  private async detectRepeatedHazards(
    input: PredictiveSafetyAnalyticsAiInput,
    since: Date,
  ): Promise<LeadingIndicator[]> {
    const hazards = await this.prisma.jhaFlhaHazard.findMany({
      where: {
        jhaFlha: {
          companyId: input.companyId,
          deletedAt: null,
          updatedAt: { gte: since },
          ...(input.projectId ? { projectId: input.projectId } : {}),
        },
      },
      select: { description: true, category: true },
      take: 500,
    });

    const counts = new Map<
      string,
      { count: number; category: string | null }
    >();
    for (const h of hazards) {
      const key = h.description.toLowerCase().trim().slice(0, 80);
      const bucket = counts.get(key) ?? { count: 0, category: h.category };
      bucket.count += 1;
      counts.set(key, bucket);
    }

    return [...counts.entries()]
      .filter(([, v]) => v.count >= 4)
      .slice(0, 5)
      .map(([desc, v]) => ({
        indicator_type: 'repeated_hazard' as const,
        description: `Hazard "${desc.slice(0, 48)}${
          desc.length > 48 ? '…' : ''
        }" flagged ${v.count} times`,
        severity: v.count >= 8 ? ('critical' as const) : ('warning' as const),
        evidence: [
          `occurrences=${v.count}`,
          `category=${v.category ?? 'unknown'}`,
        ],
        trend: 'stable' as const,
      }));
  }

  private async detectControlFailures(
    input: PredictiveSafetyAnalyticsAiInput,
    since: Date,
  ): Promise<LeadingIndicator[]> {
    const indicators: LeadingIndicator[] = [];

    const inadequateJhas = await this.prisma.jhaFlha.count({
      where: {
        companyId: input.companyId,
        deletedAt: null,
        controlsAdequate: false,
        updatedAt: { gte: since },
        ...(input.projectId ? { projectId: input.projectId } : {}),
      },
    });

    if (inadequateJhas > 0) {
      indicators.push({
        indicator_type: 'control_failure',
        description: `${inadequateJhas} JHA/FLHA record(s) flagged with inadequate controls`,
        severity: inadequateJhas >= 5 ? 'critical' : 'warning',
        evidence: [`inadequate_jha_count=${inadequateJhas}`],
        trend: 'increasing',
      });
    }

    const overdueCapa = await this.prisma.pmCorrectiveAction.count({
      where: {
        companyId: input.companyId,
        deletedAt: null,
        status: { notIn: ['closed', 'verified'] },
        dueAt: { lt: new Date() },
        ...(input.projectId ? { projectId: input.projectId } : {}),
      },
    });

    if (overdueCapa > 0) {
      indicators.push({
        indicator_type: 'control_failure',
        description: `${overdueCapa} overdue corrective action(s) — control verification delayed`,
        severity: overdueCapa >= 10 ? 'critical' : 'warning',
        evidence: [`overdue_capa=${overdueCapa}`],
        trend: 'increasing',
      });
    }

    const weakControls = await this.prisma.jhaFlhaControl.count({
      where: {
        adequate: false,
        jhaFlha: {
          companyId: input.companyId,
          deletedAt: null,
          updatedAt: { gte: since },
          ...(input.projectId ? { projectId: input.projectId } : {}),
        },
      },
    });

    if (weakControls >= 5) {
      indicators.push({
        indicator_type: 'control_failure',
        description: `${weakControls} individual controls marked inadequate on active JHAs`,
        severity: 'warning',
        evidence: [`inadequate_control_rows=${weakControls}`],
      });
    }

    return indicators;
  }

  private async detectJhaQualityGaps(
    input: PredictiveSafetyAnalyticsAiInput,
  ): Promise<LeadingIndicator[]> {
    const lowQuality = await this.prisma.jhaFlha.findMany({
      where: {
        companyId: input.companyId,
        deletedAt: null,
        OR: [
          { qualityScore: { lt: 60 } },
          { requiresSupervisorReview: true },
          { sifPotential: true, controlsAdequate: false },
        ],
        ...(input.projectId ? { projectId: input.projectId } : {}),
      },
      select: {
        id: true,
        taskDescription: true,
        qualityScore: true,
        sifPotential: true,
      },
      take: 20,
      orderBy: { qualityScore: 'asc' },
    });

    if (!lowQuality.length) return [];

    const avg =
      lowQuality.reduce((sum, j) => sum + (j.qualityScore ?? 50), 0) /
      lowQuality.length;

    return [
      {
        indicator_type: 'jha_quality',
        description: `${
          lowQuality.length
        } JHA/FLHA below quality threshold (avg score ${Math.round(avg)})`,
        severity: avg < 45 ? 'critical' : 'warning',
        evidence: lowQuality
          .slice(0, 3)
          .map((j) => j.taskDescription.slice(0, 60)),
        trend: 'stable',
      },
    ];
  }

  private async detectIncidentPatterns(
    input: PredictiveSafetyAnalyticsAiInput,
    since: Date,
  ): Promise<LeadingIndicator[]> {
    const events = await this.prisma.pmSafetyEvent.groupBy({
      by: ['eventType'],
      where: {
        companyId: input.companyId,
        deletedAt: null,
        occurredAt: { gte: since },
        ...(input.projectId ? { projectId: input.projectId } : {}),
      },
      _count: true,
    });

    return events
      .filter((e) => e._count >= 2)
      .map((e) => ({
        indicator_type: 'incident_pattern' as const,
        description: `${e._count} ${e.eventType.replace(
          /_/g,
          ' ',
        )} event(s) in analysis window`,
        severity: e._count >= 5 ? ('critical' as const) : ('warning' as const),
        evidence: [`event_type=${e.eventType}`, `count=${e._count}`],
        trend: 'increasing' as const,
      }));
  }

  private async detectReadinessGaps(
    input: PredictiveSafetyAnalyticsAiInput,
  ): Promise<LeadingIndicator[]> {
    if (!input.projectId) return [];

    const denials = await this.prisma.pmAccessAttempt.count({
      where: {
        projectId: input.projectId,
        decision: { not: 'granted' },
        createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
      },
    });

    if (denials < 3) return [];

    return [
      {
        indicator_type: 'readiness_gap',
        description: `${denials} site access denials in last 30 days — worker readiness friction`,
        severity: denials >= 10 ? 'critical' : 'warning',
        evidence: [`access_denials_30d=${denials}`],
        trend: 'increasing',
      },
    ];
  }

  private buildInterventions(
    bundle: Awaited<
      ReturnType<PmPredictiveSafetyAnalyticsService['getBundle']>
    >,
    forecast: RiskForecastItem[],
    indicators: LeadingIndicator[],
  ): RecommendedIntervention[] {
    const interventions: RecommendedIntervention[] = [];

    for (const ind of indicators.filter(
      (i) => i.indicator_type === 'training_expiry_cluster',
    )) {
      interventions.push({
        intervention_type: 'training_refresher',
        title: 'Schedule training refresher campaign',
        description: ind.description,
        priority: ind.severity === 'critical' ? 'high' : 'medium',
        target: ind.evidence[0],
      });
    }

    for (const ind of indicators.filter(
      (i) => i.indicator_type === 'repeated_hazard',
    )) {
      interventions.push({
        intervention_type: 'additional_controls',
        title: 'Engineering control review for repeated hazard',
        description: ind.description,
        priority: 'high',
        target: ind.description,
      });
    }

    for (const ind of indicators.filter(
      (i) => i.indicator_type === 'control_failure',
    )) {
      interventions.push({
        intervention_type: 'additional_controls',
        title: 'Close control verification gaps',
        description: ind.description,
        priority: ind.severity === 'critical' ? 'high' : 'medium',
      });
    }

    for (const ind of indicators.filter(
      (i) => i.indicator_type === 'jha_quality',
    )) {
      interventions.push({
        intervention_type: 'jha_review',
        title: 'Supervisor JHA quality review',
        description: ind.description,
        priority: 'high',
      });
    }

    for (const w of forecast
      .filter((f) => f.entity_type === 'worker')
      .slice(0, 5)) {
      interventions.push({
        intervention_type: 'supervisor_coaching',
        title: `Coaching session: ${w.label}`,
        description: `Worker risk score ${w.risk_score}. Address: ${w.drivers
          .slice(0, 2)
          .join(', ')}.`,
        priority: w.risk_level === 'critical' ? 'high' : 'medium',
        target: String(w.entity_id),
      });
    }

    if (
      bundle.summary.overallRiskLevel === 'high' ||
      bundle.summary.overallRiskLevel === 'critical'
    ) {
      interventions.push({
        intervention_type: 'project_audit',
        title: 'Project-level safety audit',
        description: `Overall risk index ${bundle.summary.overallRiskIndex}/100 with ${bundle.summary.overallRiskLevel} level.`,
        priority: 'high',
        target: bundle.projectId ? `project:${bundle.projectId}` : undefined,
      });
    }

    for (const ind of indicators.filter(
      (i) => i.indicator_type === 'incident_pattern',
    )) {
      interventions.push({
        intervention_type: 'inspection',
        title: 'Targeted inspection for recurring incident type',
        description: ind.description,
        priority: ind.severity === 'critical' ? 'high' : 'medium',
      });
    }

    for (const action of bundle.preventiveActions.slice(0, 5)) {
      const type = this.mapPreventiveCategory(action.category);
      interventions.push({
        intervention_type: type,
        title: action.title,
        description: action.description,
        priority:
          action.priority === 'critical'
            ? 'high'
            : action.priority === 'high'
            ? 'high'
            : 'medium',
        target: action.targetEntity?.label,
      });
    }

    const seen = new Set<string>();
    return interventions
      .filter((i) => {
        const key = `${i.intervention_type}:${i.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 16);
  }

  private mapPreventiveCategory(
    category: string,
  ): RecommendedIntervention['intervention_type'] {
    if (category === 'training') return 'training_refresher';
    if (category === 'control') return 'additional_controls';
    if (category === 'inspection') return 'inspection';
    if (category === 'contractor') return 'project_audit';
    return 'supervisor_coaching';
  }

  private buildFieldSummary(
    core: PredictiveSafetyAnalyticsAiJson,
    overallLevel: string,
  ): string {
    const highRisk = core.risk_forecast.filter(
      (r) => r.risk_level === 'high' || r.risk_level === 'critical',
    ).length;
    const criticalIndicators = core.leading_indicators.filter(
      (i) => i.severity === 'critical',
    ).length;

    return [
      `Predictive analysis: ${core.risk_forecast.length} entity forecast(s), ${highRisk} high/critical.`,
      `${core.leading_indicators.length} leading indicator(s) (${criticalIndicators} critical).`,
      `${core.recommended_interventions.length} intervention(s) recommended.`,
      `Project risk posture: ${overallLevel}.`,
    ].join(' ');
  }
}
