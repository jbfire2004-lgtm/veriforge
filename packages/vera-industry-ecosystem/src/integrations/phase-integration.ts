import type { GlobalNetworkReport } from "@vera/global-network";
import type { IndustryContextInput, IndustryParticipant } from "../types";

export function ingestNetworkReport(
  ctx: IndustryContextInput,
  network?: GlobalNetworkReport | null
): IndustryContextInput {
  if (!network) return ctx;

  const participants: IndustryParticipant[] =
    ctx.participants ??
    (network.context.companies ?? []).map((c) => ({
      companyHash: c.companyHash,
      industry: c.industry ?? "construction",
      region: c.region ?? "NA",
      workerCount: c.workerCount,
      equipmentCount: c.equipmentCount,
      projectCount: c.projectCount,
      sifForms: c.sifForms,
      hecaForms: c.hecaForms,
      energyWheelForms: c.energyWheelForms,
      inspectionFailures: c.inspectionFailures,
      nonCompliantWorkers: c.nonCompliantWorkers,
      expiringTraining: c.expiringTraining,
      dispatchConflicts: c.dispatchConflicts,
    }));

  return {
    ...ctx,
    participants,
    networkRiskScore: network.safety.globalRiskScore,
    networkSafetyScore: network.safety.globalSafetyScore,
    totalWorkers: network.context.totalWorkers,
    totalEquipment: network.context.totalEquipment,
    totalUnionHalls: network.context.totalUnionHalls,
    totalProviders: network.context.totalProviders,
  };
}
