import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AnalyticsSafetyCultureEngineInput,
  AnalyticsSafetyCultureEngineOutput,
  CultureInsights,
  SafetyCultureDiagnosis,
  TimeSeriesPoint,
} from './analytics-safety-culture-engine.types';

const DEFAULT_ORG_GOALS = [
  'Reduce SIF exposure',
  'Improve reporting culture',
  'Increase leading indicators',
];

@Injectable()
export class AnalyticsSafetyCultureEngineService {
  constructor(private readonly prisma: PrismaService) {}

  generate(
    input: AnalyticsSafetyCultureEngineInput,
  ): AnalyticsSafetyCultureEngineOutput {
    const diagnosis = this.diagnose(input);
    const culture_insights = this.cultureLens(input);
    const quick_wins = this.buildQuickWins(input, diagnosis, culture_insights);
    const strategic_initiatives = this.buildStrategic(
      input,
      diagnosis,
      culture_insights,
    );
    const exec_brief = this.buildExecBrief(
      input,
      diagnosis,
      culture_insights,
      quick_wins,
    );
    const frontline_brief = this.buildFrontlineBrief(
      input,
      culture_insights,
      quick_wins,
    );

    return {
      diagnosis,
      culture_insights,
      quick_wins: quick_wins.slice(0, 5),
      strategic_initiatives: strategic_initiatives.slice(0, 5),
      exec_brief,
      frontline_brief,
    };
  }

  async buildInputFromScope(
    companyId: number,
    projectId?: number,
  ): Promise<AnalyticsSafetyCultureEngineInput> {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const projectFilter = projectId ? { projectId } : {};

    const [
      incidents,
      inspections,
      capas,
      workers,
      trainingRecords,
      jhaRecords,
      forecasts,
    ] = await Promise.all([
      this.prisma.pmSafetyEvent.findMany({
        where: {
          companyId,
          deletedAt: null,
          occurredAt: { gte: since },
          ...projectFilter,
        },
        select: {
          eventType: true,
          severity: true,
          occurredAt: true,
          sifEventId: true,
        },
        take: 200,
      }),
      this.prisma.pmInspection.findMany({
        where: {
          companyId,
          deletedAt: null,
          createdAt: { gte: since },
          ...projectFilter,
        },
        select: {
          status: true,
          passed: true,
          submittedAt: true,
          deficiencies: { select: { title: true, status: true } },
        },
        take: 200,
      }),
      this.prisma.pmSafetyEventCorrectiveAction.findMany({
        where: {
          event: { companyId, deletedAt: null, ...projectFilter },
        },
        select: { status: true, dueAt: true, verifiedAt: true, title: true },
        take: 200,
      }),
      this.prisma.worker.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.trainingRecord.findMany({
        where: { companyId, ...(projectId ? { projectId } : {}) },
        select: { expiresAt: true, completedAt: true },
        take: 500,
      }),
      this.prisma.jhaFlha.findMany({
        where: { companyId, deletedAt: null, ...projectFilter },
        select: {
          status: true,
          riskScore: true,
          controlsAdequate: true,
          qualityScore: true,
        },
        take: 100,
      }),
      this.prisma.pmPredictiveSafetyForecast.findMany({
        where: { companyId, ...(projectId ? { projectId } : {}) },
        orderBy: { weekStart: 'desc' },
        take: 8,
        select: { weekStart: true, riskIndex: true },
      }),
    ]);

    const injuries = incidents.filter(
      (i) => i.eventType === 'incident_injury',
    ).length;
    const nearMisses = incidents.filter(
      (i) => i.eventType === 'near_miss',
    ).length;
    const hours = Math.max(workers * 2000, 1);
    const TRIF = Math.round((injuries / hours) * 200_000 * 10) / 10;

    const submittedInspections = inspections.filter(
      (i) => i.submittedAt,
    ).length;
    const inspection_completion =
      inspections.length > 0
        ? Math.round((submittedInspections / inspections.length) * 100)
        : undefined;

    const now = new Date();
    const validTraining = trainingRecords.filter(
      (t) => t.completedAt && (!t.expiresAt || t.expiresAt > now),
    ).length;
    const training_completion =
      trainingRecords.length > 0
        ? Math.round((validTraining / trainingRecords.length) * 100)
        : undefined;

    const onTimeCapa = capas.filter(
      (c) => c.verifiedAt && c.dueAt && c.verifiedAt <= c.dueAt,
    ).length;
    const closedCapa = capas.filter(
      (c) => c.status === 'closed' || c.verifiedAt,
    ).length;
    const CAPA_on_time =
      closedCapa > 0 ? Math.round((onTimeCapa / closedCapa) * 100) : undefined;

    const incident_classification_summary = this.summarizeIncidents(incidents);
    const audit_trends = this.summarizeAuditTrends(inspections);

    const jhaPassed = jhaRecords.filter(
      (j) => j.status === 'APPROVED' || j.controlsAdequate === true,
    ).length;
    const JHA_quality_metrics = [
      {
        metric: 'JHA pass rate',
        value: jhaRecords.length
          ? Math.round((jhaPassed / jhaRecords.length) * 100)
          : 0,
        target: 85,
      },
      {
        metric: 'Average JHA risk score',
        value: jhaRecords.length
          ? Math.round(
              jhaRecords.reduce((n, j) => n + (j.riskScore ?? 0), 0) /
                jhaRecords.length,
            )
          : 0,
        target: 40,
      },
    ];

    const time_series_data: TimeSeriesPoint[] = forecasts
      .reverse()
      .map((f) => ({
        period: f.weekStart.toISOString().slice(0, 10),
        metric: 'risk_index',
        value: f.riskIndex,
      }));

    return {
      KPIs: {
        TRIF,
        LTIF: TRIF > 0 ? Math.round(TRIF * 0.3 * 10) / 10 : 0,
        near_miss_rate: nearMisses,
        injury_count: injuries,
        inspection_completion,
        training_completion,
        CAPA_on_time,
      },
      time_series_data,
      incident_classification_summary,
      audit_trends,
      JHA_quality_metrics,
      worker_feedback_themes: [],
      org_goals: DEFAULT_ORG_GOALS,
      companyId,
      projectId,
    };
  }

