"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskLevelSchema = exports.IntelligenceModuleSchema = void 0;
const zod_1 = require("zod");
exports.IntelligenceModuleSchema = zod_1.z.enum([
    "worker",
    "equipment",
    "training",
    "provider",
    "unionHall",
    "company",
    "project",
    "compliance",
    "inspection",
    "competency",
    "dashboard",
    "offline",
]);
exports.RiskLevelSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
//# sourceMappingURL=types.js.map