import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type DeploymentSection =
  | 'infrastructure'
  | 'localization'
  | 'compliance'
  | 'rollout'
  | 'training'
  | 'support'
  | 'monitoring';

export type RegionCode =
  | 'NA-EAST'
  | 'NA-WEST'
  | 'EU-CENTRAL'
  | 'EU-WEST'
  | 'APAC'
  | 'LATAM'
  | 'MEA';

export type DeploymentStatus =
  | 'planned'
  | 'in_progress'
  | 'healthy'
  | 'degraded'
  | 'critical'
  | 'complete';

export type RolloutPhase = 'pilot' | 'regional' | 'global';

export type ComplianceFramework = 'OSHA' | 'COR' | 'ISO' | 'CSA' | 'EU';

export type DeploymentRecord = {
  id: string;
  section: DeploymentSection;
  title: string;
  summary: string;
  region: RegionCode;
  tenantId: string;
  status: DeploymentStatus;
  progress: number;
  timestamp: string;
  userId: number;
  meta?: Record<string, string | number | boolean>;
};

export type InfraNode = {
  id: string;
  region: RegionCode;
  role: 'host' | 'router' | 'balancer' | 'scaler' | 'dr';
  label: string;
  capacity: number;
  load: number;
  healthy: boolean;
  tenantAware: boolean;
  timestamp: string;
};

export type LocalePack = {
  id: string;
  code: string;
  label: string;
  region: RegionCode;
  complianceRules: ComplianceFramework[];
  trainingModules: number;
  active: boolean;
  timestamp: string;
};

export type ComplianceCard = {
  id: string;
  framework: ComplianceFramework;
  region: RegionCode;
  title: string;
  templateCount: number;
  aligned: boolean;
  timestamp: string;
  tenantId: string;
};

export type RolloutMilestone = {
  id: string;
  phase: RolloutPhase;
  title: string;
  region: RegionCode;
  progress: number;
  status: DeploymentStatus;
  timestamp: string;
  tenantId: string;
};

export type SupportTicket = {
  id: string;
  region: RegionCode;
  center: string;
  title: string;
  critical: boolean;
  open: boolean;
  timestamp: string;
  tenantId: string;
};

export type MonitorKpi = {
  id: string;
  label: string;
  region: RegionCode | 'GLOBAL';
  value: number;
  series: number[];
  critical: boolean;
  timestamp: string;
  tenantId: string;
};

export type DeploymentAnalytics = {
  totalRecords: number;
  criticalCount: number;
  healthyRegions: number;
  activeLocales: number;
  rolloutProgress: number;
  openCriticalTickets: number;
  globalReadinessScore: number;
  sectionCounts: Record<DeploymentSection, number>;
  timestamp: string;
  userId: number | null;
};

