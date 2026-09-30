"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionModeSchema = exports.BrainHorizonSchema = void 0;
const zod_1 = require("zod");
exports.BrainHorizonSchema = zod_1.z.enum(["daily", "weekly", "monthly"]);
exports.DecisionModeSchema = zod_1.z.enum(["autonomous", "assisted", "supervisor", "override", "escalation"]);
//# sourceMappingURL=types.js.map