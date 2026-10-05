export type ProvincialRegion = 'CA-AB' | 'CA-SK' | 'CA-BC' | 'CA-MB' | 'CA-ON' | 'US-TX' | 'US-NV' | string;
export type DangerousOccurrenceCode = 'gas_line_strike' | 'electrical_contact' | 'structural_collapse' | 'excavation_cave_in' | 'crane_failure' | 'fire_explosion' | 'chemical_release' | 'fatality_or_critical_injury' | 'worker_entrapment' | 'none';
export type UtilityAgency = 'gas' | 'electric' | 'water' | 'telecom' | 'pipeline' | 'one_call';
export type UtilityContact = {
    id: string;
    region: ProvincialRegion;
    agency: UtilityAgency;
    name: string;
    phone: string;
    triggers: DangerousOccurrenceCode[];
    notes: string;
    verifiedAt: string;
};
export type DangerousOccurrenceRule = {
    code: DangerousOccurrenceCode;
    label: string;
    keywords: string[];
    reportingByRegion: Partial<Record<ProvincialRegion, string>>;
    defaultUtilityAgencies: UtilityAgency[];
    erpAppendices: string[];
};
export declare const DANGEROUS_OCCURRENCE_RULES: DangerousOccurrenceRule[];
export declare const UTILITY_CONTACT_CATALOG: UtilityContact[];
export declare function detectDangerousOccurrences(text: string): DangerousOccurrenceCode[];
export declare function utilityContactsFor(regionCode: string, occurrences: DangerousOccurrenceCode[]): UtilityContact[];
export declare function ohsReportingGuidance(regionCode: string, occurrences: DangerousOccurrenceCode[]): Array<{
    code: DangerousOccurrenceCode;
    label: string;
    guidance: string;
}>;
export declare function appendixStepsFor(occurrences: DangerousOccurrenceCode[]): string[];
export declare function normalizeRegion(regionCode: string): ProvincialRegion;
