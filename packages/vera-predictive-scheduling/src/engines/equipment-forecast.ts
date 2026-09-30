import type { SchedulingContextInput, EquipmentForecast } from "../types";

export class EquipmentForecastingEngine {
  analyze(ctx: SchedulingContextInput): EquipmentForecast {
    const equipment = ctx.equipment ?? [];
    const projects = ctx.projects ?? [];

    const availability = equipment.map((e) => {
      let prob = 0.9;
      if (e.lockedOut) prob = 0;
      else if (e.overdueInspection) prob = 0.4;
      else if ((e.maintenanceDueDays ?? 999) < 14) prob -= 0.15;
      return { equipmentId: e.id, probability: Math.max(0, prob) };
    });

    const downtimeRisk = equipment
      .filter((e) => e.lockedOut || e.overdueInspection || (e.maintenanceDueDays ?? 999) < 30)
      .map((e) => ({
        equipmentId: e.id,
        probability: e.lockedOut ? 1 : e.overdueInspection ? 0.75 : 0.5,
        reason: e.lockedOut
          ? "Locked out"
          : e.overdueInspection
            ? "Overdue inspection"
            : "Maintenance due soon",
      }));

    const maintenanceForecast = equipment
      .filter((e) => (e.maintenanceDueDays ?? 999) < 60)
      .map((e) => ({
        equipmentId: e.id,
        dueInDays: e.maintenanceDueDays ?? 30,
      }));

    const shortages = projects
      .map((p) => {
        const deficit = Math.max(0, (p.requiredEquipment ?? 0) - (p.assignedEquipment ?? 0));
        return deficit > 0 ? { projectId: p.id, deficit } : null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const recommendations: string[] = [];
    if (downtimeRisk.length) recommendations.push("Schedule preventive maintenance before project peaks");
    if (shortages.length) recommendations.push("Reallocate idle equipment from lower-priority projects");

    return {
      availability,
      downtimeRisk,
      shortages,
      maintenanceForecast,
      recommendations,
    };
  }
}
