import type { DataPlane, RootCauseClustering, TrendCohortScope, TrendSeriesPoint } from "./types";
/**
 * Lightweight root-cause clustering:
 * groups HECA / keyword shares into energy, process, and other clusters.
 */
export declare function clusterRootCauses(plane: DataPlane, scope: TrendCohortScope, series: TrendSeriesPoint[]): RootCauseClustering;
