import { RealtimeIntelligenceEngine } from "../engines/realtime-intelligence";
import { RealtimeRiskEngine } from "../engines/realtime-risk";
import { RealtimeReadinessEngine } from "../engines/realtime-readiness";
import { RealtimeAutomationEngine } from "../engines/realtime-automation";
import { RealtimeTwinEngine } from "../engines/realtime-twin";
import { CommandAgentsEngine } from "../engines/command-agents";
import { CommandAlertingEngine } from "../engines/alerting";
import { OfflineCommandEngine } from "../engines/offline-command";
import { CommandEventEngine } from "../engines/command-events";
import type {
  CommandCenterReport,
  CommandContextInput,
  CommandDashboardBundle,
  MapMarker,
  TimelineEntry,
} from "../types";

/**
 * Vera Real-Time Intelligence Engine (VRTIE) — Command Center orchestrator
 */
export class VeraCommandCenterEngine {
  readonly intelligence = new RealtimeIntelligenceEngine();
  readonly risk = new RealtimeRiskEngine();
  readonly readiness = new RealtimeReadinessEngine();
  readonly automation = new RealtimeAutomationEngine();
  readonly twin = new RealtimeTwinEngine();
  readonly agents = new CommandAgentsEngine();
  readonly alerting = new CommandAlertingEngine();
  readonly offline = new OfflineCommandEngine();
  readonly events = new CommandEventEngine();

  refresh(ctx: CommandContextInput): CommandCenterReport {
    const ingested = this.intelligence.ingest(ctx);
    const risk = this.risk.assess(ctx);
    const riskMap = new Map(risk.map((r) => [`${r.entityType}:${r.entityId}`, r.score.score]));
    const readiness = this.readiness.assess(ctx, riskMap);
    const automation = this.automation.snapshot(ctx, ingested.phases);
    const twins = this.twin.update(ctx, risk, readiness);
    const agents = this.agents.run(ctx, ingested.phases);
    const alerts = this.alerting.generate(ctx, risk, ingested);
    const map = this.buildMap(ctx, risk, ingested.hazards);
    const timeline = this.buildTimeline(ctx, ingested, automation, alerts);

    const dashboard = this.buildDashboard(ctx, risk, readiness, automation, alerts, twins);

    return {
      generatedAt: new Date().toISOString(),
      context: ctx,
      intelligence: {
        anomalies: ingested.anomalies,
        hazards: ingested.hazards,
        conflicts: ingested.conflicts,
        complianceFailures: ingested.complianceFailures,
        operationalFailures: ingested.operationalFailures,
      },
      risk,
      readiness,
      automation,
      twins,
      agents,
      alerts,
      map,
      timeline,
      dashboard,
    };
  }

  refreshOffline(ctx: CommandContextInput): CommandCenterReport {
    this.offline.enqueue(ctx);
    return this.refresh({ ...ctx, offline: true });
  }

