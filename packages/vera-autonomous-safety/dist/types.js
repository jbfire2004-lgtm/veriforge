"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionTypeSchema = exports.SafetyFormKindSchema = exports.EnergyTypeSchema = void 0;
const zod_1 = require("zod");
exports.EnergyTypeSchema = zod_1.z.enum([
    "gravity",
    "motion",
    "mechanical",
    "electrical",
    "chemical",
    "pressure",
    "thermal",
    "radiation",
    "biological",
]);
exports.SafetyFormKindSchema = zod_1.z.enum([
    "JHA",
    "FLHA",
    "SIF",
    "HECA",
    "ENERGY_WHEEL",
    "INSPECTION",
    "PERMIT_TO_WORK",
]);
exports.InterventionTypeSchema = zod_1.z.enum([
    "notify_supervisor",
    "lockout_equipment",
    "restrict_worker",
    "require_training",
    "require_inspection",
    "require_jha_update",
    "escalate_management",
]);
//# sourceMappingURL=types.js.map