import type { InterplanetaryContextInput, OrbitalCoordination } from "../types";
import { clamp } from "../utils/scoring";

let evaId = 0;

export class OrbitalCoordinationEngine {
  coordinate(ctx: InterplanetaryContextInput): OrbitalCoordination {
    const orbital = (ctx.sites ?? []).filter(
      (s) => s.facilityType === "orbital_station" || s.body === "orbit"
    );

    const evaSchedule = orbital.map((s) => {
      evaId += 1;
      const risk = clamp((s.hazardScore ?? 20) + (s.radiationLevel ?? 0) * 2);
      return {
        id: `eva-${evaId}`,
        station: s.name,
        window: risk > 50 ? "hold" : "T+6h nominal",
        risk,
      };
    });

    const constructionTasks = orbital.map((s) => `Orbital construction phase ${s.name}: truss + module install`);
    const hazardPredictions = orbital
      .filter((s) => (s.hazardScore ?? 0) > 25)
      .map((s) => `${s.name}: conjunction/debris risk elevated`);

    return {
      evaSchedule,
      dockingOps: orbital.map((s) => `Docking window ${s.name}: cargo + crew transfer`),
      debrisAlerts: orbital.some((s) => (s.hazardScore ?? 0) > 40)
        ? ["Debris conjunction monitoring elevated"]
        : [],
      cargoTransfers: orbital.map((s) => `Cargo manifest sync ${s.name}`),
      maintenanceTasks: orbital.map((s) => `Orbital maintenance cycle ${s.name}`),
      constructionTasks,
      hazardPredictions,
    };
  }
}