  private summarizeIncidents(
    incidents: Array<{ eventType: string; severity: string }>,
  ): AnalyticsSafetyCultureEngineInput['incident_classification_summary'] {
    const counts = new Map<string, number>();
    for (const i of incidents) {
      counts.set(i.eventType, (counts.get(i.eventType) ?? 0) + 1);
    }
    return [...counts.entries()].map(([type, count]) => ({ type, count }));
  }

  private summarizeAuditTrends(
    inspections: Array<{
      deficiencies: Array<{ title: string; status: string }>;
    }>,
  ): AnalyticsSafetyCultureEngineInput['audit_trends'] {
    const counts = new Map<string, number>();
    for (const insp of inspections) {
      for (const d of insp.deficiencies.filter((x) => x.status !== 'closed')) {
        const key = d.title.slice(0, 60);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .map(([issue, recurrence_count]) => ({ issue, recurrence_count }))
      .sort((a, b) => b.recurrence_count - a.recurrence_count)
      .slice(0, 10);
  }

  private diagnose(
    input: AnalyticsSafetyCultureEngineInput,
  ): SafetyCultureDiagnosis {
    const k = input.KPIs;
    const strengths: string[] = [];
    const weak_spots: string[] = [];
    const emerging_risks: string[] = [];
    const data_quality_issues: string[] = [];

    if (k.TRIF != null && k.TRIF <= 1)
      strengths.push(`TRIF ${k.TRIF} — below typical construction benchmark.`);
    if (k.TRIF != null && k.TRIF > 2)
      weak_spots.push(`TRIF ${k.TRIF} — elevated lagging indicator.`);

    if ((k.inspection_completion ?? 100) >= 85) {
      strengths.push(
        `Inspection completion ${k.inspection_completion}% — strong field verification.`,
      );
    } else if (k.inspection_completion != null) {
      weak_spots.push(
        `Inspection completion ${k.inspection_completion}% — gaps in planned audits.`,
      );
    }

    if ((k.training_completion ?? 100) >= 90) {
      strengths.push(`Training compliance ${k.training_completion}%.`);
    } else if (k.training_completion != null) {
      weak_spots.push(
        `Training completion ${k.training_completion}% — competency exposure.`,
      );
    }

    if ((k.CAPA_on_time ?? 100) >= 80) {
      strengths.push(`CAPA on-time closure ${k.CAPA_on_time}%.`);
    } else if (k.CAPA_on_time != null) {
      weak_spots.push(
        `CAPA on-time ${k.CAPA_on_time}% — learning loop slowing.`,
      );
    }

    const nm = k.near_miss_rate ?? 0;
    const inj = k.injury_count ?? 0;
    if (nm >= inj * 3 && nm > 0) {
      strengths.push('Healthy near-miss reporting relative to injuries.');
    } else if (inj > 0 && nm < inj) {
      emerging_risks.push(
        'Under-reporting of near misses vs injuries — culture risk.',
      );
    }

    for (const t of input.audit_trends ?? []) {
      if (t.recurrence_count >= 3) {
        emerging_risks.push(
          `Recurring audit finding: ${t.issue} (${t.recurrence_count}x).`,
        );
      }
    }

    for (const j of input.JHA_quality_metrics ?? []) {
      if (j.target != null && j.value < j.target * 0.7) {
        weak_spots.push(`${j.metric} at ${j.value}% vs target ${j.target}%.`);
      }
    }

    const trend = this.seriesTrend(input.time_series_data ?? []);
    if (trend === 'worsening')
      emerging_risks.push('Risk index trending upward over recent periods.');

    if (k.TRIF == null)
      data_quality_issues.push(
        'TRIF/LTIF not fully calculable — verify hours worked data.',
      );
    if (!input.time_series_data?.length)
      data_quality_issues.push(
        'Limited time-series history for trend analysis.',
      );
    if (!input.worker_feedback_themes?.length) {
      data_quality_issues.push(
        'No structured worker feedback themes ingested.',
      );
    }

    if (!strengths.length)
      strengths.push(
        'Baseline SMS data available for continued improvement focus.',
      );

    return { strengths, weak_spots, emerging_risks, data_quality_issues };
  }

  private cultureLens(
    input: AnalyticsSafetyCultureEngineInput,
  ): CultureInsights {
    const k = input.KPIs;
    const nm = k.near_miss_rate ?? 0;
    const inj = k.injury_count ?? 0;

    const reporting_culture =
      nm > inj * 2
        ? 'Crews appear willing to report near misses — reinforce positive reporting and close the loop on actions.'
        : nm === 0 && inj === 0
        ? 'Low event volume — verify reporting channels are understood and trusted.'
        : 'Near-miss reporting may be underpowered relative to injuries — investigate fear, friction, or awareness barriers.';

    const insp = k.inspection_completion ?? 0;
    const jha = input.JHA_quality_metrics?.find((m) =>
      m.metric.includes('pass'),
    );
    const supervisory_engagement =
      insp >= 80 && (jha?.value ?? 0) >= 80
        ? 'Supervisors are completing inspections and JHA quality is acceptable.'
        : insp < 60
        ? 'Supervisory field engagement is low — inspection completion needs leadership focus.'
        : 'Mixed supervisory engagement — strengthen planned inspections and JHA coaching.';

    const capa = k.CAPA_on_time ?? 0;
    const repeats =
      (input.audit_trends ?? []).length +
      (input.incident_classification_summary ?? []).filter(
        (i) => i.trend === 'up',
      ).length;
    const learning_culture =
      capa >= 75 && repeats === 0
        ? 'CAPA closure is timely and repeat themes are limited — learning system appears effective.'
        : capa < 50
        ? 'CAPA effectiveness is weak — prioritize verification and accountability.'
        : 'Learning culture is developing — address repeat findings and close CAPA with evidence.';

    return { reporting_culture, supervisory_engagement, learning_culture };
  }

  private buildQuickWins(
    input: AnalyticsSafetyCultureEngineInput,
    diagnosis: SafetyCultureDiagnosis,
    culture: CultureInsights,
  ): string[] {
    const wins: string[] = [];

    if ((input.KPIs.inspection_completion ?? 100) < 85) {
      wins.push(
        'Schedule weekly inspection blitz with supervisor sign-off targets (30 days).',
      );
    }
    if (diagnosis.emerging_risks.some((r) => r.includes('near miss'))) {
      wins.push(
        'Run a 2-week near-miss reporting campaign with visible leadership response.',
      );
    }
    if ((input.KPIs.CAPA_on_time ?? 100) < 80) {
      wins.push(
        'CAPA stand-up: review overdue items weekly with named owners (30 days).',
      );
    }
    if (input.audit_trends?.[0]) {
      wins.push(
        `Targeted audit on recurring issue: ${input.audit_trends[0].issue} (60 days).`,
      );
    }
    if (culture.supervisory_engagement.includes('low')) {
      wins.push(
        'Supervisor coaching sessions on JHA quality and field verification (45 days).',
      );
    }
    if (!wins.length) {
      wins.push(
        'Share leading-indicator dashboard in toolbox talks for 30 days.',
      );
      wins.push(
        'Recognize teams with strong inspection and reporting participation.',
      );
    }

    return wins;
  }

  private buildStrategic(
    input: AnalyticsSafetyCultureEngineInput,
    diagnosis: SafetyCultureDiagnosis,
    culture: CultureInsights,
  ): string[] {
    const goals = input.org_goals?.length ? input.org_goals : DEFAULT_ORG_GOALS;
    const initiatives: string[] = [];

    if (goals.some((g) => /sif/i.test(g)) || diagnosis.emerging_risks.length) {
      initiatives.push(
        'Implement SIF precursor program with leadership review and cross-project learning (12 months).',
      );
    }
    if (
      goals.some((g) => /reporting/i.test(g)) ||
      culture.reporting_culture.includes('underpowered')
    ) {
      initiatives.push(
        'Build just culture framework and anonymous reporting option with metrics dashboard (6–12 months).',
      );
    }
    if ((input.KPIs.training_completion ?? 100) < 90) {
      initiatives.push(
        'Digitize competency matrix with auto-assignment and expiry workflows (9 months).',
      );
    }
    if (diagnosis.weak_spots.some((w) => w.includes('CAPA'))) {
      initiatives.push(
        'CAPA effectiveness audits with root-cause quality scoring (12 months).',
      );
    }
    initiatives.push(
      'Integrate predictive analytics with weekly leadership safety council (ongoing).',
    );
    if (diagnosis.data_quality_issues.length) {
      initiatives.push(
        'Data quality program — standardize KPI definitions and automate ingestion (18 months).',
      );
    }

    return initiatives;
  }

  private buildExecBrief(
    input: AnalyticsSafetyCultureEngineInput,
    diagnosis: SafetyCultureDiagnosis,
    culture: CultureInsights,
    quick_wins: string[],
  ): string {
    const k = input.KPIs;
    return [
      `Safety culture analytics for company${
        input.projectId ? ` project #${input.projectId}` : ''
      }.`,
      `Lag indicators: TRIF ${k.TRIF ?? 'n/a'}, injuries ${
        k.injury_count ?? 0
      }, near misses ${k.near_miss_rate ?? 0}.`,
      `Lead indicators: inspections ${
        k.inspection_completion ?? 'n/a'
      }%, training ${k.training_completion ?? 'n/a'}%, CAPA on-time ${
        k.CAPA_on_time ?? 'n/a'
      }%.`,
      `Strengths: ${diagnosis.strengths.slice(0, 2).join('; ')}.`,
      diagnosis.weak_spots.length
        ? `Attention needed: ${diagnosis.weak_spots.slice(0, 2).join('; ')}.`
        : 'No major weak spots flagged in current KPI set.',
      diagnosis.emerging_risks.length
        ? `Emerging risks: ${diagnosis.emerging_risks.slice(0, 2).join('; ')}.`
        : null,
      `Reporting culture: ${culture.reporting_culture}`,
      `Priority actions (30–60d): ${quick_wins.slice(0, 3).join(' ')}`,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private buildFrontlineBrief(
    input: AnalyticsSafetyCultureEngineInput,
    culture: CultureInsights,
    quick_wins: string[],
  ): string {
    return [
      'Safety pulse check:',
      culture.reporting_culture.split('—')[0].trim(),
      culture.supervisory_engagement.split('—')[0].trim(),
      quick_wins[0] ??
        'Keep reporting hazards and near misses — it prevents injuries.',
      (input.org_goals ?? DEFAULT_ORG_GOALS)[0] ??
        'Our goal is zero serious injuries.',
      'Speak up early; your reports drive fixes before someone gets hurt.',
    ].join(' ');
  }

  private seriesTrend(
    points: TimeSeriesPoint[],
  ): 'improving' | 'stable' | 'worsening' {
    if (points.length < 2) return 'stable';
    const first = points.slice(0, Math.ceil(points.length / 2));
    const second = points.slice(Math.ceil(points.length / 2));
    const avg = (arr: TimeSeriesPoint[]) =>
      arr.reduce((n, p) => n + p.value, 0) / Math.max(arr.length, 1);
    const delta = avg(second) - avg(first);
    if (delta > 5) return 'worsening';
    if (delta < -5) return 'improving';
    return 'stable';
  }
}
