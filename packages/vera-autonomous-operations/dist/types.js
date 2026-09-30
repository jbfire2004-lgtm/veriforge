"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionStatusSchema = exports.ActionTypeSchema = void 0;
const zod_1 = require("zod");
exports.ActionTypeSchema = zod_1.z.enum([
    "dispatch.assign",
    "dispatch.recall",
    "dispatch.escalate",
    "assignment.worker",
    "assignment.equipment",
    "assignment.operator",
    "assignment.crew",
    "lockout.apply",
    "lockout.release",
    "restriction.apply",
    "restriction.lift",
    "roster.build",
    "roster.correct",
    "conflict.resolve",
    "readiness.correct",
    "readiness.trigger_training",
    "readiness.trigger_inspection",
    "notify.worker",
    "notify.supervisor",
    "notify.union_hall",
]);
exports.ActionStatusSchema = zod_1.z.enum([
    "pending",
    "executed",
    "queued",
    "failed",
    "overridden",
    "rolled_back",
]);
//# sourceMappingURL=types.js.map