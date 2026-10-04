import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type TwinLayer =
  | 'site'
  | 'hazard'
  | 'equipment'
  | 'workforce'
  | 'incident'
  | 'risk'
  | 'control'
  | 'dashboard';

export type TwinEntityStatus = 'normal' | 'watch' | 'critical' | 'offline';

export type TwinEvent = {
  id: string;
  type: TwinLayer;
  title: string;
  message: string;
  siteId: string;
  hazardId: string | null;
  critical: boolean;
  timestamp: string;
  userId: number;
};

export type SiteZone = {
  id: string;
  siteId: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  critical: boolean;
  hazardDensity: number;
};

export type HazardNode = {
  id: string;
  siteId: string;
  zoneId: string;
  label: string;
  density: number;
  x: number;
  y: number;
  active: boolean;
  timestamp: string;
};

export type EquipmentNode = {
  id: string;
  siteId: string;
  label: string;
  status: TwinEntityStatus;
  inspectionDue: boolean;
  defectScore: number;
  x: number;
  y: number;
  timestamp: string;
};

export type WorkerNode = {
  id: string;
  siteId: string;
  label: string;
  readiness: number;
  missingTraining: boolean;
  missingVerification: boolean;
  x: number;
  y: number;
  pathTo: string | null;
  timestamp: string;
};

export type ControlNode = {
  id: string;
  siteId: string;
  label: string;
  effectiveness: number;
  linkedHazardId: string;
  timestamp: string;
};

export type RiskCell = {
  id: string;
  siteId: string;
  label: string;
  likelihood: number;
  severity: number;
  score: number;
  predicted: boolean;
};

