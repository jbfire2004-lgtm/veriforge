import { z } from 'zod';
export declare const RegulatoryComplianceStatusSchema: z.ZodEnum<["COMPLIANT", "PARTIALLY_COMPLIANT", "NON_COMPLIANT", "UNKNOWN"]>;
export declare const RegulatoryRecommendedActionSchema: z.ZodEnum<["approve", "reject", "manual_review"]>;
export declare const RegulatoryDecisionSchema: z.ZodObject<{
    trainingRecordId: z.ZodNumber;
    regulatoryComplianceStatus: z.ZodEnum<["COMPLIANT", "PARTIALLY_COMPLIANT", "NON_COMPLIANT", "UNKNOWN"]>;
    complianceScore: z.ZodNumber;
    matchedStandards: z.ZodArray<z.ZodString, "many">;
    jurisdictionCoverage: z.ZodArray<z.ZodString, "many">;
    reasons: z.ZodArray<z.ZodString, "many">;
    jurisdictionCode: z.ZodString;
    validationResultId: z.ZodOptional<z.ZodNumber>;
    standardsOutcome: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"]>>;
    recommendedAction: z.ZodEnum<["approve", "reject", "manual_review"]>;
    decisionId: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trainingRecordId: number;
    jurisdictionCode: string;
    regulatoryComplianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "PARTIALLY_COMPLIANT" | "UNKNOWN";
    complianceScore: number;
    matchedStandards: string[];
    jurisdictionCoverage: string[];
    reasons: string[];
    recommendedAction: "approve" | "reject" | "manual_review";
    createdAt?: string | undefined;
    validationResultId?: number | undefined;
    standardsOutcome?: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW" | undefined;
    decisionId?: number | undefined;
}, {
    trainingRecordId: number;
    jurisdictionCode: string;
    regulatoryComplianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "PARTIALLY_COMPLIANT" | "UNKNOWN";
    complianceScore: number;
    matchedStandards: string[];
    jurisdictionCoverage: string[];
    reasons: string[];
    recommendedAction: "approve" | "reject" | "manual_review";
    createdAt?: string | undefined;
    validationResultId?: number | undefined;
    standardsOutcome?: "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVIEW" | undefined;
    decisionId?: number | undefined;
}>;
export declare const RegulatoryDecisionBodySchema: z.ZodObject<{
    trainingRecordId: z.ZodNumber;
    jurisdictionCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trainingRecordId: number;
    jurisdictionCode?: string | undefined;
}, {
    trainingRecordId: number;
    jurisdictionCode?: string | undefined;
}>;
export declare const RegulatoryEquivalencySchema: z.ZodObject<{
    id: z.ZodNumber;
    fromJurisdiction: z.ZodString;
    toJurisdiction: z.ZodString;
    standardCode: z.ZodString;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    active: z.ZodBoolean;
    createdAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: number;
    active: boolean;
    fromJurisdiction: string;
    toJurisdiction: string;
    standardCode: string;
    createdAt?: Date | undefined;
    notes?: string | null | undefined;
}, {
    id: number;
    active: boolean;
    fromJurisdiction: string;
    toJurisdiction: string;
    standardCode: string;
    createdAt?: Date | undefined;
    notes?: string | null | undefined;
}>;
export type RegulatoryComplianceStatus = z.infer<typeof RegulatoryComplianceStatusSchema>;
export type RegulatoryDecision = z.infer<typeof RegulatoryDecisionSchema>;
export type RegulatoryDecisionBody = z.infer<typeof RegulatoryDecisionBodySchema>;
