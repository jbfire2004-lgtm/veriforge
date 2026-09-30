"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProbeCoordinationEngine = void 0;
class ProbeCoordinationEngine {
    coordinate(ctx) {
        const probes = (ctx.assets ?? []).filter((a) => a.kind === "probe");
        return {
            navigation: probes.map((p) => `Autonomous navigation ${p.name} → ${p.system}`),
            hazardAvoidance: probes.map((p) => `Micrometeoroid + flare avoidance ${p.name}`),
            scienceMissions: probes.map((p) => `Science payload execution ${p.name}`),
            dataTransmission: probes.map((p) => `Compressed burst transmit ${p.name} (${p.commDelayYears ?? 4}y latency)`),
            selfRepair: probes.map((p) => `Self-repair routine ${p.name}`),
            resourceHarvesting: probes.map((p) => `ISRU harvesting ${p.name}`),
            replication: probes.map((p) => `Von Neumann replication cycle ${p.name}`),
        };
    }
}
exports.ProbeCoordinationEngine = ProbeCoordinationEngine;
//# sourceMappingURL=probe-coordination.js.map