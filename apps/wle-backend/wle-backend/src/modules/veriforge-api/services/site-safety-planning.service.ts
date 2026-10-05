import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type HazardRisk = 'critical' | 'high' | 'moderate' | 'low';
export type ZoneTone = 'high_risk' | 'restricted' | 'neutral' | 'safe';
export type ControlType = 'engineering' | 'administrative' | 'ppe';
export type ControlStatus = 'in_place' | 'missing' | 'partial';
export type WorkerReadiness = 'compliant' | 'missing_training' | 'missing_verification';
export type BriefStatus = 'draft' | 'issued' | 'acknowledged';
export type PermitType = 'hot_work' | 'confined_space' | 'electrical' | 'excavation';
export type PermitStatus = 'active' | 'expired' | 'pending';

export type SitePlan = {
  id: string;
  name: string;
  location: string;
  completeness: number;
  safetyScore: number;
  timestamp: string;
  userId: number;
  siteId: string;
};

export type HazardZone = {
  id: string;
  siteId: string;
  name: string;
  risk: HazardRisk;
  tone: ZoneTone;
  x: number;
  y: number;
  description: string;
  timestamp: string;
  userId: number;
};

export type SafetyControl = {
  id: string;
  siteId: string;
  hazardId: string | null;
  name: string;
  type: ControlType;
  status: ControlStatus;
  timestamp: string;
  userId: number;
};

export type SafeWorkProcedure = {
  id: string;
  siteId: string;
  title: string;
  criticalSteps: string[];
  status: 'active' | 'draft';
  timestamp: string;
  userId: number;
};

export type SiteMapRoute = {
  id: string;
  siteId: string;
  name: string;
  fromZone: string;
  toZone: string;
  restricted: boolean;
  timestamp: string;
  userId: number;
};

export type WorkerAssignment = {
  id: string;
  siteId: string;
  name: string;
  role: string;
  readiness: WorkerReadiness;
  timestamp: string;
  userId: number;
};

export type PreJobBrief = {
  id: string;
  siteId: string;
  jobScope: string;
  hazards: string;
  controls: string;
  roles: string;
  status: BriefStatus;
  timestamp: string;
  userId: number;
};

export type WorkPermit = {
  id: string;
  siteId: string;
  type: PermitType;
  title: string;
  expiresAt: string;
  status: PermitStatus;
  timestamp: string;
  userId: number;
};

export type SiteSafetyAnalytics = {
  siteCount: number;
  hazardDensity: number;
  criticalHazards: number;
  controlCoverage: number;
  missingControls: number;
  workerReadiness: number;
  nonCompliantWorkers: number;
  expiredPermits: number;
  briefAcknowledgement: number;
  averageSafetyScore: number;
  averageCompleteness: number;
  timestamp: string;
  userId: number | null;
};

@Injectable()
export class SiteSafetyPlanningService {
  private siteSeq = 3;
  private hazardSeq = 5;
  private controlSeq = 7;
  private procedureSeq = 4;
  private routeSeq = 4;
  private workerSeq = 5;
  private briefSeq = 3;
  private permitSeq = 5;

