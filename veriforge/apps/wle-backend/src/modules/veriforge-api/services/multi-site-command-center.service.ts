import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type RegionCode =
  | 'NA-EAST'
  | 'NA-WEST'
  | 'EU-CENTRAL'
  | 'EU-WEST'
  | 'APAC'
  | 'LATAM';

export type SiteStatus = 'stable' | 'watch' | 'critical' | 'offline';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type CommandSite = {
  id: string;
  name: string;
  region: RegionCode;
  status: SiteStatus;
  readiness: number;
  compliance: number;
  equipmentHealth: number;
  riskScore: number;
  openIncidents: number;
  emergencyActive: boolean;
  musterComplete: number;
  timestamp: string;
};

export type CommandAlert = {
  id: string;
  siteId: string;
  region: RegionCode;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
};

export type CommandIncident = {
  id: string;
  siteId: string;
  region: RegionCode;
  title: string;
  severity: IncidentSeverity;
  status: 'open' | 'investigating' | 'contained' | 'closed';
  timestamp: string;
};

export type CommandAnalytics = {
  totalSites: number;
  criticalSites: number;
  openIncidents: number;
  activeEmergencies: number;
  averageReadiness: number;
  averageCompliance: number;
  averageRisk: number;
  alertCount: number;
  commandHealthScore: number;
  timestamp: string;
  userId: number | null;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

@Injectable()
export class MultiSiteCommandCenterService {
  private alertSeq = 10;
  private incidentSeq = 8;
  private sites: CommandSite[] = [];
  private alerts: CommandAlert[] = [];
  private incidents: CommandIncident[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.sites = [
      {
        id: 'site-alpha',
        name: 'Forge Alpha',
        region: 'NA-EAST',
        status: 'watch',
        readiness: 78,
        compliance: 86,
        equipmentHealth: 72,
        riskScore: 64,
        openIncidents: 2,
        emergencyActive: false,
        musterComplete: 94,
        timestamp: now,
      },
      {
        id: 'site-bravo',
        name: 'Forge Bravo',
        region: 'NA-WEST',
        status: 'stable',
        readiness: 91,
        compliance: 92,
        equipmentHealth: 88,
        riskScore: 38,
        openIncidents: 0,
        emergencyActive: false,
        musterComplete: 100,
        timestamp: now,
      },
      {
        id: 'site-charlie',
        name: 'Forge Charlie',
        region: 'EU-CENTRAL',
        status: 'critical',
        readiness: 62,
        compliance: 71,
        equipmentHealth: 58,
        riskScore: 82,
        openIncidents: 3,
        emergencyActive: true,
        musterComplete: 67,
        timestamp: now,
      },
      {
        id: 'site-delta',
        name: 'Forge Delta',
        region: 'EU-WEST',
        status: 'stable',
        readiness: 85,
        compliance: 88,
        equipmentHealth: 90,
        riskScore: 42,
        openIncidents: 1,
        emergencyActive: false,
        musterComplete: 98,
        timestamp: now,
      },
      {
        id: 'site-echo',
        name: 'Forge Echo',
        region: 'APAC',
        status: 'critical',
        readiness: 55,
        compliance: 64,
        equipmentHealth: 49,
        riskScore: 88,
        openIncidents: 4,
        emergencyActive: true,
        musterComplete: 41,
        timestamp: now,
      },
      {
        id: 'site-foxtrot',
        name: 'Forge Foxtrot',
        region: 'LATAM',
        status: 'watch',
        readiness: 74,
        compliance: 69,
        equipmentHealth: 76,
        riskScore: 58,
        openIncidents: 1,
        emergencyActive: false,
        musterComplete: 82,
        timestamp: now,
      },
    ];

    this.alerts = [
      {
        id: 'al-1',
        siteId: 'site-charlie',
        region: 'EU-CENTRAL',
        title: 'EMERGENCY ACTIVE',
        message: 'Confined space atmosphere alarm — muster incomplete',
        severity: 'emergency',
        timestamp: now,
      },
      {
        id: 'al-2',
        siteId: 'site-echo',
        region: 'APAC',
        title: 'CRITICAL INCIDENT CLUSTER',
        message: '4 open incidents · crane path struck-by risk',
        severity: 'critical',
        timestamp: now,
      },
      {
        id: 'al-3',
        siteId: 'site-alpha',
        region: 'NA-EAST',
        title: 'Equipment overdue',
        message: 'Crane-04 inspection overdue · defect score rising',
        severity: 'warning',
        timestamp: now,
      },
      {
        id: 'al-4',
        siteId: 'site-foxtrot',
        region: 'LATAM',
        title: 'Compliance gap',
        message: 'Document expiry cluster within 10 days',
        severity: 'warning',
        timestamp: now,
      },
      {
        id: 'al-5',
        siteId: 'site-bravo',
        region: 'NA-WEST',
        title: 'Shift readiness nominal',
        message: 'All crews verified · muster 100%',
        severity: 'info',
        timestamp: now,
      },
    ];

    this.incidents = [
      {
        id: 'inc-1',
        siteId: 'site-charlie',
        region: 'EU-CENTRAL',
        title: 'Atmosphere excursion · Bay C',
        severity: 'critical',
        status: 'investigating',
        timestamp: now,
      },
      {
        id: 'inc-2',
        siteId: 'site-echo',
        region: 'APAC',
        title: 'Struck-by near miss · Crane path',
        severity: 'high',
        status: 'open',
        timestamp: now,
      },
      {
        id: 'inc-3',
        siteId: 'site-echo',
        region: 'APAC',
        title: 'Hot work permit breach',
        severity: 'critical',
        status: 'contained',
        timestamp: now,
      },
      {
        id: 'inc-4',
        siteId: 'site-alpha',
        region: 'NA-EAST',
        title: 'Trip/fall · Zone 3',
        severity: 'medium',
        status: 'investigating',
        timestamp: now,
      },
      {
        id: 'inc-5',
        siteId: 'site-foxtrot',
        region: 'LATAM',
        title: 'Contractor access mismatch',
        severity: 'low',
        status: 'open',
        timestamp: now,
      },
    ];
  }

  overview() {
    return {
      features: [
        'Multi-site monitoring',
        'Real-time alerts',
        'Cross-site incident management',
        'Workforce readiness overview',
        'Equipment health monitoring',
        'Compliance status per site',
        'Risk intelligence per region',
        'Emergency coordination',
        'Global KPI dashboards',
      ],
      sites: this.sites,
      alerts: this.alerts,
      incidents: this.incidents,
      analytics: this.analytics(null),
    };
  }

  listSites() {
    return this.sites;
  }

  getSite(id: string) {
    const site = this.sites.find((s) => s.id === id);
    if (!site) throw new NotFoundException(`Site ${id} not found`);
    return site;
  }

  listAlerts() {
    return this.alerts;
  }

  listIncidents() {
    return this.incidents;
  }

  acknowledgeAlert(id: string, userId: number) {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    this.alerts = this.alerts.filter((a) => a.id !== id);
    return { acknowledged: alert, analytics: this.analytics(userId) };
  }

  escalateIncident(id: string, userId: number) {
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    const severity: IncidentSeverity =
      incident.severity === 'low'
        ? 'medium'
        : incident.severity === 'medium'
          ? 'high'
          : 'critical';
    const updated: CommandIncident = {
      ...incident,
      severity,
      status: 'investigating',
      timestamp: new Date().toISOString(),
    };
    this.incidents = this.incidents.map((i) => (i.id === id ? updated : i));

    const alert: CommandAlert = {
      id: `al-${this.alertSeq++}`,
      siteId: updated.siteId,
      region: updated.region,
      title: 'INCIDENT ESCALATED',
      message: `${updated.title} → ${severity}`,
      severity: severity === 'critical' ? 'critical' : 'warning',
      timestamp: updated.timestamp,
    };
    this.alerts = [alert, ...this.alerts];

    if (severity === 'critical') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL COMMAND CENTER EVENT',
        message: `${updated.title} · site ${updated.siteId} · region ${updated.region}`,
        forgeStatus: 'failed',
      });
    }

    return { incident: updated, alert, analytics: this.analytics(userId) };
  }

  refreshSite(id: string, userId: number) {
    const site = this.getSite(id);
    const readiness = clamp(site.readiness + Math.floor(Math.random() * 11) - 4);
    const compliance = clamp(site.compliance + Math.floor(Math.random() * 9) - 3);
    const equipmentHealth = clamp(
      site.equipmentHealth + Math.floor(Math.random() * 11) - 4,
    );
    const riskScore = clamp(site.riskScore + Math.floor(Math.random() * 11) - 4);
    const status: SiteStatus =
      site.emergencyActive || riskScore >= 80 || readiness < 60
        ? 'critical'
        : riskScore >= 60 || compliance < 75
          ? 'watch'
          : 'stable';

    const updated: CommandSite = {
      ...site,
      readiness,
      compliance,
      equipmentHealth,
      riskScore,
      status,
      timestamp: new Date().toISOString(),
    };
    this.sites = this.sites.map((s) => (s.id === id ? updated : s));

    if (status === 'critical') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL COMMAND CENTER EVENT',
        message: `${updated.name} status critical · site ${updated.id} · region ${updated.region}`,
        forgeStatus: 'failed',
      });
      this.alerts = [
        {
          id: `al-${this.alertSeq++}`,
          siteId: updated.id,
          region: updated.region,
          title: 'SITE CRITICAL',
          message: `${updated.name} health degraded after refresh`,
          severity: 'critical',
          timestamp: updated.timestamp,
        },
        ...this.alerts,
      ];
    }

    return { site: updated, analytics: this.analytics(userId) };
  }

  toggleEmergency(id: string, userId: number) {
    const site = this.getSite(id);
    const emergencyActive = !site.emergencyActive;
    const updated: CommandSite = {
      ...site,
      emergencyActive,
      status: emergencyActive ? 'critical' : site.riskScore >= 60 ? 'watch' : 'stable',
      musterComplete: emergencyActive
        ? clamp(site.musterComplete - 20)
        : clamp(site.musterComplete + 15),
      timestamp: new Date().toISOString(),
    };
    this.sites = this.sites.map((s) => (s.id === id ? updated : s));

    if (emergencyActive) {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL COMMAND CENTER EVENT',
        message: `Emergency activated · ${updated.name} · site ${updated.id} · region ${updated.region}`,
        forgeStatus: 'failed',
      });
      this.alerts = [
        {
          id: `al-${this.alertSeq++}`,
          siteId: updated.id,
          region: updated.region,
          title: 'EMERGENCY ACTIVE',
          message: `Emergency coordination opened for ${updated.name}`,
          severity: 'emergency',
          timestamp: updated.timestamp,
        },
        ...this.alerts,
      ];
    }

    return { site: updated, analytics: this.analytics(userId) };
  }

  analytics(userId: number | null): CommandAnalytics {
    const criticalSites = this.sites.filter(
      (s) => s.status === 'critical' || s.emergencyActive,
    ).length;
    const openIncidents = this.incidents.filter((i) => i.status !== 'closed')
      .length;
    const activeEmergencies = this.sites.filter((s) => s.emergencyActive).length;
    const averageReadiness =
      this.sites.length === 0
        ? 0
        : clamp(
            this.sites.reduce((s, x) => s + x.readiness, 0) / this.sites.length,
          );
    const averageCompliance =
      this.sites.length === 0
        ? 0
        : clamp(
            this.sites.reduce((s, x) => s + x.compliance, 0) / this.sites.length,
          );
    const averageRisk =
      this.sites.length === 0
        ? 0
        : clamp(
            this.sites.reduce((s, x) => s + x.riskScore, 0) / this.sites.length,
          );
    const commandHealthScore = clamp(
      100 -
        criticalSites * 10 -
        activeEmergencies * 12 -
        openIncidents * 3 +
        averageReadiness * 0.15 +
        averageCompliance * 0.1,
    );

    return {
      totalSites: this.sites.length,
      criticalSites,
      openIncidents,
      activeEmergencies,
      averageReadiness,
      averageCompliance,
      averageRisk,
      alertCount: this.alerts.length,
      commandHealthScore,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}