export type TwinAnalytics = {
  siteId: string;
  zoneCount: number;
  activeHazards: number;
  criticalEquipment: number;
  lowReadinessWorkers: number;
  ineffectiveControls: number;
  predictedHighRisk: number;
  twinHealthScore: number;
  eventCount: number;
  criticalEvents: number;
  timestamp: string;
  userId: number | null;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

@Injectable()
export class SafetyDigitalTwinService {
  private eventSeq = 1;
  private simSeq = 1;
  private readonly siteId = 'site-forge-alpha';
  private zones: SiteZone[] = [];
  private hazards: HazardNode[] = [];
  private equipment: EquipmentNode[] = [];
  private workers: WorkerNode[] = [];
  private controls: ControlNode[] = [];
  private risk: RiskCell[] = [];
  private events: TwinEvent[] = [];
  private simulationActive = false;
  private affectedZoneIds: string[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const siteId = this.siteId;

    this.zones = [
      { id: 'z-crane', siteId, label: 'Crane Path', x: 8, y: 12, w: 28, h: 22, critical: true, hazardDensity: 78 },
      { id: 'z-hot', siteId, label: 'Hot Work Bay', x: 42, y: 10, w: 24, h: 20, critical: false, hazardDensity: 44 },
      { id: 'z-conf', siteId, label: 'Confined Space', x: 70, y: 14, w: 22, h: 18, critical: true, hazardDensity: 72 },
      { id: 'z-muster', siteId, label: 'Muster Gate', x: 12, y: 48, w: 20, h: 16, critical: false, hazardDensity: 18 },
      { id: 'z-field', siteId, label: 'Zone 3 Field', x: 40, y: 42, w: 32, h: 24, critical: true, hazardDensity: 66 },
      { id: 'z-crib', siteId, label: 'Tool Crib', x: 76, y: 48, w: 16, h: 18, critical: false, hazardDensity: 22 },
    ];

    this.hazards = [
      { id: 'hz-1', siteId, zoneId: 'z-crane', label: 'Struck-by density', density: 78, x: 18, y: 20, active: true, timestamp: now },
      { id: 'hz-2', siteId, zoneId: 'z-conf', label: 'Atmosphere risk', density: 72, x: 78, y: 22, active: true, timestamp: now },
      { id: 'hz-3', siteId, zoneId: 'z-field', label: 'Trip/fall cluster', density: 66, x: 52, y: 52, active: true, timestamp: now },
      { id: 'hz-4', siteId, zoneId: 'z-hot', label: 'Spark exposure', density: 44, x: 52, y: 18, active: false, timestamp: now },
    ];

    this.equipment = [
      { id: 'eq-crane-04', siteId, label: 'Crane-04', status: 'critical', inspectionDue: true, defectScore: 69, x: 22, y: 24, timestamp: now },
      { id: 'eq-welder-2', siteId, label: 'Welder-2', status: 'normal', inspectionDue: false, defectScore: 18, x: 50, y: 20, timestamp: now },
      { id: 'eq-fork-7', siteId, label: 'Fork-7', status: 'watch', inspectionDue: true, defectScore: 41, x: 48, y: 54, timestamp: now },
      { id: 'eq-gen-1', siteId, label: 'Gen-1', status: 'normal', inspectionDue: false, defectScore: 12, x: 80, y: 54, timestamp: now },
    ];

    this.workers = [
      { id: 'wk-1', siteId, label: 'Crew A', readiness: 88, missingTraining: false, missingVerification: false, x: 16, y: 54, pathTo: 'z-crane', timestamp: now },
      { id: 'wk-2', siteId, label: 'Crew B', readiness: 62, missingTraining: true, missingVerification: false, x: 46, y: 48, pathTo: 'z-field', timestamp: now },
      { id: 'wk-3', siteId, label: 'Crew C', readiness: 54, missingTraining: false, missingVerification: true, x: 74, y: 28, pathTo: 'z-conf', timestamp: now },
      { id: 'wk-4', siteId, label: 'Supervisor', readiness: 94, missingTraining: false, missingVerification: false, x: 30, y: 50, pathTo: null, timestamp: now },
    ];

    this.controls = [
      { id: 'ctl-1', siteId, label: 'Exclusion zone', effectiveness: 82, linkedHazardId: 'hz-1', timestamp: now },
      { id: 'ctl-2', siteId, label: 'Gas monitor', effectiveness: 58, linkedHazardId: 'hz-2', timestamp: now },
      { id: 'ctl-3', siteId, label: 'Housekeeping sweep', effectiveness: 71, linkedHazardId: 'hz-3', timestamp: now },
      { id: 'ctl-4', siteId, label: 'Hot work permit', effectiveness: 90, linkedHazardId: 'hz-4', timestamp: now },
    ];

    this.risk = [
      { id: 'rk-1', siteId, label: 'Crane Path', likelihood: 4, severity: 5, score: 88, predicted: true },
      { id: 'rk-2', siteId, label: 'Confined Space', likelihood: 3, severity: 5, score: 76, predicted: true },
      { id: 'rk-3', siteId, label: 'Hot Work Bay', likelihood: 3, severity: 3, score: 52, predicted: false },
      { id: 'rk-4', siteId, label: 'Zone 3 Field', likelihood: 4, severity: 4, score: 80, predicted: true },
      { id: 'rk-5', siteId, label: 'Muster Gate', likelihood: 2, severity: 2, score: 28, predicted: false },
      { id: 'rk-6', siteId, label: 'Tool Crib', likelihood: 1, severity: 2, score: 18, predicted: false },
    ];
  }

  overview() {
    return {
      siteId: this.siteId,
      layers: [
        'site',
        'hazard',
        'equipment',
        'workforce',
        'incident',
        'risk',
        'control',
        'dashboard',
      ] as TwinLayer[],
      zones: this.zones,
      hazards: this.hazards,
      equipment: this.equipment,
      workers: this.workers,
      controls: this.controls,
      risk: this.risk,
      simulation: {
        active: this.simulationActive,
        affectedZoneIds: this.affectedZoneIds,
      },
      events: this.events.slice(0, 40),
      analytics: this.analytics(null),
    };
  }

  private pushEvent(
    input: Omit<TwinEvent, 'id' | 'timestamp'>,
  ) {
    const event: TwinEvent = {
      ...input,
      id: `te-${this.eventSeq++}`,
      timestamp: new Date().toISOString(),
    };
    this.events = [event, ...this.events].slice(0, 100);
    if (event.critical) {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL DIGITAL TWIN HAZARD',
        message: `${event.title} · site ${event.siteId}${event.hazardId ? ` · hazard ${event.hazardId}` : ''}`,
        forgeStatus: 'failed',
      });
    }
    return event;
  }

  refreshHazards(userId: number) {
    this.hazards = this.hazards.map((h) => {
      const density = clamp(h.density + Math.floor(Math.random() * 15) - 6);
      return {
        ...h,
        density,
        active: density >= 40,
        timestamp: new Date().toISOString(),
      };
    });
    this.zones = this.zones.map((z) => {
      const hz = this.hazards.filter((h) => h.zoneId === z.id);
      const density =
        hz.length === 0
          ? z.hazardDensity
          : clamp(hz.reduce((s, h) => s + h.density, 0) / hz.length);
      return {
        ...z,
        hazardDensity: density,
        critical: density >= 65,
      };
    });
    const critical = this.hazards.filter((h) => h.density >= 70);
    for (const h of critical) {
      this.pushEvent({
        type: 'hazard',
        title: 'Hazard density spike',
        message: `${h.label} at ${h.density}%`,
        siteId: this.siteId,
        hazardId: h.id,
        critical: true,
        userId,
      });
    }
    return {
      hazards: this.hazards,
      zones: this.zones,
      analytics: this.analytics(userId),
    };
  }

  toggleEquipment(id: string, userId: number) {
    const eq = this.equipment.find((e) => e.id === id);
    if (!eq) throw new NotFoundException(`Equipment ${id} not found`);
    const nextStatus: TwinEntityStatus =
      eq.status === 'critical'
        ? 'watch'
        : eq.status === 'watch'
          ? 'normal'
          : 'critical';
    const updated: EquipmentNode = {
      ...eq,
      status: nextStatus,
      inspectionDue: nextStatus !== 'normal',
      defectScore:
        nextStatus === 'critical'
          ? clamp(eq.defectScore + 12)
          : clamp(eq.defectScore - 10),
      timestamp: new Date().toISOString(),
    };
    this.equipment = this.equipment.map((e) => (e.id === id ? updated : e));
    if (updated.status === 'critical') {
      this.pushEvent({
        type: 'equipment',
        title: 'Equipment critical state',
        message: `${updated.label} defect ${updated.defectScore}`,
        siteId: this.siteId,
        hazardId: null,
        critical: true,
        userId,
      });
    }
    return { equipment: updated, analytics: this.analytics(userId) };
  }

  runIncidentSimulation(userId: number, originZoneId = 'z-crane') {
    this.simulationActive = true;
    this.simSeq += 1;
    const origin = this.zones.find((z) => z.id === originZoneId) ?? this.zones[0];
    this.affectedZoneIds = this.zones
      .filter(
        (z) =>
          z.id === origin.id ||
          Math.abs(z.x - origin.x) < 40 ||
          z.critical,
      )
      .map((z) => z.id);

    const hazard =
      this.hazards.find((h) => h.zoneId === origin.id) ?? this.hazards[0];

    const event = this.pushEvent({
      type: 'incident',
      title: 'Incident simulation started',
      message: `Origin ${origin.label} · propagation to ${this.affectedZoneIds.length} zones`,
      siteId: this.siteId,
      hazardId: hazard?.id ?? null,
      critical: true,
      userId,
    });

    return {
      simulation: {
        active: this.simulationActive,
        simId: `sim-${this.simSeq}`,
        originZoneId: origin.id,
        affectedZoneIds: this.affectedZoneIds,
      },
      event,
      analytics: this.analytics(userId),
    };
  }

  clearSimulation(userId: number) {
    this.simulationActive = false;
    this.affectedZoneIds = [];
    this.pushEvent({
      type: 'incident',
      title: 'Incident simulation cleared',
      message: 'Propagation overlay reset',
      siteId: this.siteId,
      hazardId: null,
      critical: false,
      userId,
    });
    return {
      simulation: { active: false, affectedZoneIds: [] },
      analytics: this.analytics(userId),
    };
  }

  boostControl(id: string, userId: number) {
    const ctl = this.controls.find((c) => c.id === id);
    if (!ctl) throw new NotFoundException(`Control ${id} not found`);
    const updated: ControlNode = {
      ...ctl,
      effectiveness: clamp(ctl.effectiveness + 8 + Math.floor(Math.random() * 8)),
      timestamp: new Date().toISOString(),
    };
    this.controls = this.controls.map((c) => (c.id === id ? updated : c));
    return { control: updated, analytics: this.analytics(userId) };
  }

  analytics(userId: number | null): TwinAnalytics {
    const activeHazards = this.hazards.filter((h) => h.active && h.density >= 50)
      .length;
    const criticalEquipment = this.equipment.filter(
      (e) => e.status === 'critical' || e.inspectionDue,
    ).length;
    const lowReadinessWorkers = this.workers.filter(
      (w) => w.readiness < 70 || w.missingTraining || w.missingVerification,
    ).length;
    const ineffectiveControls = this.controls.filter((c) => c.effectiveness < 70)
      .length;
    const predictedHighRisk = this.risk.filter((r) => r.predicted || r.score >= 70)
      .length;
    const criticalEvents = this.events.filter((e) => e.critical).length;
    const twinHealthScore = clamp(
      100 -
        activeHazards * 6 -
        criticalEquipment * 8 -
        lowReadinessWorkers * 5 -
        ineffectiveControls * 4 -
        predictedHighRisk * 3 -
        (this.simulationActive ? 10 : 0),
    );

    return {
      siteId: this.siteId,
      zoneCount: this.zones.length,
      activeHazards,
      criticalEquipment,
      lowReadinessWorkers,
      ineffectiveControls,
      predictedHighRisk,
      twinHealthScore,
      eventCount: this.events.length,
      criticalEvents,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}
