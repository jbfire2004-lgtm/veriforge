"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionModuleSchema = exports.DocumentTypeSchema = void 0;
const zod_1 = require("zod");
exports.DocumentTypeSchema = zod_1.z.enum([
    "training_certificate",
    "inspection_form",
    "equipment_plate",
    "worker_id",
    "union_card",
    "operator_card",
    "provider_approval",
    "instructor_qualification",
    "project_safety_form",
    "ppe_label",
    "generic",
]);
exports.VisionModuleSchema = zod_1.z.enum([
    "training",
    "inspection",
    "equipment",
    "worker",
    "provider",
    "project",
    "offline",
    "dashboard",
]);
//# sourceMappingURL=types.js.map