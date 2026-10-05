"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSafetyFormLinks = resolveSafetyFormLinks;
const common_1 = require("@nestjs/common");
async function resolveSafetyFormLinks(prisma, input, options = {}) {
    var _a, _b;
    const strict = options.strict === true;
    const resolved = {};
    if (input.companyId != null) {
        const row = await prisma.company.findUnique({
            where: { id: input.companyId },
            select: { id: true },
        });
        if (!row) {
            if (strict) {
                throw new common_1.BadRequestException(`Company ${input.companyId} not found`);
            }
        }
        else {
            resolved.companyId = row.id;
        }
    }
    if (input.projectId != null) {
        const row = await prisma.project.findUnique({
            where: { id: input.projectId },
            select: { id: true, companyId: true, siteId: true },
        });
        if (!row) {
            if (strict) {
                throw new common_1.BadRequestException(`Project ${input.projectId} not found. Choose a valid project in the form or open Safety Forms from a project that exists in the database.`);
            }
        }
        else {
            resolved.projectId = row.id;
            resolved.companyId = (_a = resolved.companyId) !== null && _a !== void 0 ? _a : row.companyId;
            if (row.siteId != null)
                resolved.siteId = row.siteId;
        }
    }
    if (input.siteId != null) {
        const row = await prisma.site.findUnique({
            where: { id: input.siteId },
            select: { id: true },
        });
        if (!row) {
            if (strict)
                throw new common_1.BadRequestException(`Site ${input.siteId} not found`);
        }
        else {
            resolved.siteId = row.id;
        }
    }
    if (input.workerId != null) {
        const row = await prisma.worker.findUnique({
            where: { id: input.workerId },
            select: { id: true, companyId: true },
        });
        if (!row) {
            if (strict) {
                throw new common_1.BadRequestException(`Worker ${input.workerId} not found`);
            }
        }
        else {
            resolved.workerId = row.id;
            if (row.companyId != null) {
                resolved.companyId = (_b = resolved.companyId) !== null && _b !== void 0 ? _b : row.companyId;
            }
        }
    }
    if (input.equipmentId != null) {
        const row = await prisma.equipment.findUnique({
            where: { id: input.equipmentId },
            select: { id: true },
        });
        if (!row) {
            if (strict) {
                throw new common_1.BadRequestException(`Equipment ${input.equipmentId} not found`);
            }
        }
        else {
            resolved.equipmentId = row.id;
        }
    }
    return resolved;
}
//# sourceMappingURL=resolve-safety-form-links.js.map