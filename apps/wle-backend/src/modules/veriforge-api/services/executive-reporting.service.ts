import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type ReportType =
  | 'executive'
  | 'training'
  | 'verification'
  | 'compliance'
  | 'incident'
  | 'risk'
  | 'equipment'
  | 'workforce'
  | 'predictive';

export type ReportStatus = 'draft' | 'ready' | 'exported' | 'critical';
export type RegionCode =
  | 'NA-EAST'
  | 'NA-WEST'
  | 'EU-CENTRAL'
  | 'EU-WEST'
  | 'APAC'
  | 'LATAM'
  | 'GLOBAL';

export type ReportKpi = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  critical: boolean;
  series?: number[];
};

export type ExecutiveReport = {
  id: string;
  type: ReportType;
  title: string;
  summary: string;
  status: ReportStatus;
  score: number;
  region: RegionCode;
  tenantId: string;
  kpis: ReportKpi[];
  highlights: string[];
  timestamp: string;
  userId: number;
  exportedAt?: string;
};

export type ReportingAnalytics = {
  totalReports: number;
  readyCount: number;
  exportedCount: number;
  criticalCount: number;
  averageScore: number;
  typeCounts: Record<ReportType, number>;
  executiveReadinessScore: number;
  timestamp: string;
  userId: number | null;
};

