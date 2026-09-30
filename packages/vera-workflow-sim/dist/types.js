"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraRoleSchema = exports.ScenarioKindSchema = exports.LifecycleCategorySchema = void 0;
const zod_1 = require("zod");
exports.LifecycleCategorySchema = zod_1.z.enum([
    "worker",
    "equipment",
    "training",
    "trainingProvider",
    "unionHall",
    "company",
    "project",
    "compliance",
    "inspection",
    "competency",
    "offlineSync",
    "dashboard",
]);
exports.ScenarioKindSchema = zod_1.z.enum([
    "happy",
    "edge",
    "error",
    "offline",
    "conflict",
    "multiUser",
    "multiCompany",
]);
exports.VeraRoleSchema = zod_1.z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "COMPANY_ADMIN",
    "SUPERVISOR",
    "PROJECT_MANAGER",
    "WORKER",
    "TRAINING_PROVIDER_ADMIN",
    "TRAINING_INSTRUCTOR",
    "UNION_HALL_ADMIN",
]);
//# sourceMappingURL=types.js.map