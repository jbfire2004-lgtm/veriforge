import type { InterplanetaryContextInput, PlanetaryCoordination, CoordinationLink } from "../types";
import { COMM_DELAYS } from "../utils/scoring";

let linkId = 0;

export class PlanetaryCoordinationEngine {
  coordinate(ctx: InterplanetaryContextInput): PlanetaryCoordination {
    const sites = ctx.sites ?? [];
    const links: CoordinationLink[] = [];
    const bodies = [...new Set(sites.map((s) => s.body))];

    const pairs: [string, string][] = [
      ["earth", "moon"],
      ["earth", "mars"],
      ["moon", "mars"],
    ];

    for (const [a, b] of pairs) {
      if (bodies.includes(a as typeof bodies[number]) && bodies.includes(b as typeof bodies[number])) {
        linkId += 1;
        const delay = (COMM_DELAYS[a] ?? 0) + (COMM_DELAYS[b] ?? 0);
        links.push({
          id: `link-${linkId}`,
          from: a,
          to: b,
          domains: ["workforce", "equipment", "robotics", "habitat", "life_support", "power", "logistics", "safety", "compliance"],
          delayMinutes: delay,
          status: delay > 20 ? "blackout" : delay > 5 ? "degraded" : "active",
        });
      }
    }

    const orbital = sites.filter((s) => s.facilityType === "orbital_station");
    const surface = sites.filter((s) => s.facilityType === "surface_base" || s.facilityType === "habitat");
    for (const o of orbital) {
      for (const s of surface.filter((x) => x.body === o.body)) {
        linkId += 1;
        links.push({
          id: `link-${linkId}`,
          from: o.id,
          to: s.id,
          domains: ["logistics", "crew", "cargo"],
          delayMinutes: o.commDelayMinutes ?? 0,
          status: "active",
        });
      }
    }

    return {
      links,
      workforceMoves: links.map((l) => `Federated crew rotation ${l.from} → ${l.to} (${l.delayMinutes}m delay)`),
      equipmentMoves: ["Cross-body equipment manifest sync (anonymized)"],
      logistics: ["Supply chain window optimization across bodies"],
      safetySync: ["Hazard control broadcast during comm windows"],
    };
  }
}