  syncOffline(): CommandCenterReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.refresh({ ...item.context, offline: false }))
    );
  }

  onEvent(
    ctx: CommandContextInput,
    event: string,
    data?: Record<string, unknown>
  ): CommandCenterReport {
    return this.refresh(this.events.applyEvent(ctx, event, data));
  }

  private buildMap(
    ctx: CommandContextInput,
    risks: CommandCenterReport["risk"],
    hazards: string[]
  ): MapMarker[] {
    const markers: MapMarker[] = [];
    let i = 0;
    const baseLat = 49.28;
    const baseLng = -123.12;

    for (const e of ctx.entities ?? []) {
      if (e.lat != null && e.lng != null) {
        markers.push({
          id: e.id,
          type: e.type === "project" ? "project" : e.type === "equipment" ? "equipment" : "worker",
          label: e.name,
          lat: e.lat,
          lng: e.lng,
          riskLevel: risks.find((r) => r.entityId === e.id)?.score.level ?? "low",
        });
      } else {
        markers.push({
          id: e.id,
          type: e.type === "project" ? "project" : e.type === "equipment" ? "equipment" : "worker",
          label: e.name,
          lat: baseLat + i * 0.01,
          lng: baseLng + i * 0.01,
          riskLevel: risks.find((r) => r.entityId === e.id)?.score.level ?? "medium",
        });
        i += 1;
      }
    }

    if (hazards.length) {
      markers.push({
        id: "risk-zone-1",
        type: "risk_zone",
        label: "Elevated hazard zone",
        lat: baseLat + 0.05,
        lng: baseLng + 0.05,
        riskLevel: "high",
      });
    }

    if ((ctx.sifPrecursors ?? 0) > 0) {
      markers.push({
        id: "safety-event-1",
        type: "safety_event",
        label: "SIF precursor zone",
        lat: baseLat - 0.02,
        lng: baseLng + 0.03,
        riskLevel: "critical",
      });
    }

    return markers;
  }

  private buildTimeline(
    ctx: CommandContextInput,
    ingested: ReturnType<RealtimeIntelligenceEngine["ingest"]>,
    automation: CommandCenterReport["automation"],
    alerts: CommandCenterReport["alerts"]
  ): TimelineEntry[] {
    const now = Date.now();
    const entries: TimelineEntry[] = [];
    let idx = 0;

    if (ctx.eventName) {
      entries.push({
        id: `tl-${idx++}`,
        at: new Date(now - 60000).toISOString(),
        category: "event",
        summary: `Event: ${ctx.eventName}`,
      });
    }

    for (const a of alerts.slice(0, 5)) {
      entries.push({
        id: `tl-${idx++}`,
        at: a.at,
        category: "risk",
        summary: `[${a.severity}] ${a.title}`,
      });
    }

    for (const action of automation.recent.slice(0, 5)) {
      entries.push({
        id: `tl-${idx++}`,
        at: new Date(now - idx * 120000).toISOString(),
        category: "automation",
        summary: `${action.title} (${action.status})`,
      });
    }

    for (const h of ingested.hazards.slice(0, 3)) {
      entries.push({
        id: `tl-${idx++}`,
        at: new Date(now - idx * 180000).toISOString(),
        category: "readiness",
        summary: h,
      });
    }

    return entries.sort((a, b) => b.at.localeCompare(a.at));
  }

  private buildDashboard(
    ctx: CommandContextInput,
    risk: CommandCenterReport["risk"],
    readiness: CommandCenterReport["readiness"],
    automation: CommandCenterReport["automation"],
    alerts: CommandCenterReport["alerts"],
    twins: CommandCenterReport["twins"]
  ): CommandDashboardBundle {
    const avgRisk =
      risk.length > 0 ? Math.round(risk.reduce((s, r) => s + r.score.score, 0) / risk.length) : 0;
    const avgReady =
      readiness.length > 0
        ? Math.round(readiness.reduce((s, r) => s + (100 - r.score.score), 0) / readiness.length)
        : 0;
    const failures = readiness.reduce((s, r) => s + r.failures.length, 0);

    return {
      generatedAt: new Date().toISOString(),
      risk: { avg: avgRisk, critical: risk.filter((r) => r.score.level === "critical").length },
      readiness: { avg: avgReady, failures },
      compliance: {
        rate: Math.max(0, 100 - (ctx.competencyGaps ?? 0) * 5),
        gaps: ctx.competencyGaps ?? 0,
      },
      staffing: { shortages: ctx.dispatchConflicts ?? 0 },
      equipment: {
        lockouts: ctx.inspectionFailures ?? 0,
        downtime: ctx.inspectionFailures ?? 0,
      },
      safety: {
        sifAlerts: ctx.sifPrecursors ?? 0,
        hecaAlerts: ctx.hecaDeviations ?? 0,
        energyAlerts: ctx.energyConflicts ?? 0,
      },
      automation,
      documents: { pending: 0, fraud: ctx.documentFraud ?? 0 },
      twins: { updated: twins.length },
    };
  }
}
