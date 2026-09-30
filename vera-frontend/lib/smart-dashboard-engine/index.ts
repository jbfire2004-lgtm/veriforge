export type * from "./types";
export { PERIODS, METRICS, INDUSTRIES, getSeries, getRevision, bumpRevision } from "./store";
export { detectAnomalies, detectTrends } from "./detect";
export { generateNarratives, forecastRisk, analyzeCorrelations } from "./ai";
export { buildSmartDashboard } from "./dashboard";
