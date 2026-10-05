import { normalizeRegion, type DangerousOccurrenceCode, type ProvincialRegion, type UtilityContact } from './erp-ohs-utility.catalog';
export type ReportingUrgency = 'immediate' | 'as_soon_as_practicable' | 'within_24h' | 'employer_process';
export type ProvincialOhsProfile = {
    region: ProvincialRegion;
    frameworkLabel: string;
    regulator: string;
    reportChannel: string;
    reportingHint: string;
    fatalityUrgency: ReportingUrgency;
    disclaimer: string;
};
export type RequiredReportingObligation = {
    code: DangerousOccurrenceCode;
    label: string;
    region: ProvincialRegion;
    frameworkLabel: string;
    authority: string;
    mustReport: boolean;
    urgency: ReportingUrgency;
    preserveScene: boolean;
    notifyRegulator: boolean;
    notifyUtilityOwner: boolean;
    guidance: string;
    requiredActions: string[];
};
export type DangerousOccurrenceMatch = {
    code: DangerousOccurrenceCode;
    label: string;
    matchedPhrases: string[];
    confidence: number;
};
export type DangerousOccurrenceAssessment = {
    region: ProvincialRegion;
    framework: ProvincialOhsProfile;
    inputSummary: string;
    flagged: boolean;
    codes: DangerousOccurrenceCode[];
    matches: DangerousOccurrenceMatch[];
    requiredReporting: RequiredReportingObligation[];
    mustReportAny: boolean;
    preserveScene: boolean;
    highestUrgency: ReportingUrgency | null;
    utilityContacts: Array<Pick<UtilityContact, 'id' | 'agency' | 'name' | 'phone' | 'notes'>>;
    contactRouting: {
        hazards: string[];
        summary: string[];
        contacts: Array<{
            id: string;
            hazard: string;
            role: string;
            priority: number;
            name: string;
            phone: string | null;
            dialHint: string;
            reason: string;
            verified: boolean;
        }>;
    };
    supervisorReviewRequired: boolean;
    narrative: string;
    disclaimer: string;
};
export declare const PROVINCIAL_OHS_PROFILES: Record<string, ProvincialOhsProfile>;
export declare function matchDangerousOccurrences(text: string): DangerousOccurrenceMatch[];
export declare function detectDangerousOccurrenceCodes(text: string): DangerousOccurrenceCode[];
export declare function evaluateDangerousOccurrences(text: string, regionCode: string): DangerousOccurrenceAssessment;
export declare function assessmentToOhsRows(assessment: DangerousOccurrenceAssessment): {
    code: DangerousOccurrenceCode;
    label: string;
    guidance: string;
    mustReport: boolean;
    urgency: ReportingUrgency;
    authority: string;
    frameworkLabel: string;
    preserveScene: boolean;
    requiredActions: string[];
}[];
export { normalizeRegion };
