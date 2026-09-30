import type { NetworkContextInput, TwinFederationSignal } from "../types";

export class TwinFederationEngine {
  federate(ctx: NetworkContextInput): TwinFederationSignal[] {
    const signals: TwinFederationSignal[] = [];
    const companies = ctx.companies ?? [];

    const avgRisk =
      companies.length > 0
        ? companies.reduce(
            (s, c) =>
              s +
              (c.sifForms ?? 0) * 10 +
              (c.inspectionFailures ?? 0) * 5 +
              (c.nonCompliantWorkers ?? 0) * 2,
            0
          ) / companies.length
        : 30;

    signals.push({
      twinType: "worker",
      signal: "Federated readiness drift",
      strength: Math.min(1, avgRisk / 100),
      anonymized: true,
    });
    signals.push({
      twinType: "equipment",
      signal: "Inspection failure correlation",
      strength: Math.min(
        1,
        companies.reduce((s, c) => s + (c.inspectionFailures ?? 0), 0) / Math.max(1, companies.length * 5)
      ),
      anonymized: true,
    });
    signals.push({
      twinType: "project",
      signal: "Staffing pressure index",
      strength: 0.55,
      anonymized: true,
    });
    signals.push({
      twinType: "company",
      signal: "Network compliance envelope",
      strength: Math.min(1, avgRisk / 80),
      anonymized: true,
    });

    return signals;
  }
}
