"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsFindingTagsInputSchema = exports.SmsHecaLibraryEntrySchema = exports.SmsRiskContextSchema = exports.PmSmsEntityTypeSchema = exports.PmEnergyControlStateSchema = exports.PmSclStateSchema = void 0;
const zod_1 = require("zod");
exports.PmSclStateSchema = zod_1.z.enum(['safe', 'conditional', 'loss']);
exports.PmEnergyControlStateSchema = zod_1.z.enum([
    'controlled',
    'uncontrolled',
    'partially_controlled',
]);
exports.PmSmsEntityTypeSchema = zod_1.z.enum([
    'inspection_finding',
    'inspection_deficiency',
    'corrective_action',
    'safety_event',
    'investigation',
    'substance_test',
    'equipment_inspection',
    'jha_task',
]);
exports.SmsRiskContextSchema = zod_1.z.object({
    id: zod_1.z.string(),
    companyId: zod_1.z.number(),
    projectId: zod_1.z.number().nullable().optional(),
    entityType: exports.PmSmsEntityTypeSchema,
    entityId: zod_1.z.string(),
    sclState: exports.PmSclStateSchema.nullable().optional(),
    hecaInvolved: zod_1.z.boolean(),
    hecaType: zod_1.z.string().nullable().optional(),
    hecaCategoryCode: zod_1.z.string().nullable().optional(),
    energyTypesJson: zod_1.z.array(zod_1.z.string()),
    energyControlState: exports.PmEnergyControlStateSchema.nullable().optional(),
    highEnergyFlag: zod_1.z.boolean(),
    escalationScore: zod_1.z.number(),
    requiresInvestigation: zod_1.z.boolean(),
});
exports.SmsHecaLibraryEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    code: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    hecaType: zod_1.z.enum(['critical_task', 'critical_equipment', 'both']),
    requiredControlsJson: zod_1.z.array(zod_1.z.string()),
    verificationStepsJson: zod_1.z.array(zod_1.z.string()),
    energyTypesJson: zod_1.z.array(zod_1.z.string()),
});
exports.SmsFindingTagsInputSchema = zod_1.z.object({
    companyId: zod_1.z.number(),
    projectId: zod_1.z.number(),
    baseSeverity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    sclState: exports.PmSclStateSchema.optional(),
    hecaInvolved: zod_1.z.boolean().optional(),
    hecaType: zod_1.z.string().optional(),
    hecaCategoryCode: zod_1.z.string().optional(),
    energyTypes: zod_1.z.array(zod_1.z.string()).optional(),
    energyControlState: exports.PmEnergyControlStateSchema.optional(),
    highEnergyFlag: zod_1.z.boolean().optional(),
});
