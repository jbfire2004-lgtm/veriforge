import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type KpiCategory =
  | 'training'
  | 'verification'
  | 'compliance'
  | 'incident'
  | 'field'
  | 'culture';

export type TrendDirection = 'up' | 'down' | 'flat';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type ReportStatus = 'draft' | 'ready' | 'exported';

export type SafetyKpi = {
  id: string;
  name: string;
  category: KpiCategory;
  formula: string;
  target: number | null;
  currentValue: number;
  score: number;
  baseline: number;
  forecastValue: number;
  trend: TrendDirection;
  history: number[];
  timestamp: string;
  userId: number;
};

export type KpiAlert = {
  id: string;
  kpiId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: KpiCategory;
  timestamp: string;
  userId: number;
};

export type KpiReport = {
  id: string;
  title: string;
  category: KpiCategory | 'all';
  summary: string;
  scoreAverage: number;
  status: ReportStatus;
  timestamp: string;
  userId: number;
};

export type KpiAnalytics = {
  totalKpis: number;
  criticalCount: number;
  averageScore: number;
  belowTarget: number;
  negativeTrends: number;
  forecastRisk: number;
  categoryScores: Record<KpiCategory, number>;
  alertCount: number;
  reportCount: number;
  timestamp: string;
  userId: number | null;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreFromValue(current: number, target: number | null) {
  if (target === null || target <= 0) return clamp(current);
  return clamp((current / target) * 100);
}

function trendFromHistory(history: number[]): TrendDirection {
  if (history.length < 2) return 'flat';
  const delta = history[history.length - 1] - history[0];
  if (delta > 2) return 'up';
  if (delta < -2) return 'down';
  return 'flat';
}

function forecastFromHistory(history: number[], current: number) {
  if (history.length < 2) return clamp(current);
  const delta =
    (history[history.length - 1] - history[0]) / Math.max(1, history.length - 1);
  return clamp(current + delta * 2);
}

@Injectable()
export class SafetyKpiIntelligenceService {
  private kpiSeq = 13;
  private alertSeq = 5;
  private reportSeq = 3;

  private kpis: SafetyKpi[] = [];
  private alerts: KpiAlert[] = [];
  private reports: KpiReport[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const defs: Array<{
      id: string;
      name: string;
      category: KpiCategory;
      formula: string;
      target: number | null;
      currentValue: number;
      baseline: number;
      history: number[];
    }> = [
      {
        id: 'kpi-1',
        name: 'Training Completion Rate',
        category: 'training',
        formula: 'completed / assigned * 100',
        target: 95,
        currentValue: 88,
        baseline: 90,
        history: [84, 86, 87, 88],
      },
      {
        id: 'kpi-2',
        name: 'Overdue Training Modules',
        category: 'training',
        formula: '100 - overdue_ratio * 100',
        target: 95,
        currentValue: 72,
        baseline: 85,
        history: [90, 84, 78, 72],
      },
      {
        id: 'kpi-3',
        name: 'Verification Pass Rate',
        category: 'verification',
        formula: 'pass / total_checks * 100',
        target: 92,
        currentValue: 81,
        baseline: 88,
        history: [90, 87, 84, 81],
      },
      {
        id: 'kpi-4',
        name: 'Workflow Cycle Time',
        category: 'verification',
        formula: '100 - normalized_hours',
        target: 85,
        currentValue: 69,
        baseline: 80,
        history: [82, 78, 73, 69],
      },
      {
        id: 'kpi-5',
        name: 'Document Validity',
        category: 'compliance',
        formula: 'valid_docs / required_docs * 100',
        target: 98,
        currentValue: 91,
        baseline: 94,
        history: [93, 92, 91, 91],
      },
      {
        id: 'kpi-6',
        name: 'Requirement Coverage',
        category: 'compliance',
        formula: 'covered / required * 100',
        target: 100,
        currentValue: 86,
        baseline: 92,
        history: [94, 91, 88, 86],
      },
      {
        id: 'kpi-7',
        name: 'Incident Frequency Index',
        category: 'incident',
        formula: '100 - frequency_index',
        target: 90,
        currentValue: 64,
        baseline: 82,
        history: [80, 74, 69, 64],
      },
      {
        id: 'kpi-8',
        name: 'Incident Closure Time',
        category: 'incident',
        formula: '100 - closure_days_norm',
        target: 85,
        currentValue: 71,
        baseline: 79,
        history: [78, 76, 73, 71],
      },
      {
        id: 'kpi-9',
        name: 'Field Task Completion',
        category: 'field',
        formula: 'completed_tasks / assigned * 100',
        target: 90,
        currentValue: 76,
        baseline: 84,
        history: [82, 80, 78, 76],
      },
      {
        id: 'kpi-10',
        name: 'Hazard Density Control',
        category: 'field',
        formula: '100 - hazard_density_norm',
        target: 88,
        currentValue: 58,
        baseline: 75,
        history: [74, 68, 62, 58],
      },
      {
        id: 'kpi-11',
        name: 'Culture Engagement',
        category: 'culture',
        formula: 'engaged_workers / workforce * 100',
        target: 80,
        currentValue: 77,
        baseline: 74,
        history: [70, 72, 75, 77],
      },
      {
        id: 'kpi-12',
        name: 'Behavior Trend Index',
        category: 'culture',
        formula: 'positive_observations / total * 100',
        target: 85,
        currentValue: 83,
        baseline: 80,
        history: [78, 80, 81, 83],
      },
    ];

    this.kpis = defs.map((d) => {
      const score = scoreFromValue(d.currentValue, d.target);
      return {
        ...d,
        score,
        forecastValue: forecastFromHistory(d.history, d.currentValue),
        trend: trendFromHistory(d.history),
        timestamp: now,
        userId: 1,
      };
    });

    for (const kpi of this.kpis) {
      this.maybeAlert(kpi, 1);
    }

    this.reports = [
      {
        id: 'rpt-1',
        title: 'Weekly Safety KPI Brief',
        category: 'all',
        summary:
          'Training stable; verification and field hazard density trending down.',
        scoreAverage: this.averageScore(),
        status: 'ready',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'rpt-2',
        title: 'Incident & Field Deep Dive',
        category: 'incident',
        summary: 'Incident frequency and hazard density require intervention.',
        scoreAverage: this.categoryScore('incident'),
        status: 'draft',
        timestamp: now,
        userId: 1,
      },
    ];
  }

  overview() {
    return {
      kpis: this.kpis,
      alerts: this.alerts,
      reports: this.reports,
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): KpiAnalytics {
    const categories: KpiCategory[] = [
      'training',
      'verification',
      'compliance',
      'incident',
      'field',
      'culture',
    ];
    const categoryScores = Object.fromEntries(
      categories.map((c) => [c, this.categoryScore(c)]),
    ) as Record<KpiCategory, number>;
    const criticalCount = this.kpis.filter((k) => k.score < 70).length;
    const belowTarget = this.kpis.filter(
      (k) => k.target !== null && k.currentValue < k.target,
    ).length;
    const negativeTrends = this.kpis.filter((k) => k.trend === 'down').length;
    return {
      totalKpis: this.kpis.length,
      criticalCount,
      averageScore: this.averageScore(),
      belowTarget,
      negativeTrends,
      forecastRisk: this.kpis.filter((k) => k.forecastValue < 70).length,
      categoryScores,
      alertCount: this.alerts.length,
      reportCount: this.reports.length,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  private averageScore() {
    if (this.kpis.length === 0) return 0;
    return clamp(
      this.kpis.reduce((s, k) => s + k.score, 0) / this.kpis.length,
    );
  }

  private categoryScore(category: KpiCategory) {
    const rows = this.kpis.filter((k) => k.category === category);
    if (rows.length === 0) return 0;
    return clamp(rows.reduce((s, k) => s + k.score, 0) / rows.length);
  }

  private getKpi(id: string) {
    const kpi = this.kpis.find((k) => k.id === id);
    if (!kpi) throw new NotFoundException(`KPI ${id} not found`);
    return kpi;
  }

  defineKpi(
    input: {
      name: string;
      category: KpiCategory;
      formula: string;
      target?: number | null;
      currentValue?: number;
      baseline?: number;
    },
    userId: number,
  ) {
    const currentValue = input.currentValue ?? 50;
    const history = [currentValue - 4, currentValue - 2, currentValue];
    const kpi: SafetyKpi = {
      id: `kpi-${this.kpiSeq++}`,
      name: input.name,
      category: input.category,
      formula: input.formula,
      target: input.target ?? null,
      currentValue,
      score: scoreFromValue(currentValue, input.target ?? null),
      baseline: input.baseline ?? currentValue,
      forecastValue: forecastFromHistory(history, currentValue),
      trend: trendFromHistory(history),
      history,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.kpis.unshift(kpi);
    this.maybeAlert(kpi, userId);
    return kpi;
  }

  scoreKpi(
    id: string,
    input: { currentValue: number; target?: number | null },
    userId: number,
  ) {
    const kpi = this.getKpi(id);
    const previous = kpi.score;
    kpi.currentValue = input.currentValue;
    if (input.target !== undefined) kpi.target = input.target;
    kpi.history = [...kpi.history.slice(-5), input.currentValue];
    kpi.score = scoreFromValue(kpi.currentValue, kpi.target);
    kpi.forecastValue = forecastFromHistory(kpi.history, kpi.currentValue);
    kpi.trend = trendFromHistory(kpi.history);
    kpi.userId = userId;
    kpi.timestamp = new Date().toISOString();
    if (kpi.score < 70 && kpi.score < previous) {
      this.raiseCriticalDrop(kpi, previous, userId);
    } else {
      this.maybeAlert(kpi, userId);
    }
    return kpi;
  }

  bumpKpi(id: string, delta: number, userId: number) {
    const kpi = this.getKpi(id);
    return this.scoreKpi(
      id,
      { currentValue: clamp(kpi.currentValue + delta), target: kpi.target },
      userId,
    );
  }

  setTarget(id: string, target: number | null, userId: number) {
    const kpi = this.getKpi(id);
    kpi.target = target;
    kpi.score = scoreFromValue(kpi.currentValue, target);
    kpi.userId = userId;
    kpi.timestamp = new Date().toISOString();
    this.maybeAlert(kpi, userId);
    return kpi;
  }

  forecast(id: string, userId: number) {
    const kpi = this.getKpi(id);
    kpi.forecastValue = forecastFromHistory(kpi.history, kpi.currentValue);
    kpi.trend = trendFromHistory(kpi.history);
    kpi.userId = userId;
    kpi.timestamp = new Date().toISOString();
    if (kpi.forecastValue < 70 && kpi.trend === 'down') {
      this.raiseCriticalDrop(kpi, kpi.score, userId, true);
    }
    return kpi;
  }

  createReport(
    input: {
      title: string;
      category?: KpiCategory | 'all';
      summary?: string;
    },
    userId: number,
  ) {
    const category = input.category ?? 'all';
    const scoreAverage =
      category === 'all' ? this.averageScore() : this.categoryScore(category);
    const report: KpiReport = {
      id: `rpt-${this.reportSeq++}`,
      title: input.title,
      category,
      summary:
        input.summary ??
        `Export-ready ${category} KPI report · avg score ${scoreAverage}%`,
      scoreAverage,
      status: 'ready',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.reports.unshift(report);
    return report;
  }

  exportReport(id: string, userId: number) {
    const report = this.reports.find((r) => r.id === id);
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    report.status = 'exported';
    report.userId = userId;
    report.timestamp = new Date().toISOString();
    return report;
  }

  private maybeAlert(kpi: SafetyKpi, userId: number) {
    if (kpi.target === null) {
      this.alerts.unshift({
        id: `ka-${this.alertSeq++}`,
        kpiId: kpi.id,
        title: 'MISSING KPI TARGET',
        message: `${kpi.name} has no target defined.`,
        severity: 'warning',
        category: kpi.category,
        timestamp: new Date().toISOString(),
        userId,
      });
      return;
    }
    if (kpi.score < 70) {
      this.raiseCriticalDrop(kpi, kpi.score + 5, userId);
    }
  }

  private raiseCriticalDrop(
    kpi: SafetyKpi,
    previous: number,
    userId: number,
    forecast = false,
  ) {
    const title = forecast ? 'CRITICAL KPI FORECAST DROP' : 'CRITICAL KPI DROP';
    const message = forecast
      ? `${kpi.name} forecast ${kpi.forecastValue}% (trend ${kpi.trend}).`
      : `${kpi.name} scored ${kpi.score}% (was ~${clamp(previous)}%).`;
    this.alerts.unshift({
      id: `ka-${this.alertSeq++}`,
      kpiId: kpi.id,
      title,
      message,
      severity: 'critical',
      category: kpi.category,
      timestamp: new Date().toISOString(),
      userId,
    });
    this.notifications.enqueue({
      title,
      message,
      category: 'compliance',
      forgeStatus: 'failed',
    });
  }
}
