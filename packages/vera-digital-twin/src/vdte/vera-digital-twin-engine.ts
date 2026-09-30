import { StateModelEngine } from "../engines/state-model-engine";
import { RealTimeSyncEngine } from "../engines/sync-engine";
import { PredictiveStateEngine } from "../engines/predictive-state-engine";
import { EventDrivenUpdateEngine } from "../engines/event-update-engine";
import { TwinTimelineEngine } from "../engines/timeline-engine";
import { TwinHistoryEngine } from "../engines/history-engine";
import { OfflineTwinEngine } from "../engines/offline-twin-engine";
import { buildWorkerTwin, type WorkerTwinInput } from "../twins/worker-twin";
import { buildEquipmentTwin, type EquipmentTwinInput } from "../twins/equipment-twin";
import { buildProjectTwin, type ProjectTwinInput } from "../twins/project-twin";
import { buildCompanyTwin, type CompanyTwinInput } from "../twins/company-twin";
import { buildProviderTwin, type ProviderTwinInput } from "../twins/provider-twin";
import { buildUnionHallTwin, type UnionHallTwinInput } from "../twins/union-hall-twin";
import { buildTwinDashboard } from "../twins/dashboard-twins";
import type {
  DigitalTwin,
  TwinDashboardBundle,
  TwinEventPayload,
  TwinType,
} from "../types";

/**
 * Vera Digital Twin Engine (VDTE)
 */
export class VeraDigitalTwinEngine {
  readonly state = new StateModelEngine();
  readonly sync = new RealTimeSyncEngine();
  readonly predictive = new PredictiveStateEngine();
  readonly timeline = new TwinTimelineEngine();
  readonly history = new TwinHistoryEngine();
  readonly offline = new OfflineTwinEngine();
  private readonly events: EventDrivenUpdateEngine;

  constructor() {
    this.events = new EventDrivenUpdateEngine(this.state, this.timeline, this.history);
  }

  createWorker(input: WorkerTwinInput): DigitalTwin {
    const twin = buildWorkerTwin(input);
    this.state.set(twin);
    this.history.record(twin);
    this.sync.publish(twin);
    return twin;
  }

  createEquipment(input: EquipmentTwinInput): DigitalTwin {
    const twin = buildEquipmentTwin(input);
    this.state.set(twin);
    this.history.record(twin);
    this.sync.publish(twin);
    return twin;
  }

  createProject(input: ProjectTwinInput): DigitalTwin {
    const twin = buildProjectTwin(input);
    this.state.set(twin);
    this.history.record(twin);
    this.sync.publish(twin);
    return twin;
  }

  createCompany(input: CompanyTwinInput): DigitalTwin {
    const twin = buildCompanyTwin(input);
    this.state.set(twin);
    this.history.record(twin);
    this.sync.publish(twin);
    return twin;
  }

  createProvider(input: ProviderTwinInput): DigitalTwin {
    const twin = buildProviderTwin(input);
    this.state.set(twin);
    this.history.record(twin);
    this.sync.publish(twin);
    return twin;
  }

  createUnionHall(input: UnionHallTwinInput): DigitalTwin {
    const twin = buildUnionHallTwin(input);
    this.state.set(twin);
    this.history.record(twin);
    this.sync.publish(twin);
    return twin;
  }

  get(type: TwinType, id: string): DigitalTwin | undefined {
    return this.state.get(type, id);
  }

  list(type?: TwinType): DigitalTwin[] {
    return this.state.list(type);
  }

  applyEvent(event: TwinEventPayload): DigitalTwin | undefined {
    const twin = this.state.get(event.entityType, event.entityId);
    if (!twin) return undefined;
    const updated = this.events.apply(twin, event);
    this.sync.publish(updated);
    return updated;
  }

  applyEventOffline(event: TwinEventPayload, clientVersion: number): void {
    this.offline.enqueue(event, clientVersion);
    const twin = this.state.get(event.entityType, event.entityId);
    if (twin) {
      const updated = this.events.apply(twin, {
        ...event,
        name: "twin.offline",
      });
      this.sync.publish(updated);
    }
  }

  syncOffline(type: TwinType, id: string): DigitalTwin | undefined {
    const twin = this.state.get(type, id);
    if (!twin) return undefined;
    const { twin: synced } = this.offline.applyPending(twin, this.events);
    this.sync.publish(synced);
    return synced;
  }

  getTimeline(type: TwinType, id: string) {
    return this.state.get(type, id)?.timeline ?? [];
  }

  getHistory(type: TwinType, id: string) {
    return this.history.forTwin(type, id);
  }

  getDashboard(): TwinDashboardBundle {
    return buildTwinDashboard(this.state.list());
  }

  enrichWithIntelligence(
    type: TwinType,
    id: string,
    intel: { riskScore?: number; readinessScore?: number; predictions?: DigitalTwin["predictions"] }
  ): DigitalTwin | undefined {
    const twin = this.state.get(type, id);
    if (!twin) return undefined;
    if (intel.riskScore != null) {
      twin.risk.score = intel.riskScore;
      twin.risk.level =
        intel.riskScore >= 80
          ? "critical"
          : intel.riskScore >= 60
            ? "high"
            : intel.riskScore >= 35
              ? "medium"
              : "low";
    }
    if (intel.readinessScore != null) {
      twin.readiness.score = intel.readinessScore;
    }
    if (intel.predictions?.length) {
      twin.predictions = [...intel.predictions, ...twin.predictions].slice(0, 8);
    }
    return this.state.set(twin);
  }

  enrichWithVision(type: TwinType, id: string, docCount: number): DigitalTwin | undefined {
    const twin = this.state.get(type, id);
    if (!twin) return undefined;
    if (twin.type === "worker") twin.visionDocuments = docCount;
    if (twin.type === "equipment") twin.visionPlates = docCount;
    if (twin.type === "project") twin.safetyDocumentCount = docCount;
    twin.timeline = this.timeline.append(
      twin.timeline,
      "document.uploaded",
      `Vision processed ${docCount} document(s)`,
      undefined,
      "Document intelligence merged into twin"
    );
    return this.state.set(twin);
  }
}
