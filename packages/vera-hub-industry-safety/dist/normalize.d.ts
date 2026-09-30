import { type CompanySubtype, type HecaCategory, type IndustryCode, type NormalizedMetrics, type ProjectSubtype, type ScaleBand, type StrippedRecord } from "./types";
export declare function clamp(n: number, min?: number, max?: number): number;
export declare function round(n: number, digits?: number): number;
export declare function finiteOrNull(n: number | null | undefined): number | null;
/**
 * Incidents (or counts) per 200,000 hours.
 */
export declare function ratePer200k(count: number | null | undefined, hoursWorked: number | null | undefined): number | null;
/**
 * Severity index 0–100 from weighted severities or sum/count.
 */
export declare function severityIndex(input: {
    severityWeights?: number[];
    severitySum?: number;
    severityCount?: number;
}): number | null;
export declare function standardizeHecaCategory(raw: string): HecaCategory;
export declare function standardizeHecaDistribution(counts?: Record<string, number>): Partial<Record<HecaCategory, number>>;
export declare function standardizeProjectType(raw?: string): ProjectSubtype | null;
export declare function standardizeCompanyType(raw?: string): CompanySubtype | null;
export declare function standardizeIndustry(raw?: string): IndustryCode | null;
export declare function standardizeScale(raw?: string, cues?: {
    workerCount?: number;
    peakWorkers?: number;
    contractValueUsd?: number;
    entityType?: "project" | "company";
}): ScaleBand | null;
export declare function normalizeMetrics(stripped: StrippedRecord): NormalizedMetrics;
