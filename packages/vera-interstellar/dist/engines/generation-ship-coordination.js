"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationShipCoordinationEngine = void 0;
class GenerationShipCoordinationEngine {
    coordinate(ctx) {
        const ships = (ctx.assets ?? []).filter((a) => a.kind === "generation_ship");
        return {
            missionPlans: ships.map((s) => `Multi-decade mission plan ${s.name} (${s.commDelayYears ?? 4}y delay)`),
            crewSchedules: ships.map((s) => `Generational crew cycle ${s.name}: ${s.crewCount ?? 0} active`),
            lifeSupportPlans: ships.map((s) => `Closed-loop life support ${s.name}: ${s.lifeSupportOk ? "nominal" : "alert"}`),
            habitatMaintenance: ships.map((s) => `Habitat maintenance window ${s.name}`),
            educationCycles: ships.map((s) => `Training + education cycle ${s.name} (autonomous curriculum)`),
            emergencyProtocols: ships.some((s) => !s.lifeSupportOk)
                ? ["Generation ship emergency shelter protocol"]
                : ["Standby emergency protocols"],
            resourceAllocation: ships.map((s) => `Resource budget ${s.name}: power ${s.powerLevel ?? 0}%`),
        };
    }
}
exports.GenerationShipCoordinationEngine = GenerationShipCoordinationEngine;
//# sourceMappingURL=generation-ship-coordination.js.map