"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseActionStatusSchema = exports.AutomationModuleSchema = void 0;
const zod_1 = require("zod");
exports.AutomationModuleSchema = zod_1.z.enum([
    "safety",
    "operations",
    "scheduling",
    "compliance",
    "document",
    "twin",
    "data",
    "cross_module",
    "multi_entity",
    "workflow",
    "rules",
]);
exports.EnterpriseActionStatusSchema = zod_1.z.enum([
    "pending",
    "executed",
    "queued",
    "failed",
    "overridden",
    "rolled_back",
    "superseded",
]);
//# sourceMappingURL=types.js.map