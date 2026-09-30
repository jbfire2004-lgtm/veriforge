import { type BlindAggregateResult, type DataPlane, type NormalizedPlaneFact } from "@vera/hub-industry-safety";
import type { TrendCohortScope, TrendSeriesPoint } from "./types";
/**
 * Convert blind aggregates (already anonymized) into a sorted trend series.
 */
export declare function fromBlindAggregates(aggregates: BlindAggregateResult[]): TrendSeriesPoint[];
/**
 * Group facts by period then caller should blind-aggregate externally.
 * This helper only validates plane isolation and sorts.
 */
export declare function assertSinglePlaneFacts(facts: NormalizedPlaneFact[], expected?: DataPlane): DataPlane;
export declare function assertSeriesPlane(series: TrendSeriesPoint[], scope: TrendCohortScope, opts?: {
    explicitCrossCompare?: boolean;
}): void;
export declare function filterUsable(series: TrendSeriesPoint[]): TrendSeriesPoint[];
