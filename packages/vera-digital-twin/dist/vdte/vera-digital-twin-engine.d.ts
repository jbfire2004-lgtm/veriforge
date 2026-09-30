import { StateModelEngine } from "../engines/state-model-engine";
import { RealTimeSyncEngine } from "../engines/sync-engine";
import { PredictiveStateEngine } from "../engines/predictive-state-engine";
import { TwinTimelineEngine } from "../engines/timeline-engine";
import { TwinHistoryEngine } from "../engines/history-engine";
import { OfflineTwinEngine } from "../engines/offline-twin-engine";
import { type WorkerTwinInput } from "../twins/worker-twin";
import { type EquipmentTwinInput } from "../twins/equipment-twin";
import { type ProjectTwinInput } from "../twins/project-twin";
import { type CompanyTwinInput } from "../twins/company-twin";
import { type ProviderTwinInput } from "../twins/provider-twin";
import { type UnionHallTwinInput } from "../twins/union-hall-twin";
import type { DigitalTwin, TwinDashboardBundle, TwinEventPayload, TwinType } from "../types";
/**
 * Vera Digital Twin Engine (VDTE)
 */
export declare class VeraDigitalTwinEngine {
    readonly state: StateModelEngine;
    readonly sync: RealTimeSyncEngine;
    readonly predictive: PredictiveStateEngine;
    readonly timeline: TwinTimelineEngine;
    readonly history: TwinHistoryEngine;
    readonly offline: OfflineTwinEngine;
    private readonly events;
    constructor();
    createWorker(input: WorkerTwinInput): DigitalTwin;
    createEquipment(input: EquipmentTwinInput): DigitalTwin;
    createProject(input: ProjectTwinInput): DigitalTwin;
    createCompany(input: CompanyTwinInput): DigitalTwin;
    createProvider(input: ProviderTwinInput): DigitalTwin;
    createUnionHall(input: UnionHallTwinInput): DigitalTwin;
    get(type: TwinType, id: string): DigitalTwin | undefined;
    list(type?: TwinType): DigitalTwin[];
    applyEvent(event: TwinEventPayload): DigitalTwin | undefined;
    applyEventOffline(event: TwinEventPayload, clientVersion: number): void;
    syncOffline(type: TwinType, id: string): DigitalTwin | undefined;
    getTimeline(type: TwinType, id: string): import("../types").TimelineEntry[];
    getHistory(type: TwinType, id: string): import("../engines/history-engine").HistorySnapshot[];
    getDashboard(): TwinDashboardBundle;
    enrichWithIntelligence(type: TwinType, id: string, intel: {
        riskScore?: number;
        readinessScore?: number;
        predictions?: DigitalTwin["predictions"];
    }): DigitalTwin | undefined;
    enrichWithVision(type: TwinType, id: string, docCount: number): DigitalTwin | undefined;
}
//# sourceMappingURL=vera-digital-twin-engine.d.ts.map