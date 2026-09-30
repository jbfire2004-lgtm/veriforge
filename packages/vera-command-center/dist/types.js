"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwinEntityTypeSchema = exports.AlertTypeSchema = exports.AlertSeveritySchema = void 0;
const zod_1 = require("zod");
exports.AlertSeveritySchema = zod_1.z.enum(["critical", "high", "medium", "low"]);
exports.AlertTypeSchema = zod_1.z.enum([
    "safety",
    "compliance",
    "operations",
    "scheduling",
    "dispatch",
    "equipment",
    "training",
    "document",
    "automation",
]);
exports.TwinEntityTypeSchema = zod_1.z.enum([
    "worker",
    "equipment",
    "project",
    "company",
    "provider",
    "unionHall",
]);
//# sourceMappingURL=types.js.map