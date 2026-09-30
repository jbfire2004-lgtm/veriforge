"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraDigitalTwinEngine = void 0;
const state_model_engine_1 = require("../engines/state-model-engine");
const sync_engine_1 = require("../engines/sync-engine");
const predictive_state_engine_1 = require("../engines/predictive-state-engine");
const event_update_engine_1 = require("../engines/event-update-engine");
const timeline_engine_1 = require("../engines/timeline-engine");
const history_engine_1 = require("../engines/history-engine");
const offline_twin_engine_1 = require("../engines/offline-twin-engine");
const worker_twin_1 = require("../twins/worker-twin");
const equipment_twin_1 = require("../twins/equipment-twin");
const project_twin_1 = require("../twins/project-twin");
const company_twin_1 = require("../twins/company-twin");
const provider_twin_1 = require("../twins/provider-twin");
const union_hall_twin_1 = require("../twins/union-hall-twin");
const dashboard_twins_1 = require("../twins/dashboard-twins");
/**
 * Vera Digital Twin Engine (VDTE)
 */
class VeraDigitalTwinEngine {
    constructor() {
        this.state = new state_model_engine_1.StateModelEngine();
        this.sync = new sync_engine_1.RealTimeSyncEngine();
        this.predictive = new predictive_state_engine_1.PredictiveStateEngine();
        this.timeline = new timeline_engine_1.TwinTimelineEngine();
        this.history = new history_engine_1.TwinHistoryEngine();
        this.offline = new offline_twin_engine_1.OfflineTwinEngine();
        this.events = new event_update_engine_1.EventDrivenUpdateEngine(this.state, this.timeline, this.history);
    }
    createWorker(input) {
        const twin = (0, worker_twin_1.buildWorkerTwin)(input);
        this.state.set(twin);
        this.history.record(twin);
        this.sync.publish(twin);
        return twin;
    }
    createEquipment(input) {
        const twin = (0, equipment_twin_1.buildEquipmentTwin)(input);
        this.state.set(twin);
        this.history.record(twin);
        this.sync.publish(twin);
        return twin;
    }
    createProject(input) {
        const twin = (0, project_twin_1.buildProjectTwin)(input);
        this.state.set(twin);
        this.history.record(twin);
        this.sync.publish(twin);
        return twin;
    }
    createCompany(input) {
        const twin = (0, company_twin_1.buildCompanyTwin)(input);
        this.state.set(twin);
        this.history.record(twin);
        this.sync.publish(twin);
        return twin;
    }
    createProvider(input) {
        const twin = (0, provider_twin_1.buildProviderTwin)(input);
        this.state.set(twin);
        this.history.record(twin);
        this.sync.publish(twin);
        return twin;
    }
    createUnionHall(input) {
        const twin = (0, union_hall_twin_1.buildUnionHallTwin)(input);
        this.state.set(twin);
        this.history.record(twin);
        this.sync.publish(twin);
        return twin;
    }
    get(type, id) {
        return this.state.get(type, id);
    }
    list(type) {
        return this.state.list(type);
    }
    applyEvent(event) {
        const twin = this.state.get(event.entityType, event.entityId);
        if (!twin)
            return undefined;
        const updated = this.events.apply(twin, event);
        this.sync.publish(updated);
        return updated;
    }
    applyEventOffline(event, clientVersion) {
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
    syncOffline(type, id) {
        const twin = this.state.get(type, id);
        if (!twin)
            return undefined;
        const { twin: synced } = this.offline.applyPending(twin, this.events);
        this.sync.publish(synced);
        return synced;
    }
    getTimeline(type, id) {
        return this.state.get(type, id)?.timeline ?? [];
    }
    getHistory(type, id) {
        return this.history.forTwin(type, id);
    }
    getDashboard() {
        return (0, dashboard_twins_1.buildTwinDashboard)(this.state.list());
    }
    enrichWithIntelligence(type, id, intel) {
        const twin = this.state.get(type, id);
        if (!twin)
            return undefined;
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
    enrichWithVision(type, id, docCount) {
        const twin = this.state.get(type, id);
        if (!twin)
            return undefined;
        if (twin.type === "worker")
            twin.visionDocuments = docCount;
        if (twin.type === "equipment")
            twin.visionPlates = docCount;
        if (twin.type === "project")
            twin.safetyDocumentCount = docCount;
        twin.timeline = this.timeline.append(twin.timeline, "document.uploaded", `Vision processed ${docCount} document(s)`, undefined, "Document intelligence merged into twin");
        return this.state.set(twin);
    }
}
exports.VeraDigitalTwinEngine = VeraDigitalTwinEngine;
//# sourceMappingURL=vera-digital-twin-engine.js.map