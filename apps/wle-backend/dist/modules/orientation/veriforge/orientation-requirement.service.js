"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationRequirementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const audit_log_service_1 = require("../../../audit/audit-log.service");
const audit_actions_1 = require("../../../audit/audit-actions");
let OrientationRequirementService = class OrientationRequirementService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async create(input, actor) {
        var _a, _b;
        const def = await this.prisma.orientationDefinition.findUnique({
            where: { id: input.orientationId },
        });
        if (!def)
            throw new common_1.NotFoundException('Orientation definition not found');
        if (!def.isPublished) {
            throw new common_1.BadRequestException('Only published orientations can be assigned as requirements');
        }
        if (def.companyId !== input.companyId) {
            throw new common_1.BadRequestException('orientationId does not belong to companyId');
        }
        const row = await this.prisma.orientationRequirement.create({
            data: {
                orientationId: input.orientationId,
                companyId: input.companyId,
                projectId: input.projectId,
                siteId: input.siteId,
                tradeId: input.tradeId,
                unionDispatchType: input.unionDispatchType,
                mustCompleteBefore: input.mustCompleteBefore,
                isActive: (_a = input.isActive) !== null && _a !== void 0 ? _a : true,
            },
            include: { orientation: true },
        });
        await this.auditLog.logAudit({ id: actor.id, companyId: (_b = actor.companyId) !== null && _b !== void 0 ? _b : input.companyId }, audit_actions_1.AuditAction.ORIENTATION_REQUIREMENT_CREATED, {
            type: audit_actions_1.AuditEntityType.ORIENTATION_REQUIREMENT,
            id: row.id,
            tenantId: input.companyId,
        }, {
            orientationId: row.orientationId,
            projectId: row.projectId,
            mustCompleteBefore: row.mustCompleteBefore,
        });
        return row;
    }
    async list(filters) {
        var _a, _b;
        if (filters.workerId) {
            const worker = await this.prisma.worker.findUnique({
                where: { id: filters.workerId },
                include: {
                    projectAssignments: {
                        where: { status: 'ACTIVE' },
                        take: 20,
                    },
                },
            });
            if (!worker)
                throw new common_1.NotFoundException('Worker not found');
            const projectIds = filters.projectId
                ? [filters.projectId]
                : worker.projectAssignments.map((a) => a.projectId);
            return this.resolveForWorker({
                workerId: filters.workerId,
                companyId: filters.companyId,
                projectId: projectIds[0],
                tradeId: (_b = (_a = worker.projectAssignments[0]) === null || _a === void 0 ? void 0 : _a.role) !== null && _b !== void 0 ? _b : undefined,
            });
        }
        return this.prisma.orientationRequirement.findMany({
            where: Object.assign(Object.assign({ companyId: filters.companyId }, (filters.projectId != null
                ? { OR: [{ projectId: filters.projectId }, { projectId: null }] }
                : {})), (filters.isActive != null ? { isActive: filters.isActive } : {})),
            include: { orientation: true },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
    }
    async update(id, input, actor) {
        var _a;
        const existing = await this.prisma.orientationRequirement.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException('Orientation requirement not found');
        const row = await this.prisma.orientationRequirement.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (input.projectId !== undefined ? { projectId: input.projectId } : {})), (input.siteId !== undefined ? { siteId: input.siteId } : {})), (input.tradeId !== undefined ? { tradeId: input.tradeId } : {})), (input.unionDispatchType !== undefined
                ? { unionDispatchType: input.unionDispatchType }
                : {})), (input.mustCompleteBefore != null
                ? { mustCompleteBefore: input.mustCompleteBefore }
                : {})), (input.isActive != null ? { isActive: input.isActive } : {})),
            include: { orientation: true },
        });
        await this.auditLog.logAudit({ id: actor.id, companyId: (_a = actor.companyId) !== null && _a !== void 0 ? _a : existing.companyId }, audit_actions_1.AuditAction.ORIENTATION_REQUIREMENT_UPDATED, {
            type: audit_actions_1.AuditEntityType.ORIENTATION_REQUIREMENT,
            id: row.id,
            tenantId: existing.companyId,
        }, { isActive: row.isActive });
        return row;
    }
    async resolveForWorker(input) {
        const clauses = [
            { companyId: input.companyId, projectId: null, siteId: null, tradeId: null },
        ];
        if (input.projectId != null) {
            clauses.push({ companyId: input.companyId, projectId: input.projectId });
        }
        if (input.siteId != null) {
            clauses.push({ companyId: input.companyId, siteId: input.siteId });
        }
        if (input.tradeId) {
            clauses.push({ companyId: input.companyId, tradeId: input.tradeId });
        }
        if (input.unionDispatchType) {
            clauses.push({
                companyId: input.companyId,
                unionDispatchType: input.unionDispatchType,
            });
        }
        const rows = await this.prisma.orientationRequirement.findMany({
            where: {
                isActive: true,
                OR: clauses,
            },
            include: {
                orientation: true,
            },
            take: 200,
        });
        const published = rows.filter((r) => r.orientation.isPublished);
        const byOrientation = new Map();
        for (const row of published) {
            byOrientation.set(row.orientationId, row);
        }
        return Array.from(byOrientation.values());
    }
};
exports.OrientationRequirementService = OrientationRequirementService;
exports.OrientationRequirementService = OrientationRequirementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], OrientationRequirementService);
//# sourceMappingURL=orientation-requirement.service.js.map