import { z } from "zod";
export declare const PmSafetyWorkflowKindSchema: z.ZodEnum<["PERMIT_TO_WORK", "JOB_SAFETY_ANALYSIS", "JHA", "FLHA", "SIF", "HECA", "ENERGY_WHEEL", "INSPECTION"]>;
export declare const PmSafetyActionSchema: z.ZodEnum<["submit", "start_review", "approve", "reject", "revise", "close", "cancel"]>;
/** Matches {@link CreatePmSafetyWorkflowDto} / Nest create body. */
export declare const CreatePmSafetyWorkflowBodySchema: z.ZodObject<{
    title: z.ZodString;
    kind: z.ZodOptional<z.ZodEnum<["PERMIT_TO_WORK", "JOB_SAFETY_ANALYSIS", "JHA", "FLHA", "SIF", "HECA", "ENERGY_WHEEL", "INSPECTION"]>>;
    companyId: z.ZodOptional<z.ZodNumber>;
    siteId: z.ZodOptional<z.ZodNumber>;
    workDescription: z.ZodOptional<z.ZodString>;
    hazardSummary: z.ZodOptional<z.ZodString>;
    controlMeasures: z.ZodOptional<z.ZodString>;
    jobLocation: z.ZodOptional<z.ZodString>;
    taskStepsJson: z.ZodOptional<z.ZodString>;
    validFrom: z.ZodOptional<z.ZodString>;
    validTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    companyId?: number | undefined;
    siteId?: number | undefined;
    kind?: "FLHA" | "JHA" | "PERMIT_TO_WORK" | "JOB_SAFETY_ANALYSIS" | "SIF" | "HECA" | "ENERGY_WHEEL" | "INSPECTION" | undefined;
    workDescription?: string | undefined;
    hazardSummary?: string | undefined;
    controlMeasures?: string | undefined;
    jobLocation?: string | undefined;
    taskStepsJson?: string | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
}, {
    title: string;
    companyId?: number | undefined;
    siteId?: number | undefined;
    kind?: "FLHA" | "JHA" | "PERMIT_TO_WORK" | "JOB_SAFETY_ANALYSIS" | "SIF" | "HECA" | "ENERGY_WHEEL" | "INSPECTION" | undefined;
    workDescription?: string | undefined;
    hazardSummary?: string | undefined;
    controlMeasures?: string | undefined;
    jobLocation?: string | undefined;
    taskStepsJson?: string | undefined;
    validFrom?: string | undefined;
    validTo?: string | undefined;
}>;
/** Matches {@link TransitionPmSafetyWorkflowDto}. */
export declare const TransitionPmSafetyWorkflowBodySchema: z.ZodObject<{
    action: z.ZodEnum<["submit", "start_review", "approve", "reject", "revise", "close", "cancel"]>;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "approve" | "reject" | "submit" | "start_review" | "revise" | "close" | "cancel";
    note?: string | undefined;
}, {
    action: "approve" | "reject" | "submit" | "start_review" | "revise" | "close" | "cancel";
    note?: string | undefined;
}>;
export declare const SignPmSafetyWorkerBodySchema: z.ZodObject<{
    attestationText: z.ZodString;
}, "strip", z.ZodTypeAny, {
    attestationText: string;
}, {
    attestationText: string;
}>;
export declare const PmActorRoleHeaderSchema: z.ZodEnum<["ADMIN", "SUPERVISOR", "PROJECT_MANAGER", "WORKER"]>;
