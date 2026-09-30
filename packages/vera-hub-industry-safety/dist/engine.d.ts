import { PlaneIsolationError } from "./isolation";
import type { BlindAggregateResult, CohortKey, DataPlane, NormalizedPlaneFact, RawEntityRecord, StrippedRecord } from "./types";
export type IngestResult = {
    ok: true;
    fact: NormalizedPlaneFact;
} | {
    ok: false;
    error: string;
};
/**
 * VeriHub Anonymization & Normalization Engine
 *
 * Pipeline: Strip → Tokenize → Normalize → (Blind Aggregate)
 * Enforces min sample, plane isolation, and token non-leakage.
 */
export declare class VeriHubAnonymizationNormalizationEngine {
    readonly minSample: 5;
    /** Full privacy pipeline for a single raw record */
    ingest(raw: RawEntityRecord): IngestResult;
    ingestMany(raws: RawEntityRecord[]): {
        facts: NormalizedPlaneFact[];
        errors: Array<{
            index: number;
            error: string;
        }>;
    };
    normalizeStripped(stripped: StrippedRecord): IngestResult;
    /** Strip stage only */
    strip(raw: RawEntityRecord): StrippedRecord;
    tokenizeProject(id: string | number): string;
    tokenizeCompany(id: string | number): string;
    aggregateCohort(facts: NormalizedPlaneFact[], key: CohortKey): BlindAggregateResult;
    aggregateAll(facts: NormalizedPlaneFact[]): BlindAggregateResult[];
    enforcePlaneFilters(plane: DataPlane, filters: {
        projectType?: string;
        projectId?: string;
        companyType?: string;
        companyId?: string;
        entityType?: string;
    }): void;
    enforceCrossCompare(input: {
        explicitConsent?: boolean;
        hasPermission?: boolean;
    }): void;
    isSuppressed(entityCount: number): boolean;
    /** Public response sanitizer — strips tokens if somehow present */
    toPublicAggregate(result: BlindAggregateResult): {
        cohort: CohortKey;
        suppressed: boolean;
        entityCount: number | null;
        metrics: BlindAggregateResult["metrics"];
    };
}
export { PlaneIsolationError };
