import { type BlindAggregateResult, type CohortKey, type NormalizedPlaneFact } from "./types";
export type BlindAggregateOptions = {
    minSample?: number;
    /** When suppressed, hide exact entity counts from public meta */
    hideExactCountWhenSuppressed?: boolean;
    /** Skip min/max style stats unless n >= this (default 10) */
    minSampleForExtremes?: number;
};
/**
 * Blind aggregation: cohort means only, suppress when distinct tokens < minSample.
 */
export declare function blindAggregate(facts: NormalizedPlaneFact[], key: CohortKey, options?: BlindAggregateOptions): BlindAggregateResult;
export declare function shouldSuppress(entityCount: number, minSample?: number): boolean;
export declare function groupFactsByCohort(facts: NormalizedPlaneFact[]): Map<string, NormalizedPlaneFact[]>;