  private sites: SitePlan[] = [];
  private hazards: HazardZone[] = [];
  private controls: SafetyControl[] = [];
  private procedures: SafeWorkProcedure[] = [];
  private routes: SiteMapRoute[] = [];
  private workers: WorkerAssignment[] = [];
  private briefs: PreJobBrief[] = [];
  private permits: WorkPermit[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.sites = [
      {
        id: 'site-1',
        name: 'Forge Yard Alpha',
        location: 'Bay 1–4',
        completeness: 72,
        safetyScore: 68,
        timestamp: now,
        userId: 1,
        siteId: 'site-1',
      },
      {
        id: 'site-2',
        name: 'Mill Line West',
        location: 'West Corridor',
        completeness: 54,
        safetyScore: 61,
        timestamp: now,
        userId: 1,
        siteId: 'site-2',
      },
    ];

    this.hazards = [
      {
        id: 'hz-1',
        siteId: 'site-1',
        name: 'Hot Work Zone A',
        risk: 'critical',
        tone: 'high_risk',
        x: 22,
        y: 30,
        description: 'Open flame and molten splash risk',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'hz-2',
        siteId: 'site-1',
        name: 'Crane Path',
        risk: 'high',
        tone: 'restricted',
        x: 58,
        y: 48,
        description: 'Overhead lift corridor',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'hz-3',
        siteId: 'site-1',
        name: 'Staging Pad',
        risk: 'low',
        tone: 'neutral',
        x: 78,
        y: 72,
        description: 'Material staging',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'hz-4',
        siteId: 'site-2',
        name: 'Confined Pit',
        risk: 'critical',
        tone: 'high_risk',
        x: 35,
        y: 55,
        description: 'Atmospheric hazard',
        timestamp: now,
        userId: 1,
      },
    ];

    this.controls = [
      {
        id: 'ctl-1',
        siteId: 'site-1',
        hazardId: 'hz-1',
        name: 'Spark screens',
        type: 'engineering',
        status: 'in_place',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ctl-2',
        siteId: 'site-1',
        hazardId: 'hz-1',
        name: 'Hot work watch',
        type: 'administrative',
        status: 'partial',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ctl-3',
        siteId: 'site-1',
        hazardId: 'hz-1',
        name: 'FR clothing + face shield',
        type: 'ppe',
        status: 'in_place',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ctl-4',
        siteId: 'site-1',
        hazardId: 'hz-2',
        name: 'Exclusion zone barriers',
        type: 'engineering',
        status: 'missing',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ctl-5',
        siteId: 'site-2',
        hazardId: 'hz-4',
        name: 'Gas monitoring',
        type: 'engineering',
        status: 'missing',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ctl-6',
        siteId: 'site-2',
        hazardId: 'hz-4',
        name: 'Entry attendant',
        type: 'administrative',
        status: 'in_place',
        timestamp: now,
        userId: 1,
      },
    ];

    this.procedures = [
      {
        id: 'swp-1',
        siteId: 'site-1',
        title: 'Hot Work SWP',
        criticalSteps: [
          'Isolate combustibles',
          'Issue permit',
          'Post fire watch',
          'Verify extinguisher',
        ],
        status: 'active',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'swp-2',
        siteId: 'site-1',
        title: 'Crane Lift SWP',
        criticalSteps: ['Inspect rigging', 'Clear path', 'Signal protocol'],
        status: 'active',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'swp-3',
        siteId: 'site-2',
        title: 'Confined Space Entry',
        criticalSteps: [
          'Atmosphere test',
          'Lockout energy',
          'Rescue plan ready',
        ],
        status: 'draft',
        timestamp: now,
        userId: 1,
      },
    ];

    this.routes = [
      {
        id: 'rt-1',
        siteId: 'site-1',
        name: 'Primary egress',
        fromZone: 'Hot Work Zone A',
        toZone: 'Muster North',
        restricted: false,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'rt-2',
        siteId: 'site-1',
        name: 'Crane underpass',
        fromZone: 'Staging Pad',
        toZone: 'Bay 3',
        restricted: true,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'rt-3',
        siteId: 'site-2',
        name: 'Pit access',
        fromZone: 'Confined Pit',
        toZone: 'Rescue Cache',
        restricted: true,
        timestamp: now,
        userId: 1,
      },
    ];

    this.workers = [
      {
        id: 'wk-1',
        siteId: 'site-1',
        name: 'M. Reyes',
        role: 'Welder',
        readiness: 'compliant',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'wk-2',
        siteId: 'site-1',
        name: 'J. Okonkwo',
        role: 'Rigger',
        readiness: 'missing_verification',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'wk-3',
        siteId: 'site-1',
        name: 'A. Chen',
        role: 'Fire Watch',
        readiness: 'compliant',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'wk-4',
        siteId: 'site-2',
        name: 'S. Patel',
        role: 'Entrant',
        readiness: 'missing_training',
        timestamp: now,
        userId: 1,
      },
    ];

    this.briefs = [
      {
        id: 'br-1',
        siteId: 'site-1',
        jobScope: 'Replace furnace door seals',
        hazards: 'Heat, sparks, pinch points',
        controls: 'Screens, FR PPE, LOTO',
        roles: 'Welder, Fire Watch, Supervisor',
        status: 'issued',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'br-2',
        siteId: 'site-2',
        jobScope: 'Pit pump service',
        hazards: 'Atmosphere, engulfment',
        controls: 'Gas monitor, attendant, rescue',
        roles: 'Entrant, Attendant, Rescue',
        status: 'draft',
        timestamp: now,
        userId: 1,
      },
    ];

    this.permits = [
      {
        id: 'pm-1',
        siteId: 'site-1',
        type: 'hot_work',
        title: 'Furnace door hot work',
        expiresAt: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        status: 'active',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'pm-2',
        siteId: 'site-2',
        type: 'confined_space',
        title: 'Pit entry permit',
        expiresAt: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
        status: 'expired',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'pm-3',
        siteId: 'site-1',
        type: 'electrical',
        title: 'Panel isolation',
        expiresAt: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        status: 'active',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'pm-4',
        siteId: 'site-2',
        type: 'excavation',
        title: 'Trench shore check',
        expiresAt: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
        status: 'pending',
        timestamp: now,
        userId: 1,
      },
    ];

    this.refreshSiteScores();
    for (const h of this.hazards) {
      if (h.risk === 'critical') this.notifyCriticalHazard(h);
    }
    for (const p of this.permits) {
      if (p.status === 'expired') this.notifyExpiredPermit(p);
    }
  }

