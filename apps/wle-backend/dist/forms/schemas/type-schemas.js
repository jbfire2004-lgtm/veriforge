"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFormTypeData = validateFormTypeData;
const zod_1 = require("zod");
const contextSchema = zod_1.z.object({
    projectId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    workerId: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    workDate: zod_1.z.string().optional(),
    workLocation: zod_1.z.string().optional(),
});
const jhaSchema = contextSchema.extend({
    jobTitle: zod_1.z.string().min(1),
    taskSteps: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.unknown())).min(1),
    hazards: zod_1.z.array(zod_1.z.unknown()).min(1),
});
const flhaSchema = contextSchema.extend({
    taskDescription: zod_1.z.string().min(1),
    hazards: zod_1.z.array(zod_1.z.unknown()).min(1),
    controlsAdequate: zod_1.z.enum(['yes', 'no', 'partial']),
});
const sifSchema = contextSchema.extend({
    activity: zod_1.z.string().min(1),
    sifPotential: zod_1.z.boolean(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'SIF']),
    criticalControls: zod_1.z.string().min(1),
});
const hecaSchema = contextSchema.extend({
    observationType: zod_1.z.enum(['HECA', 'safe', 'at_risk']),
    hecaCategory: zod_1.z.string().min(1),
    behaviorObserved: zod_1.z.string().min(1),
});
const energyWheelSchema = contextSchema.extend({
    taskDescription: zod_1.z.string().min(1),
    energyTypes: zod_1.z.array(zod_1.z.string()).min(1),
    controls: zod_1.z.string().min(1),
});
const inspectionSchema = contextSchema.extend({
    inspectionArea: zod_1.z.string().min(1),
    inspectionType: zod_1.z.string().min(1),
    complianceRating: zod_1.z.enum([
        'compliant',
        'minor_issues',
        'major_issues',
        'stop_work',
    ]),
    hazards: zod_1.z.array(zod_1.z.unknown()).min(1),
});
const SCHEMAS = {
    JHA: jhaSchema,
    FLHA: flhaSchema,
    SIF: sifSchema,
    HECA: hecaSchema,
    ENERGY_WHEEL: energyWheelSchema,
    INSPECTION: inspectionSchema,
};
function validateFormTypeData(formType, data, partial = false) {
    if (!formType || partial)
        return [];
    const schema = SCHEMAS[formType];
    if (!schema)
        return [];
    const result = schema.safeParse(data);
    if (result.success)
        return [];
    return result.error.issues.map((issue) => ({
        fieldId: issue.path.join('.') || 'form',
        message: issue.message,
    }));
}
//# sourceMappingURL=type-schemas.js.map