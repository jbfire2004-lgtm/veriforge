import type { RawEntityRecord, StrippedRecord } from "./types";
/**
 * Strip names, locations, and identifiers from ingress records.
 * Retains only fields needed for tokenization + metric normalization.
 */
export declare function stripIdentifiers(raw: RawEntityRecord): StrippedRecord;
export declare function aggregateHazardKeywords(texts: Array<string | undefined>): Record<string, number>;
/** Fields that must never survive strip */
export declare const STRIPPED_FIELD_NAMES: readonly ["projectName", "companyName", "legalName", "contractNumber", "address", "city", "lat", "lon", "workerName", "email", "phone", "badgeId", "userId", "permitNumber", "narrative", "comments"];
