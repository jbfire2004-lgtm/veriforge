import { MIN_SAMPLE } from "@vera/hub-industry-safety";
import { round } from "./stats";
import { filterUsable } from "./series";
import type {
  DataPlane,
  RootCauseCluster,
  RootCauseClustering,
  TrendCohortScope,
  TrendSeriesPoint,
} from "./types";

function averageShares(
  series: TrendSeriesPoint[],
): Record<string, number> {
  const sums = new Map<string, number>();
  let n = 0;
  for (const p of series) {
    const shares =
      p.rootCauseShares ??
      (p.metrics?.hecaDistribution as Record<string, number> | undefined);
    if (!shares || !Object.keys(shares).length) continue;
    n += 1;
    for (const [k, v] of Object.entries(shares)) {
      if (v == null || !Number.isFinite(v)) continue;
      sums.set(k, (sums.get(k) ?? 0) + v);
    }
  }
  if (n === 0) return {};
  const out: Record<string, number> = {};
  for (const [k, s] of sums) out[k] = s / n;
  return out;
}

/**
 * Lightweight root-cause clustering:
 * groups HECA / keyword shares into energy, process, and other clusters.
 */
export function clusterRootCauses(
  plane: DataPlane,
  scope: TrendCohortScope,
  series: TrendSeriesPoint[],
): RootCauseClustering {
  const usable = filterUsable(series);
  if (usable.length < 1) {
    return {
      plane,
      scope,
      clusters: [],
      suppressed: true,
      samplePeriods: 0,
    };
  }

  const avg = averageShares(usable);
  const entries = Object.entries(avg).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    return {
      plane,
      scope,
      clusters: [],
      suppressed: true,
      samplePeriods: usable.length,
    };
  }

  const ENERGY = new Set([
    "gravity",
    "electrical",
    "mechanical",
    "pressure",
    "thermal",
    "radiation",
  ]);
  const PROCESS = new Set(["chemical", "biological"]);

  const buckets: Record<string, { members: string[]; share: number }> = {
    energy_release: { members: [], share: 0 },
    process_exposure: { members: [], share: 0 },
    other: { members: [], share: 0 },
  };

  for (const [label, share] of entries) {
    const key = ENERGY.has(label)
      ? "energy_release"
      : PROCESS.has(label)
        ? "process_exposure"
        : "other";
    buckets[key]!.members.push(label);
    buckets[key]!.share += share;
  }

  const clusters: RootCauseCluster[] = Object.entries(buckets)
    .filter(([, b]) => b.members.length > 0)
    .map(([id, b]) => {
      const centroid: Record<string, number> = {};
      for (const m of b.members) centroid[m] = round(avg[m] ?? 0, 4);
      return {
        id,
        label:
          id === "energy_release"
            ? "Energy release"
            : id === "process_exposure"
              ? "Process exposure"
              : "Other / unclassified",
        share: round(b.share, 4),
        members: b.members,
        centroid,
      };
    })
    .sort((a, b) => b.share - a.share);

  // Suppress cluster detail if too few contributing periods (privacy)
  const suppressed = usable.length < Math.min(3, MIN_SAMPLE);

  return {
    plane,
    scope,
    clusters: suppressed ? [] : clusters,
    suppressed,
    samplePeriods: usable.length,
  };
}
