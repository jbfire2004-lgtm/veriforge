import type { AutomationAction, InterplanetaryAutomation, InterplanetaryContextInput } from "../types";

let autoId = 0;

export class InterplanetaryAutomationEngine {
  run(ctx: InterplanetaryContextInput): InterplanetaryAutomation {
    const sites = ctx.sites ?? [];
    const mk = (trigger: string, target: string): AutomationAction => {
      autoId += 1;
      return { id: `auto-${autoId}`, trigger, target, autonomous: true, executed: false };
    };

    const actions: AutomationAction[] = [
      mk("eva_window_open", "Auto-assign EVA crew"),
      mk("robotics_idle", "Auto-assign robotics tasks"),
      mk("maintenance_due", "Auto-assign maintenance"),
      mk("life_support_drift", "Auto-trigger habitat safety protocol"),
      mk("power_imbalance", "Auto-trigger power redistribution"),
    ];

    if (sites.some((s) => !s.lifeSupportOk)) {
      actions.push(mk("life_support_critical", "Auto-trigger emergency shelter"));
    }
    if (sites.some((s) => (s.hazardScore ?? 0) > 50)) {
      actions.push(mk("hazard_threshold", "Auto-trigger equipment lockout"));
    }

    return {
      actions,
      evaAssignments: sites
        .filter((s) => s.facilityType === "orbital_station")
        .map((s) => `EVA crew alpha → ${s.name}`),
      roboticsAssignments: sites.map((s) => `Robotics task queue ${s.name}`),
      lifeSupportAdjustments: sites
        .filter((s) => (s.powerLevel ?? 100) < 70)
        .map((s) => `O2 scrubber duty cycle ↑ ${s.name}`),
      powerRedistribution: sites.map((s) => `Power bus rebalance ${s.name}: ${s.powerLevel ?? 0}%`),
    };
  }
}
