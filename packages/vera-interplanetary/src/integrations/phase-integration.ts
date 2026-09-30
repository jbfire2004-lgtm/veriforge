import type { GlobalNetworkReport } from "@vera/global-network";
import type { IndustryEcosystemReport } from "@vera/industry-ecosystem";
import type { MarketplaceReport } from "@vera/marketplace";
import type { InterplanetaryContextInput, InterplanetarySite } from "../types";
import { COMM_DELAYS } from "../utils/scoring";

export function ingestPhases(
  ctx: InterplanetaryContextInput,
  marketplace?: MarketplaceReport | null,
  industry?: IndustryEcosystemReport | null,
  network?: GlobalNetworkReport | null
): InterplanetaryContextInput {
  const sites: InterplanetarySite[] = [...(ctx.sites ?? [])];

  if (sites.length === 0) {
    const workers = ctx.earthWorkerCount ?? network?.context.totalWorkers ?? 0;
    const equipment = ctx.earthEquipmentCount ?? network?.context.totalEquipment ?? 0;

    sites.push(
      {
        id: "earth-hq",
        name: "Earth Operations HQ",
        body: "earth",
        facilityType: "surface_base",
        crewCount: workers,
        robotCount: 0,
        lifeSupportOk: true,
        powerLevel: 95,
        radiationLevel: 10,
        commDelayMinutes: COMM_DELAYS.earth,
        hazardScore: network?.safety.globalRiskScore ?? 20,
      },
      {
        id: "lunar-base-alpha",
        name: "Lunar Base Alpha",
        body: "moon",
        facilityType: "habitat",
        crewCount: Math.ceil(workers * 0.05),
        robotCount: Math.ceil(equipment * 0.02),
        lifeSupportOk: true,
        powerLevel: 78,
        radiationLevel: 35,
        commDelayMinutes: COMM_DELAYS.moon,
        hazardScore: 25,
      },
      {
        id: "mars-hab-one",
        name: "Mars Habitat One",
        body: "mars",
        facilityType: "habitat",
        crewCount: Math.ceil(workers * 0.03),
        robotCount: Math.ceil(equipment * 0.03),
        lifeSupportOk: (industry?.readiness.industryReadinessScore ?? 80) > 60,
        powerLevel: 65,
        radiationLevel: 55,
        commDelayMinutes: COMM_DELAYS.mars,
        hazardScore: industry?.risk.industryScore ?? 35,
      },
      {
        id: "orbital-station-vera",
        name: "Orbital Station Vera",
        body: "orbit",
        facilityType: "orbital_station",
        crewCount: 12,
        robotCount: 8,
        lifeSupportOk: true,
        powerLevel: 88,
        radiationLevel: 40,
        commDelayMinutes: COMM_DELAYS.orbit,
        hazardScore: 30,
      },
      {
        id: "deep-space-mission-7",
        name: "Deep Space Mission 7",
        body: "deep_space",
        facilityType: "mission",
        crewCount: 6,
        robotCount: 4,
        lifeSupportOk: true,
        powerLevel: 72,
        radiationLevel: 70,
        commDelayMinutes: COMM_DELAYS.deep_space,
        hazardScore: 45,
      }
    );
  }

  return {
    ...ctx,
    sites,
    marketplaceMatchCount: marketplace?.dashboard.matchCount ?? ctx.marketplaceMatchCount,
    networkRiskScore: network?.safety.globalRiskScore ?? industry?.risk.industryScore ?? ctx.networkRiskScore,
    earthWorkerCount: ctx.earthWorkerCount ?? network?.context.totalWorkers,
    earthEquipmentCount: ctx.earthEquipmentCount ?? network?.context.totalEquipment,
  };
}
