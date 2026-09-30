import type { DataPlane, PredictiveRiskForecast, RiskForecastHorizon, TrendCohortScope, TrendSeriesPoint } from "./types";
export declare function forecastPredictiveRisk(plane: DataPlane, scope: TrendCohortScope, series: TrendSeriesPoint[], horizon?: RiskForecastHorizon): PredictiveRiskForecast;
