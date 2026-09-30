"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSpaceCoordinationEngine = void 0;
class DeepSpaceCoordinationEngine {
    coordinate(ctx) {
        const deep = (ctx.sites ?? []).filter((s) => s.body === "deep_space" || s.facilityType === "mission");
        const mars = (ctx.sites ?? []).filter((s) => s.body === "mars");
        return {
            missionPlans: deep.map((s) => `Autonomous mission plan ${s.name} (no Earth input required)`),
            crewSchedules: [...deep, ...mars].map((s) => `Crew cycle ${s.name}: ${s.crewCount ?? 0} personnel`),
            equipmentAllocation: deep.map((s) => `Equipment manifest ${s.name}: robots ${s.robotCount ?? 0}`),
            emergencyProtocols: deep.length
                ? ["Deep-space emergency shelter protocol armed"]
                : ["Standby emergency protocols"],
            habitatManagement: mars
                .filter((s) => s.facilityType === "habitat")
                .map((s) => `Habitat ${s.name}: life support ${s.lifeSupportOk ? "nominal" : "alert"}`),
            roboticsCoordination: deep.map((s) => `Robotics fleet coordination ${s.name}`),
        };
    }
}
exports.DeepSpaceCoordinationEngine = DeepSpaceCoordinationEngine;
//# sourceMappingURL=deep-space-coordination.js.map