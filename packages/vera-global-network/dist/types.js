"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertSeveritySchema = void 0;
const zod_1 = require("zod");
exports.AlertSeveritySchema = zod_1.z.enum(["critical", "high", "medium", "low"]);
//# sourceMappingURL=types.js.map