  overview() {
    return {
      sites: this.sites,
      hazards: this.hazards,
      controls: this.controls,
      procedures: this.procedures,
      routes: this.routes,
      workers: this.workers,
      briefs: this.briefs,
      permits: this.permits,
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): SiteSafetyAnalytics {
    const criticalHazards = this.hazards.filter((h) => h.risk === 'critical').length;
    const missingControls = this.controls.filter((c) => c.status === 'missing').length;
    const controlCoverage =
      this.controls.length === 0
        ? 0
        : Math.round(
            (this.controls.filter((c) => c.status === 'in_place').length /
              this.controls.length) *
              100,
          );
    const nonCompliantWorkers = this.workers.filter(
      (w) => w.readiness !== 'compliant',
    ).length;
    const workerReadiness =
      this.workers.length === 0
        ? 0
        : Math.round(
            ((this.workers.length - nonCompliantWorkers) / this.workers.length) *
              100,
          );
    const acknowledged = this.briefs.filter((b) => b.status === 'acknowledged').length;
    return {
      siteCount: this.sites.length,
      hazardDensity:
        this.sites.length === 0
          ? 0
          : Math.round((this.hazards.length / this.sites.length) * 10) / 10,
      criticalHazards,
      controlCoverage,
      missingControls,
      workerReadiness,
      nonCompliantWorkers,
      expiredPermits: this.permits.filter((p) => p.status === 'expired').length,
      briefAcknowledgement:
        this.briefs.length === 0
          ? 0
          : Math.round((acknowledged / this.briefs.length) * 100),
      averageSafetyScore:
        this.sites.length === 0
          ? 0
          : Math.round(
              this.sites.reduce((s, x) => s + x.safetyScore, 0) / this.sites.length,
            ),
      averageCompleteness:
        this.sites.length === 0
          ? 0
          : Math.round(
              this.sites.reduce((s, x) => s + x.completeness, 0) /
                this.sites.length,
            ),
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  private getSite(siteId: string) {
    const site = this.sites.find((s) => s.id === siteId || s.siteId === siteId);
    if (!site) throw new NotFoundException(`Site ${siteId} not found`);
    return site;
  }

  createSite(
    input: { name: string; location: string },
    userId: number,
  ): SitePlan {
    const id = `site-${this.siteSeq++}`;
    const site: SitePlan = {
      id,
      siteId: id,
      name: input.name,
      location: input.location,
      completeness: 20,
      safetyScore: 50,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.sites.unshift(site);
    this.refreshSiteScores();
    return site;
  }

  addHazard(
    input: {
      siteId: string;
      name: string;
      risk: HazardRisk;
      description: string;
      x?: number;
      y?: number;
    },
    userId: number,
  ) {
    this.getSite(input.siteId);
    const tone: ZoneTone =
      input.risk === 'critical' || input.risk === 'high'
        ? 'high_risk'
        : input.risk === 'moderate'
          ? 'restricted'
          : 'neutral';
    const hazard: HazardZone = {
      id: `hz-${this.hazardSeq++}`,
      siteId: input.siteId,
      name: input.name,
      risk: input.risk,
      tone,
      x: input.x ?? 40 + Math.round(Math.random() * 40),
      y: input.y ?? 30 + Math.round(Math.random() * 40),
      description: input.description,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.hazards.unshift(hazard);
    if (hazard.risk === 'critical') this.notifyCriticalHazard(hazard);
    this.refreshSiteScores();
    return hazard;
  }

  addControl(
    input: {
      siteId: string;
      hazardId?: string | null;
      name: string;
      type: ControlType;
      status?: ControlStatus;
    },
    userId: number,
  ) {
    this.getSite(input.siteId);
    const control: SafetyControl = {
      id: `ctl-${this.controlSeq++}`,
      siteId: input.siteId,
      hazardId: input.hazardId ?? null,
      name: input.name,
      type: input.type,
      status: input.status ?? 'in_place',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.controls.unshift(control);
    this.refreshSiteScores();
    return control;
  }

  setControlStatus(controlId: string, status: ControlStatus, userId: number) {
    const control = this.controls.find((c) => c.id === controlId);
    if (!control) throw new NotFoundException(`Control ${controlId} not found`);
    control.status = status;
    control.userId = userId;
    control.timestamp = new Date().toISOString();
    this.refreshSiteScores();
    return control;
  }

  addProcedure(
    input: {
      siteId: string;
      title: string;
      criticalSteps: string[];
    },
    userId: number,
  ) {
    this.getSite(input.siteId);
    const procedure: SafeWorkProcedure = {
      id: `swp-${this.procedureSeq++}`,
      siteId: input.siteId,
      title: input.title,
      criticalSteps: input.criticalSteps,
      status: 'active',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.procedures.unshift(procedure);
    this.refreshSiteScores();
    return procedure;
  }

  addRoute(
    input: {
      siteId: string;
      name: string;
      fromZone: string;
      toZone: string;
      restricted?: boolean;
    },
    userId: number,
  ) {
    this.getSite(input.siteId);
    const route: SiteMapRoute = {
      id: `rt-${this.routeSeq++}`,
      siteId: input.siteId,
      name: input.name,
      fromZone: input.fromZone,
      toZone: input.toZone,
      restricted: Boolean(input.restricted),
      timestamp: new Date().toISOString(),
      userId,
    };
    this.routes.unshift(route);
    this.refreshSiteScores();
    return route;
  }

  assignWorker(
    input: {
      siteId: string;
      name: string;
      role: string;
      readiness?: WorkerReadiness;
    },
    userId: number,
  ) {
    this.getSite(input.siteId);
    const worker: WorkerAssignment = {
      id: `wk-${this.workerSeq++}`,
      siteId: input.siteId,
      name: input.name,
      role: input.role,
      readiness: input.readiness ?? 'compliant',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.workers.unshift(worker);
    this.refreshSiteScores();
    return worker;
  }

  createBrief(
    input: {
      siteId: string;
      jobScope: string;
      hazards: string;
      controls: string;
      roles: string;
    },
    userId: number,
  ) {
    this.getSite(input.siteId);
    const brief: PreJobBrief = {
      id: `br-${this.briefSeq++}`,
      siteId: input.siteId,
      jobScope: input.jobScope,
      hazards: input.hazards,
      controls: input.controls,
      roles: input.roles,
      status: 'issued',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.briefs.unshift(brief);
    this.refreshSiteScores();
    return brief;
  }

  acknowledgeBrief(briefId: string, userId: number) {
    const brief = this.briefs.find((b) => b.id === briefId);
    if (!brief) throw new NotFoundException(`Brief ${briefId} not found`);
    brief.status = 'acknowledged';
    brief.userId = userId;
    brief.timestamp = new Date().toISOString();
    this.refreshSiteScores();
    return brief;
  }

  issuePermit(
    input: {
      siteId: string;
      type: PermitType;
      title: string;
      expiresAt: string;
    },
    userId: number,
  ) {
    this.getSite(input.siteId);
    const expired = new Date(input.expiresAt).getTime() < Date.now();
    const permit: WorkPermit = {
      id: `pm-${this.permitSeq++}`,
      siteId: input.siteId,
      type: input.type,
      title: input.title,
      expiresAt: input.expiresAt,
      status: expired ? 'expired' : 'active',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.permits.unshift(permit);
    if (permit.status === 'expired') this.notifyExpiredPermit(permit);
    this.refreshSiteScores();
    return permit;
  }

  private refreshSiteScores() {
    for (const site of this.sites) {
      const siteHazards = this.hazards.filter((h) => h.siteId === site.siteId);
      const siteControls = this.controls.filter((c) => c.siteId === site.siteId);
      const siteWorkers = this.workers.filter((w) => w.siteId === site.siteId);
      const siteBriefs = this.briefs.filter((b) => b.siteId === site.siteId);
      const sitePermits = this.permits.filter((p) => p.siteId === site.siteId);
      const siteProcedures = this.procedures.filter((p) => p.siteId === site.siteId);
      const siteRoutes = this.routes.filter((r) => r.siteId === site.siteId);

      const controlCoverage =
        siteControls.length === 0
          ? 40
          : Math.round(
              (siteControls.filter((c) => c.status === 'in_place').length /
                siteControls.length) *
                100,
            );
      const workerReady =
        siteWorkers.length === 0
          ? 50
          : Math.round(
              (siteWorkers.filter((w) => w.readiness === 'compliant').length /
                siteWorkers.length) *
                100,
            );
      const briefReady =
        siteBriefs.length === 0
          ? 40
          : Math.round(
              (siteBriefs.filter((b) => b.status === 'acknowledged').length /
                siteBriefs.length) *
                100,
            );
      const permitReady =
        sitePermits.length === 0
          ? 50
          : Math.round(
              (sitePermits.filter((p) => p.status === 'active').length /
                sitePermits.length) *
                100,
            );
      const criticalPenalty =
        siteHazards.filter((h) => h.risk === 'critical').length * 8;
      const missingPenalty =
        siteControls.filter((c) => c.status === 'missing').length * 6;

      site.completeness = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (Math.min(siteHazards.length, 4) / 4) * 20 +
              (Math.min(siteControls.length, 4) / 4) * 20 +
              (Math.min(siteProcedures.length, 2) / 2) * 15 +
              (Math.min(siteRoutes.length, 2) / 2) * 10 +
              (Math.min(siteWorkers.length, 3) / 3) * 15 +
              (Math.min(siteBriefs.length, 1) / 1) * 10 +
              (Math.min(sitePermits.length, 1) / 1) * 10,
          ),
        ),
      );
      site.safetyScore = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            controlCoverage * 0.35 +
              workerReady * 0.25 +
              briefReady * 0.15 +
              permitReady * 0.15 +
              site.completeness * 0.1 -
              criticalPenalty -
              missingPenalty,
          ),
        ),
      );
      site.timestamp = new Date().toISOString();
    }
  }

  private notifyCriticalHazard(hazard: HazardZone) {
    const site = this.sites.find((s) => s.siteId === hazard.siteId);
    this.notifications.enqueue({
      title: 'CRITICAL SITE HAZARD',
      message: `${hazard.name} on ${site?.name ?? hazard.siteId}: ${hazard.description}`,
      category: 'compliance',
      forgeStatus: 'failed',
    });
  }

  private notifyExpiredPermit(permit: WorkPermit) {
    const site = this.sites.find((s) => s.siteId === permit.siteId);
    this.notifications.enqueue({
      title: 'PERMIT EXPIRED',
      message: `${permit.title} (${permit.type}) for ${site?.name ?? permit.siteId} expired.`,
      category: 'compliance',
      forgeStatus: 'failed',
    });
  }
}
