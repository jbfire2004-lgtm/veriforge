"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadinessLevelSchema = void 0;
const zod_1 = require("zod");
exports.ReadinessLevelSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
//# sourceMappingURL=types.js.map