const TYPES: ReportType[] = [
  'executive',
  'training',
  'verification',
  'compliance',
  'incident',
  'risk',
  'equipment',
  'workforce',
  'predictive',
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

@Injectable()
export class ExecutiveReportingService {
  private seq = 20;
  private reports: ExecutiveReport[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const tenantId = 'tenant-forge-global';
    const userId = 1;

    this.reports = [
      {
        id: 'rpt-exec-01',
        type: 'executive',
        title: 'Executive Summary · Q Shift',
        summary:
          'Composite industrial readiness across training, compliance, incidents, and risk',
        status: 'ready',
        score: 78,
        region: 'GLOBAL',
        tenantId,
        kpis: [
          { id: 'k1', label: 'Overall readiness', value: 78, critical: false, series: [70, 72, 74, 75, 76, 77, 78] },
          { id: 'k2', label: 'Critical KPIs', value: 3, critical: true },
          { id: 'k3', label: 'Open incidents', value: 5, critical: true },
          { id: 'k4', label: 'Compliance coverage', value: 86, critical: false },
        ],
        highlights: [
          '3 critical KPIs require executive attention',
          'Compliance coverage holding above target',
          'Incident closure time trending down',
        ],
        timestamp: now,
        userId,
      },
      {
        id: 'rpt-train-01',
        type: 'training',
        title: 'Training Report',
        summary: 'Completion rate, overdue modules, certification status',
        status: 'ready',
        score: 84,
        region: 'NA-EAST',
        tenantId,
        kpis: [
          { id: 't1', label: 'Completion rate', value: 84, unit: '%', critical: false, series: [78, 80, 81, 82, 83, 84, 84] },
          { id: 't2', label: 'Overdue modules', value: 12, critical: true },
          { id: 't3', label: 'Certifications valid', value: 91, unit: '%', critical: false },
          { id: 't4', label: 'Fail risk cohort', value: 8, critical: false },
        ],
        highlights: ['12 overdue modules in Cell B', 'Certification validity strong at 91%'],
        timestamp: now,
        userId,
      },
      {
        id: 'rpt-ver-01',
        type: 'verification',
        title: 'Verification Report',
        summary: 'forgeCheck pass rate, workflow time, failure trends',
        status: 'ready',
        score: 81,
        region: 'NA-WEST',
        tenantId,
        kpis: [
          { id: 'v1', label: 'forgeCheck pass rate', value: 81, unit: '%', critical: false, series: [76, 77, 78, 79, 80, 80, 81] },
          { id: 'v2', label: 'Avg workflow time', value: 42, unit: 'min', critical: false },
          { id: 'v3', label: 'Failure trend', value: 19, unit: '%', critical: true },
          { id: 'v4', label: 'Pending checks', value: 23, critical: false },
        ],
        highlights: ['Failure trend elevated — review forgeFlow bottlenecks'],
        timestamp: now,
        userId,
      },
      {
        id: 'rpt-comp-01',
        type: 'compliance',
        title: 'Compliance Report',
        summary: 'Document validity, requirement coverage, expiry forecast',
        status: 'critical',
        score: 72,
        region: 'EU-CENTRAL',
        tenantId,
        kpis: [
          { id: 'c1', label: 'Document validity', value: 88, unit: '%', critical: false },
          { id: 'c2', label: 'Requirement coverage', value: 79, unit: '%', critical: false },
          { id: 'c3', label: 'Expiry forecast (14d)', value: 14, critical: true, series: [4, 6, 8, 10, 11, 13, 14] },
          { id: 'c4', label: 'Critical gaps', value: 4, critical: true },
        ],
        highlights: ['4 critical gaps · 14 docs expiring in 14 days'],
        timestamp: now,
        userId,
      },
      {
        id: 'rpt-inc-01',
        type: 'incident',
        title: 'Incident Report',
        summary: 'Frequency, severity, root cause, closure time',
        status: 'critical',
        score: 64,
        region: 'APAC',
        tenantId,
        kpis: [
          { id: 'i1', label: 'Frequency (30d)', value: 11, critical: true, series: [6, 7, 8, 9, 9, 10, 11] },
          { id: 'i2', label: 'Critical severity', value: 3, critical: true },
          { id: 'i3', label: 'Avg closure time', value: 4.2, unit: 'd', critical: false },
          { id: 'i4', label: 'Root cause closed', value: 68, unit: '%', critical: false },
        ],
        highlights: ['Severity cluster in Zone 3', 'Closure time improving'],
        timestamp: now,
        userId,
      },
      {
        id: 'rpt-risk-01',
        type: 'risk',
        title: 'Risk Report',
        summary: 'Hazard density, control coverage, risk score trends',
        status: 'ready',
        score: 70,
        region: 'EU-WEST',
        tenantId,
        kpis: [
          { id: 'r1', label: 'Risk score', value: 70, critical: false, series: [62, 64, 66, 67, 68, 69, 70] },
          { id: 'r2', label: 'Hazard density', value: 58, critical: false },
          { id: 'r3', label: 'Control coverage', value: 82, unit: '%', critical: false },
          { id: 'r4', label: 'High-risk zones', value: 3, critical: true },
        ],
        highlights: ['3 high-risk zones predicted', 'Control coverage above 80%'],
        timestamp: now,
        userId,
      },
      {
        id: 'rpt-eq-01',
        type: 'equipment',
        title: 'Equipment Report',
        summary: 'Inspection status, defect frequency, certification expiry',
        status: 'ready',
        score: 76,
        region: 'NA-EAST',
        tenantId,
        kpis: [
          { id: 'e1', label: 'Inspection pass', value: 87, unit: '%', critical: false },
          { id: 'e2', label: 'Defect frequency', value: 9, critical: true, series: [4, 5, 6, 7, 8, 8, 9] },
          { id: 'e3', label: 'Cert expiry (30d)', value: 6, critical: true },
          { id: 'e4', label: 'Assets healthy', value: 91, unit: '%', critical: false },
        ],
        highlights: ['Crane-04 defect anomaly', '6 certs expiring in 30 days'],
        timestamp: now,
        userId,
      },
      {
        id: 'rpt-wf-01',
        type: 'workforce',
        title: 'Workforce Readiness Report',
        summary: 'Training, verification, compliance readiness',
        status: 'critical',
        score: 68,
        region: 'LATAM',
        tenantId,
        kpis: [
          { id: 'w1', label: 'Training readiness', value: 74, unit: '%', critical: false },
          { id: 'w2', label: 'Verification readiness', value: 71, unit: '%', critical: false },
          { id: 'w3', label: 'Compliance readiness', value: 62, unit: '%', critical: true },
          { id: 'w4', label: 'Composite readiness', value: 68, unit: '%', critical: true, series: [72, 71, 70, 69, 69, 68, 68] },
        ],
        highlights: ['Low compliance readiness in LATAM', 'Composite below 70% threshold'],
        timestamp: now,
        userId,
      },
      {
        id: 'rpt-pred-01',
        type: 'predictive',
        title: 'Predictive Insights',
        summary: 'AI-driven forecasts with predicted risk highlights',
        status: 'ready',
        score: 73,
        region: 'GLOBAL',
        tenantId,
        kpis: [
          { id: 'p1', label: 'Incident probability', value: 78, critical: true, series: [55, 60, 65, 70, 74, 76, 78] },
          { id: 'p2', label: 'Compliance lapse risk', value: 81, critical: true },
          { id: 'p3', label: 'Equipment failure', value: 69, critical: false },
          { id: 'p4', label: 'Predictive health', value: 73, critical: false, series: [80, 78, 76, 75, 74, 73, 73] },
        ],
        highlights: ['Critical incident & compliance forecasts', 'Equipment failure watch on Crane-04'],
        timestamp: now,
        userId,
      },
    ];
  }

  overview() {
    return {
      features: [
        'Executive dashboards',
        'KPI summaries',
        'Compliance overviews',
        'Incident analytics',
        'Risk intelligence',
        'Workforce readiness',
        'Equipment health',
        'Predictive insights',
        'Export-ready report layouts',
      ],
      reports: this.reports,
      analytics: this.analytics(null),
    };
  }

  listByType(type: ReportType) {
    return this.reports.filter((r) => r.type === type);
  }

  get(id: string) {
    const row = this.reports.find((r) => r.id === id);
    if (!row) throw new NotFoundException(`Report ${id} not found`);
    return row;
  }

  generate(
    input: {
      type: ReportType;
      title?: string;
      region?: RegionCode;
      tenantId?: string;
    },
    userId: number,
  ) {
    const tenantId = input.tenantId ?? 'tenant-forge-global';
    const region = input.region ?? 'GLOBAL';
    const score = clamp(55 + Math.floor(Math.random() * 40));
    const critical = score < 70;
    const report: ExecutiveReport = {
      id: `rpt-${this.seq++}`,
      type: input.type,
      title: input.title ?? `${input.type} report · generated`,
      summary: `Generated ${input.type} executive report`,
      status: critical ? 'critical' : 'ready',
      score,
      region,
      tenantId,
      kpis: [
        {
          id: 'g1',
          label: 'Primary score',
          value: score,
          critical,
          series: [score - 12, score - 8, score - 5, score - 3, score - 2, score - 1, score].map(
            clamp,
          ),
        },
        {
          id: 'g2',
          label: 'Critical flags',
          value: critical ? 2 : 0,
          critical,
        },
      ],
      highlights: critical
        ? ['Critical KPI threshold breached']
        : ['Report within industrial targets'],
      timestamp: new Date().toISOString(),
      userId,
    };
    this.reports = [report, ...this.reports];
    if (critical) {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL EXECUTIVE KPI',
        message: `${report.title} scored ${score} · region ${region} · tenant ${tenantId}`,
        forgeStatus: 'failed',
      });
    }
    return { report, analytics: this.analytics(userId) };
  }

  export(id: string, userId: number) {
    const report = this.get(id);
    const updated: ExecutiveReport = {
      ...report,
      status: report.status === 'critical' ? 'critical' : 'exported',
      exportedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      userId,
    };
    this.reports = this.reports.map((r) => (r.id === id ? updated : r));
    if (updated.status === 'critical') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL EXECUTIVE KPI',
        message: `Exported critical report ${updated.title} · tenant ${updated.tenantId}`,
        forgeStatus: 'failed',
      });
    }
    return { report: updated, analytics: this.analytics(userId) };
  }

  analytics(userId: number | null): ReportingAnalytics {
    const typeCounts = TYPES.reduce(
      (acc, t) => {
        acc[t] = 0;
        return acc;
      },
      {} as Record<ReportType, number>,
    );
    for (const r of this.reports) typeCounts[r.type] += 1;

    const criticalCount = this.reports.filter(
      (r) =>
        r.status === 'critical' ||
        r.kpis.some((k) => k.critical) ||
        r.score < 70,
    ).length;
    const readyCount = this.reports.filter(
      (r) => r.status === 'ready' || r.status === 'exported',
    ).length;
    const exportedCount = this.reports.filter((r) => r.status === 'exported')
      .length;
    const averageScore =
      this.reports.length === 0
        ? 0
        : clamp(
            this.reports.reduce((s, r) => s + r.score, 0) / this.reports.length,
          );
    const executiveReadinessScore = clamp(
      averageScore - criticalCount * 3 + exportedCount * 2,
    );

    return {
      totalReports: this.reports.length,
      readyCount,
      exportedCount,
      criticalCount,
      averageScore,
      typeCounts,
      executiveReadinessScore,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}
