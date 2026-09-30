"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterstellarAutomationEngine = void 0;
let autoId = 0;
class InterstellarAutomationEngine {
    run(ctx) {
        const assets = ctx.assets ?? [];
        const mk = (trigger, target) => {
            autoId += 1;
            return { id: `isauto-${autoId}`, trigger, target, autonomous: true };
        };
        const actions = [
            mk("robotics_fleet_idle", "Auto-assign robotics fleets"),
            mk("terraform_phase", "Auto-assign terraforming tasks"),
            mk("mining_window", "Auto-assign mining tasks"),
            mk("habitat_drift", "Auto-trigger habitat safety protocols"),
            mk("cryosleep_rotation", "Auto-trigger cryosleep cycles"),
            mk("power_imbalance", "Auto-trigger power redistribution"),
            mk("component_degradation", "Auto-trigger self-repair routines"),
        ];
        if (assets.some((a) => !a.lifeSupportOk)) {
            actions.push(mk("life_support_critical", "Auto-trigger emergency shelters"));
        }
        return {
            actions,
            roboticsAssignments: assets.map((a) => `Robotics fleet ${a.name}`),
            terraformingTasks: assets
                .filter((a) => (a.terraformStage ?? 0) > 0)
                .map((a) => `Terraform stage ${a.terraformStage} @ ${a.name}`),
            miningTasks: assets.map((a) => `Mining ops ${a.name}`),
            cryosleepCycles: assets
                .filter((a) => a.kind === "generation_ship")
                .map((a) => `Cryosleep rotation ${a.name}`),
            powerRedistribution: assets.map((a) => `Power grid ${a.name}: ${a.powerLevel ?? 0}%`),
            selfRepairRoutines: assets.map((a) => `Self-repair ${a.name}`),
        };
    }
}
exports.InterstellarAutomationEngine = InterstellarAutomationEngine;
//# sourceMappingURL=interstellar-automation.js.map