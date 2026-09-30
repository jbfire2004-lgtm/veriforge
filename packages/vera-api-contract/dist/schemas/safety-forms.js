"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitSafetyFormBodySchema = exports.CreateSafetyFormBodySchema = exports.SafetyFormDefinitionSchema = exports.SafetyFormFieldSchema = exports.SafetyFormFieldTypeSchema = void 0;
const zod_1 = require("zod");
exports.SafetyFormFieldTypeSchema = zod_1.z.enum([
    'text',
    'number',
    'select',
    'multiselect',
    'date',
    'signature',
    'photo',
    'hazard',
    'risk',
    'energy',
    'checklist',
    'table',
    'location',
    'project',
    'worker',
    'equipment',
    'textarea',
    'boolean',
]);
exports.SafetyFormFieldSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: exports.SafetyFormFieldTypeSchema,
    label: zod_1.z.string(),
    required: zod_1.z.boolean().optional(),
    options: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.object({ value: zod_1.z.string(), label: zod_1.z.string() })])).optional(),
    placeholder: zod_1.z.string().optional(),
    conditional: zod_1.z.record(zod_1.z.unknown()).optional(),
    validation: zod_1.z.record(zod_1.z.unknown()).optional(),
    defaultValue: zod_1.z.unknown().optional(),
    helpText: zod_1.z.string().optional(),
});
exports.SafetyFormDefinitionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    category: zod_1.z.string(),
    version: zod_1.z.number(),
    fields: zod_1.z.array(exports.SafetyFormFieldSchema),
    workflow: zod_1.z
        .object({
        requiresSupervisor: zod_1.z.boolean().optional(),
        autoGenerateCorrectiveActions: zod_1.z.boolean().optional(),
        autoFlagSIF: zod_1.z.boolean().optional(),
        autoFlagHECA: zod_1.z.boolean().optional(),
    })
        .optional(),
});
exports.CreateSafetyFormBodySchema = zod_1.z.object({
    definitionId: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    formData: zod_1.z.record(zod_1.z.unknown()).optional(),
    companyId: zod_1.z.number().optional(),
    projectId: zod_1.z.number().optional(),
    siteId: zod_1.z.number().optional(),
    workerId: zod_1.z.number().optional(),
    equipmentId: zod_1.z.number().optional(),
    clientSyncId: zod_1.z.string().optional(),
});
exports.SubmitSafetyFormBodySchema = zod_1.z.object({
    formData: zod_1.z.record(zod_1.z.unknown()),
    signatures: zod_1.z
        .array(zod_1.z.object({
        fieldId: zod_1.z.string().optional(),
        signatureData: zod_1.z.string(),
        signerName: zod_1.z.string().optional(),
    }))
        .optional(),
});
