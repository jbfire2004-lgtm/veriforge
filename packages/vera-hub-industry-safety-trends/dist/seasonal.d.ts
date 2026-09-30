import type { DataPlane, SeasonalMetric, SeasonalRiskModel, TrendCohortScope, TrendSeriesPoint } from "./types";
export declare function modelSeasonalRisk(plane: DataPlane, scope: TrendCohortScope, series: TrendSeriesPoint[], metric: SeasonalMetric): SeasonalRiskModel;
