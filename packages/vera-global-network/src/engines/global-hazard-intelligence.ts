import type { GlobalHazardIntelligence, NetworkContextInput } from "../types";
import { aggregateHazardKeywords } from "../utils/anonymize";

export class GlobalHazardIntelligenceEngine {
  analyze(ctx: NetworkContextInput): GlobalHazardIntelligence {
    const allTexts: string[] = [];
    for (const c of ctx.companies ?? []) {
      allTexts.push(...(c.hazardTexts ?? []));
    }

    const kwMap = aggregateHazardKeywords(allTexts);
    const clusters = [...kwMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count], i) => ({
        id: `hz-${i}`,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        count,
        industries: [...new Set((ctx.companies ?? []).map((c) => c.industry).filter(Boolean) as string[])].slice(0, 3),
        trend: (count > 5 ? "up" : "stable") as "up" | "stable",
      }));

    const totalSif = (ctx.companies ?? []).reduce((s, c) => s + (c.sifForms ?? 0), 0);
    const predictions = [
      { label: "SIF precursor cluster", probability: Math.min(0.95, totalSif * 0.08 + 0.2), region: "global" },
      { label: "Height-related incidents", probability: (kwMap.get("fall") ?? 0) > 3 ? 0.7 : 0.35 },
    ];

    const alerts: string[] = [];
    if (totalSif > 5) alerts.push(`Network: ${totalSif} SIF-related forms across tenants`);
    if (clusters.length) alerts.push(`Top cluster: ${clusters[0].label} (${clusters[0].count} signals)`);

    const recommendedControls = clusters.slice(0, 3).map(
      (c) => `Apply ${c.label} controls network-wide`
    );

    return { clusters, predictions, alerts, recommendedControls };
  }
}
