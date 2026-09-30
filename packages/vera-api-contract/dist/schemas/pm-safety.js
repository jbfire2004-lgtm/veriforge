"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmActorRoleHeaderSchema = exports.SignPmSafetyWorkerBodySchema = exports.TransitionPmSafetyWorkflowBodySchema = exports.CreatePmSafetyWorkflowBodySchema = exports.PmSafetyActionSchema = exports.PmSafetyWorkflowKindSchema = void 0;
const zod_1 = require("zod");
exports.PmSafetyWorkflowKindSchema = zod_1.z.enum([
    "PERMIT_TO_WORK",
    "JOB_SAFETY_ANALYSIS",
    "JHA",
    "FLHA",
    "SIF",
    "HECA",
    "ENERGY_WHEEL",
    "INSPECTION",
]);
exports.PmSafetyActionSchema = zod_1.z.enum([
    "submit",
    "start_review",
    "approve",
    "reject",
    "revise",
    "close",
    "cancel",
]);
/** Matches {@link CreatePmSafetyWorkflowDto} / Nest create body. */
exports.CreatePmSafetyWorkflowBodySchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    kind: exports.PmSafetyWorkflowKindSchema.optional(),
    companyId: zod_1.z.number().int().optional(),
    siteId: zod_1.z.number().int().optional(),
    workDescription: zod_1.z.string().optional(),
    hazardSummary: zod_1.z.string().optional(),
    controlMeasures: zod_1.z.string().optional(),
    jobLocation: zod_1.z.string().optional(),
    taskStepsJson: zod_1.z.string().optional(),
    validFrom: zod_1.z.string().optional(),
    validTo: zod_1.z.string().optional(),
});
/** Matches {@link TransitionPmSafetyWorkflowDto}. */
exports.TransitionPmSafetyWorkflowBodySchema = zod_1.z.object({
    action: exports.PmSafetyActionSchema,
    note: zod_1.z.string().max(2000).optional(),
});
exports.SignPmSafetyWorkerBodySchema = zod_1.z.object({
    attestationText: zod_1.z.string().min(1),
});
exports.PmActorRoleHeaderSchema = zod_1.z.enum([
    "ADMIN",
    "SUPERVISOR",
    "PROJECT_MANAGER",
    "WORKER",
]);