const SECTIONS: DeploymentSection[] = [
  'infrastructure',
  'localization',
  'compliance',
  'rollout',
  'training',
  'support',
  'monitoring',
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

@Injectable()
export class GlobalDeploymentPlaybookService {
  private seq = 40;
  private records: DeploymentRecord[] = [];
  private infra: InfraNode[] = [];
  private locales: LocalePack[] = [];
  private compliance: ComplianceCard[] = [];
  private rollout: RolloutMilestone[] = [];
  private tickets: SupportTicket[] = [];
  private kpis: MonitorKpi[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const tenantId = 'tenant-forge-global';

    this.infra = [
      {
        id: 'inf-1',
        region: 'NA-EAST',
        role: 'host',
        label: 'Forge Host · us-east-1',
        capacity: 100,
        load: 62,
        healthy: true,
        tenantAware: true,
        timestamp: now,
      },
      {
        id: 'inf-2',
        region: 'EU-CENTRAL',
        role: 'balancer',
        label: 'Steel LB · eu-central-1',
        capacity: 100,
        load: 71,
        healthy: true,
        tenantAware: true,
        timestamp: now,
      },
      {
        id: 'inf-3',
        region: 'APAC',
        role: 'scaler',
        label: 'Auto-Scale · ap-southeast-1',
        capacity: 100,
        load: 84,
        healthy: false,
        tenantAware: true,
        timestamp: now,
      },
      {
        id: 'inf-4',
        region: 'NA-WEST',
        role: 'dr',
        label: 'DR Mirror · us-west-2',
        capacity: 100,
        load: 18,
        healthy: true,
        tenantAware: true,
        timestamp: now,
      },
      {
        id: 'inf-5',
        region: 'EU-WEST',
        role: 'router',
        label: 'Tenant Router · eu-west-1',
        capacity: 100,
        load: 55,
        healthy: true,
        tenantAware: true,
        timestamp: now,
      },
      {
        id: 'inf-6',
        region: 'LATAM',
        role: 'host',
        label: 'Forge Host · sa-east-1',
        capacity: 100,
        load: 44,
        healthy: true,
        tenantAware: true,
        timestamp: now,
      },
    ];

    this.locales = [
      {
        id: 'loc-en-us',
        code: 'en-US',
        label: 'English (US)',
        region: 'NA-EAST',
        complianceRules: ['OSHA', 'ISO'],
        trainingModules: 24,
        active: true,
        timestamp: now,
      },
      {
        id: 'loc-en-ca',
        code: 'en-CA',
        label: 'English (Canada)',
        region: 'NA-EAST',
        complianceRules: ['COR', 'CSA', 'ISO'],
        trainingModules: 22,
        active: true,
        timestamp: now,
      },
      {
        id: 'loc-fr-ca',
        code: 'fr-CA',
        label: 'Français (Canada)',
        region: 'NA-EAST',
        complianceRules: ['COR', 'CSA'],
        trainingModules: 18,
        active: true,
        timestamp: now,
      },
      {
        id: 'loc-en-gb',
        code: 'en-GB',
        label: 'English (UK)',
        region: 'EU-WEST',
        complianceRules: ['ISO', 'EU'],
        trainingModules: 20,
        active: true,
        timestamp: now,
      },
      {
        id: 'loc-de-de',
        code: 'de-DE',
        label: 'Deutsch',
        region: 'EU-CENTRAL',
        complianceRules: ['ISO', 'EU'],
        trainingModules: 16,
        active: true,
        timestamp: now,
      },
      {
        id: 'loc-es-mx',
        code: 'es-MX',
        label: 'Español (MX)',
        region: 'LATAM',
        complianceRules: ['ISO'],
        trainingModules: 14,
        active: false,
        timestamp: now,
      },
      {
        id: 'loc-ja-jp',
        code: 'ja-JP',
        label: '日本語',
        region: 'APAC',
        complianceRules: ['ISO'],
        trainingModules: 12,
        active: true,
        timestamp: now,
      },
    ];

    this.compliance = [
      {
        id: 'cmp-osha',
        framework: 'OSHA',
        region: 'NA-EAST',
        title: 'OSHA document templates',
        templateCount: 42,
        aligned: true,
        timestamp: now,
        tenantId,
      },
      {
        id: 'cmp-cor',
        framework: 'COR',
        region: 'NA-EAST',
        title: 'COR regional alignment',
        templateCount: 28,
        aligned: true,
        timestamp: now,
        tenantId,
      },
      {
        id: 'cmp-iso',
        framework: 'ISO',
        region: 'EU-CENTRAL',
        title: 'ISO 45001 pack',
        templateCount: 36,
        aligned: true,
        timestamp: now,
        tenantId,
      },
      {
        id: 'cmp-csa',
        framework: 'CSA',
        region: 'NA-EAST',
        title: 'CSA standards pack',
        templateCount: 19,
        aligned: false,
        timestamp: now,
        tenantId,
      },
      {
        id: 'cmp-eu',
        framework: 'EU',
        region: 'EU-WEST',
        title: 'EU directives pack',
        templateCount: 31,
        aligned: true,
        timestamp: now,
        tenantId,
      },
    ];

    this.rollout = [
      {
        id: 'ro-pilot',
        phase: 'pilot',
        title: 'Phase 1 · Pilot deployment',
        region: 'NA-EAST',
        progress: 100,
        status: 'complete',
        timestamp: now,
        tenantId,
      },
      {
        id: 'ro-regional',
        phase: 'regional',
        title: 'Phase 2 · Regional rollout',
        region: 'EU-CENTRAL',
        progress: 68,
        status: 'in_progress',
        timestamp: now,
        tenantId,
      },
      {
        id: 'ro-global',
        phase: 'global',
        title: 'Phase 3 · Global rollout',
        region: 'APAC',
        progress: 22,
        status: 'planned',
        timestamp: now,
        tenantId,
      },
    ];

    this.tickets = [
      {
        id: 'tkt-1',
        region: 'APAC',
        center: 'Singapore Support Forge',
        title: 'Auto-scale thrash on ap-southeast-1',
        critical: true,
        open: true,
        timestamp: now,
        tenantId,
      },
      {
        id: 'tkt-2',
        region: 'EU-CENTRAL',
        center: 'Frankfurt Support Forge',
        title: 'Locale pack sync lag de-DE',
        critical: false,
        open: true,
        timestamp: now,
        tenantId,
      },
      {
        id: 'tkt-3',
        region: 'NA-EAST',
        center: 'Virginia Support Forge',
        title: 'Tenant router warm pool expand',
        critical: false,
        open: false,
        timestamp: now,
        tenantId,
      },
      {
        id: 'tkt-4',
        region: 'LATAM',
        center: 'São Paulo Support Forge',
        title: 'es-MX training module publish blocked',
        critical: true,
        open: true,
        timestamp: now,
        tenantId,
      },
    ];

    this.kpis = [
      {
        id: 'kpi-uptime',
        label: 'Global uptime',
        region: 'GLOBAL',
        value: 99,
        series: [98, 99, 99, 98, 99, 99, 99],
        critical: false,
        timestamp: now,
        tenantId,
      },
      {
        id: 'kpi-latency',
        label: 'P95 latency index',
        region: 'GLOBAL',
        value: 72,
        series: [60, 62, 65, 68, 70, 71, 72],
        critical: false,
        timestamp: now,
        tenantId,
      },
      {
        id: 'kpi-error',
        label: 'Error budget burn',
        region: 'APAC',
        value: 78,
        series: [40, 48, 55, 62, 68, 74, 78],
        critical: true,
        timestamp: now,
        tenantId,
      },
      {
        id: 'kpi-tenants',
        label: 'Active tenants',
        region: 'GLOBAL',
        value: 86,
        series: [70, 74, 78, 80, 82, 84, 86],
        critical: false,
        timestamp: now,
        tenantId,
      },
    ];

    this.records = [
      {
        id: 'dep-infra-1',
        section: 'infrastructure',
        title: 'Multi-region host mesh',
        summary: 'Tenant-aware routing + LB + auto-scale + DR mirrors',
        region: 'NA-EAST',
        tenantId,
        status: 'healthy',
        progress: 88,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'dep-loc-1',
        section: 'localization',
        title: 'Language pack rollout',
        summary: 'Regional compliance rules + local training modules',
        region: 'EU-CENTRAL',
        tenantId,
        status: 'in_progress',
        progress: 74,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'dep-cmp-1',
        section: 'compliance',
        title: 'Framework alignment',
        summary: 'OSHA · COR · ISO · CSA · EU directives',
        region: 'NA-EAST',
        tenantId,
        status: 'healthy',
        progress: 82,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'dep-ro-1',
        section: 'rollout',
        title: 'Phased global rollout',
        summary: 'Pilot → Regional → Global',
        region: 'EU-CENTRAL',
        tenantId,
        status: 'in_progress',
        progress: 63,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'dep-tr-1',
        section: 'training',
        title: 'Localized training deploy',
        summary: 'Regional certification paths live',
        region: 'NA-WEST',
        tenantId,
        status: 'healthy',
        progress: 79,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'dep-sup-1',
        section: 'support',
        title: 'Regional support centers',
        summary: 'Critical tickets glowing red',
        region: 'APAC',
        tenantId,
        status: 'critical',
        progress: 55,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'dep-mon-1',
        section: 'monitoring',
        title: 'Global observability',
        summary: 'Steel-grey charts · red KPI highlights',
        region: 'NA-EAST',
        tenantId,
        status: 'degraded',
        progress: 71,
        timestamp: now,
        userId: 1,
      },
    ];
  }

  overview() {
    return {
      sections: SECTIONS,
      records: this.records,
      infrastructure: this.infra,
      localization: this.locales,
      compliance: this.compliance,
      rollout: this.rollout,
      support: this.tickets,
      monitoring: this.kpis,
      analytics: this.analytics(null),
    };
  }

  listBySection(section: DeploymentSection) {
    return this.records.filter((r) => r.section === section);
  }

  get(id: string) {
    const row = this.records.find((r) => r.id === id);
    if (!row) throw new NotFoundException(`Deployment ${id} not found`);
    return row;
  }

  advanceRollout(phase: RolloutPhase, userId: number, tenantId = 'tenant-forge-global') {
    const milestone = this.rollout.find((r) => r.phase === phase);
    if (!milestone) throw new NotFoundException(`Rollout phase ${phase} not found`);
    const progress = clamp(milestone.progress + 8 + Math.floor(Math.random() * 10));
    const status: DeploymentStatus =
      progress >= 100
        ? 'complete'
        : progress >= 70
          ? 'healthy'
          : progress >= 40
            ? 'in_progress'
            : 'planned';
    const updated: RolloutMilestone = {
      ...milestone,
      progress,
      status,
      timestamp: new Date().toISOString(),
      tenantId,
    };
    this.rollout = this.rollout.map((r) => (r.phase === phase ? updated : r));

    const record: DeploymentRecord = {
      id: `dep-${this.seq++}`,
      section: 'rollout',
      title: `Advance ${phase}`,
      summary: `Rollout ${phase} → ${progress}%`,
      region: updated.region,
      tenantId,
      status,
      progress,
      timestamp: updated.timestamp,
      userId,
      meta: { phase },
    };
    this.records = [record, ...this.records];

    if (phase === 'global' && progress < 30) {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL DEPLOYMENT ISSUE',
        message: `${updated.title} at ${progress}% · region ${updated.region} · tenant ${tenantId}`,
        forgeStatus: 'failed',
      });
    }

    return { milestone: updated, record, analytics: this.analytics(userId) };
  }

  toggleLocale(id: string, userId: number, tenantId = 'tenant-forge-global') {
    const locale = this.locales.find((l) => l.id === id);
    if (!locale) throw new NotFoundException(`Locale ${id} not found`);
    const updated = {
      ...locale,
      active: !locale.active,
      timestamp: new Date().toISOString(),
    };
    this.locales = this.locales.map((l) => (l.id === id ? updated : l));
    const record: DeploymentRecord = {
      id: `dep-${this.seq++}`,
      section: 'localization',
      title: `${updated.label} ${updated.active ? 'activated' : 'paused'}`,
      summary: `Locale ${updated.code} · region ${updated.region}`,
      region: updated.region,
      tenantId,
      status: updated.active ? 'healthy' : 'planned',
      progress: updated.active ? 100 : 0,
      timestamp: updated.timestamp,
      userId,
      meta: { localeId: id, code: updated.code },
    };
    this.records = [record, ...this.records];
    return { locale: updated, record, analytics: this.analytics(userId) };
  }

  scaleRegion(region: RegionCode, userId: number, tenantId = 'tenant-forge-global') {
    const nodes = this.infra.filter((n) => n.region === region);
    if (nodes.length === 0) throw new NotFoundException(`No infra in ${region}`);
    this.infra = this.infra.map((n) => {
      if (n.region !== region) return n;
      const load = clamp(n.load - 12 - Math.floor(Math.random() * 8));
      return {
        ...n,
        load,
        healthy: load < 85,
        timestamp: new Date().toISOString(),
      };
    });
    const unhealthy = this.infra.filter((n) => n.region === region && !n.healthy).length;
    const record: DeploymentRecord = {
      id: `dep-${this.seq++}`,
      section: 'infrastructure',
      title: `Scale ${region}`,
      summary: `Auto-scale + load shed · unhealthy nodes ${unhealthy}`,
      region,
      tenantId,
      status: unhealthy > 0 ? 'critical' : 'healthy',
      progress: clamp(100 - unhealthy * 20),
      timestamp: new Date().toISOString(),
      userId,
    };
    this.records = [record, ...this.records];
    if (unhealthy > 0) {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL DEPLOYMENT ISSUE',
        message: `Region ${region} still degraded after scale · tenant ${tenantId}`,
        forgeStatus: 'failed',
      });
    }
    return {
      infrastructure: this.infra.filter((n) => n.region === region),
      record,
      analytics: this.analytics(userId),
    };
  }

  resolveTicket(id: string, userId: number) {
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    const updated = {
      ...ticket,
      open: false,
      critical: false,
      timestamp: new Date().toISOString(),
    };
    this.tickets = this.tickets.map((t) => (t.id === id ? updated : t));
    const record: DeploymentRecord = {
      id: `dep-${this.seq++}`,
      section: 'support',
      title: `Resolved · ${ticket.title}`,
      summary: `${ticket.center} · ${ticket.region}`,
      region: ticket.region,
      tenantId: ticket.tenantId,
      status: 'healthy',
      progress: 100,
      timestamp: updated.timestamp,
      userId,
    };
    this.records = [record, ...this.records];
    return { ticket: updated, record, analytics: this.analytics(userId) };
  }

  refreshMonitoring(userId: number, tenantId = 'tenant-forge-global') {
    this.kpis = this.kpis.map((k) => {
      const delta = Math.floor(Math.random() * 9) - 3;
      const value = clamp(k.value + delta);
      return {
        ...k,
        value,
        series: [...k.series.slice(1), value],
        critical: k.id === 'kpi-error' ? value >= 70 : value < 90 && k.id === 'kpi-uptime',
        timestamp: new Date().toISOString(),
        tenantId,
      };
    });
    const critical = this.kpis.filter((k) => k.critical).length;
    if (critical > 0) {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL DEPLOYMENT ISSUE',
        message: `${critical} monitoring KPI(s) critical · tenant ${tenantId}`,
        forgeStatus: 'failed',
      });
    }
    return { monitoring: this.kpis, analytics: this.analytics(userId) };
  }

  analytics(userId: number | null): DeploymentAnalytics {
    const sectionCounts = SECTIONS.reduce(
      (acc, s) => {
        acc[s] = 0;
        return acc;
      },
      {} as Record<DeploymentSection, number>,
    );
    for (const r of this.records) sectionCounts[r.section] += 1;

    const criticalCount =
      this.records.filter((r) => r.status === 'critical').length +
      this.tickets.filter((t) => t.critical && t.open).length +
      this.kpis.filter((k) => k.critical).length +
      this.infra.filter((n) => !n.healthy).length;

    const healthyRegions = new Set(
      this.infra.filter((n) => n.healthy).map((n) => n.region),
    ).size;
    const activeLocales = this.locales.filter((l) => l.active).length;
    const rolloutProgress = clamp(
      this.rollout.reduce((s, r) => s + r.progress, 0) / Math.max(1, this.rollout.length),
    );
    const openCriticalTickets = this.tickets.filter((t) => t.critical && t.open).length;
    const globalReadinessScore = clamp(
      100 -
        criticalCount * 6 -
        openCriticalTickets * 8 +
        rolloutProgress * 0.25 +
        activeLocales * 2,
    );

    return {
      totalRecords: this.records.length,
      criticalCount,
      healthyRegions,
      activeLocales,
      rolloutProgress,
      openCriticalTickets,
      globalReadinessScore,
      sectionCounts,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}
