"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwinEventSchema = exports.TwinTypeSchema = void 0;
const zod_1 = require("zod");
exports.TwinTypeSchema = zod_1.z.enum([
    "worker",
    "equipment",
    "project",
    "company",
    "provider",
    "unionHall",
]);
exports.TwinEventSchema = zod_1.z.enum([
    "worker.created",
    "worker.linked",
    "worker.unlinked",
    "worker.updated",
    "project.assigned",
    "project.removed",
    "project.closed",
    "training.uploaded",
    "training.validated",
    "training.expired",
    "inspection.completed",
    "inspection.failed",
    "equipment.created",
    "equipment.linked",
    "equipment.locked",
    "equipment.unlocked",
    "competency.evaluated",
    "provider.approved",
    "provider.rejected",
    "document.uploaded",
    "safety.form.completed",
    "dispatch.created",
    "dispatch.recalled",
    "member.added",
    "compliance.recalc",
    "sync.batch",
    "twin.offline",
    "twin.synced",
]);
//# sourceMappingURL=types.js.map