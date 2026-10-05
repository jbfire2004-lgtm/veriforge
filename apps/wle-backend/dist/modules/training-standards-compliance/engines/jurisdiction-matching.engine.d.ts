export interface JurisdictionRequirementRow {
    jurisdictionCode: string;
    standardCode: string;
    required: boolean;
    regionName: string;
}
export interface JurisdictionMatchResult {
    jurisdictionCode: string;
    matched: string[];
    missing: string[];
    score: number;
}
export declare class JurisdictionMatchingEngine {
    match(jurisdictionCode: string, requirements: JurisdictionRequirementRow[], satisfiedStandardCodes: string[]): JurisdictionMatchResult;
    normalizeJurisdiction(region?: string | null): string;
}
