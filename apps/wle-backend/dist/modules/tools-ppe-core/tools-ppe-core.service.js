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
exports.ToolsPpeCoreService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const PPE_DEFAULT_EXPIRY_DAYS = {
    HARD_HAT: 1825,
    SAFETY_GLASSES: 365,
    GLOVES: 90,
    HARNESS: 365,
    FOOTWEAR: 180,
    HEARING: 365,
    RESPIRATOR: 30,
    COVERALL: 180,
    OTHER: 365,
};
const DEFAULT_TOOL_CHECKLIST = [
    { id: 'handle', label: 'Handle secure, no cracks', required: true },
    { id: 'head', label: 'Head / jaws / blade condition', required: true },
    { id: 'guard', label: 'Guards in place', required: true },
    { id: 'tag', label: 'Identification tag legible', required: false },
];
let ToolsPpeCoreService = class ToolsPpeCoreService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dashboard(companyId) {
        const where = companyId ? { companyId } : {};
        const ppeWhere = companyId ? { companyId } : {};
        const now = new Date();
        const warnDate = new Date();
        warnDate.setDate(warnDate.getDate() + 30);
        const [toolCount, toolsInspectionDue, ppeCount, ppeExpired, ppeExpiringSoon, activeToolAssignments, activePpeAssignments,] = await Promise.all([
            this.prisma.tool.count({ where }),
            this.prisma.tool.count({
                where: Object.assign(Object.assign({}, where), { OR: [
                        { status: client_1.ToolStatus.INSPECTION_DUE },
                        { nextInspectionAt: { lte: now } },
                    ] }),
            }),
            this.prisma.pPE.count({ where: ppeWhere }),
            this.prisma.pPE.count({
                where: Object.assign(Object.assign({}, ppeWhere), { status: client_1.PpeStatus.EXPIRED }),
            }),
            this.prisma.pPE.count({
                where: Object.assign(Object.assign({}, ppeWhere), { status: client_1.PpeStatus.ACTIVE, expiresAt: { lte: warnDate, gte: now } }),
            }),
            this.prisma.toolAssignment.count({
                where: Object.assign({ status: client_1.ToolsPpeAssignmentStatus.ACTIVE }, (companyId ? { companyId } : {})),
            }),
            this.prisma.pPEAssignment.count({
                where: Object.assign({ status: client_1.ToolsPpeAssignmentStatus.ACTIVE }, (companyId ? { companyId } : {})),
            }),
        ]);
        return {
            toolCount,
            toolsInspectionDue,
            ppeCount,
            ppeExpired,
            ppeExpiringSoon,
            activeToolAssignments,
            activePpeAssignments,
        };
    }
    async listTools(companyId) {
        return this.prisma.tool.findMany({
            where: companyId ? { companyId } : undefined,
            orderBy: { name: 'asc' },
            include: {
                assignments: {
                    where: { status: client_1.ToolsPpeAssignmentStatus.ACTIVE },
                    include: { worker: true, project: true },
                    take: 1,
                },
            },
        });
    }
    async createTool(dto) {
        var _a;
        const qrToken = `t-${(0, crypto_1.randomBytes)(8).toString('hex')}`;
        return this.prisma.tool.create({
            data: {
                companyId: dto.companyId,
                name: dto.name,
                serialNumber: dto.serialNumber,
                assetTag: dto.assetTag,
                category: dto.category,
                inspectionIntervalDays: (_a = dto.inspectionIntervalDays) !== null && _a !== void 0 ? _a : 90,
                notes: dto.notes,
                qrToken,
            },
        });
    }
    async getTool(id) {
        const tool = await this.prisma.tool.findUnique({
            where: { id },
            include: {
                inspections: { orderBy: { completedAt: 'desc' }, take: 25 },
                assignments: {
                    orderBy: { assignedAt: 'desc' },
                    include: { worker: true, project: true },
                },
            },
        });
        if (!tool)
            throw new common_1.NotFoundException('Tool not found');
        return Object.assign(Object.assign({}, tool), { defaultChecklist: DEFAULT_TOOL_CHECKLIST });
    }
    async updateTool(id, dto) {
        await this.getTool(id);
        return this.prisma.tool.update({
            where: { id },
            data: {
                name: dto.name,
                status: dto.status,
                notes: dto.notes,
            },
        });
    }
    async inspectTool(toolId, dto, inspectorUserId) {
        const tool = await this.getTool(toolId);
        const completedAt = new Date();
        const nextInspectionDate = new Date(completedAt);
        nextInspectionDate.setDate(nextInspectionDate.getDate() + tool.inspectionIntervalDays);
        const inspection = await this.prisma.toolInspection.create({
            data: {
                toolId,
                inspectorUserId,
                workerId: dto.workerId,
                passed: dto.passed,
                checklist: dto.checklist,
                notes: dto.notes,
                completedAt,
                nextInspectionDate: dto.passed ? nextInspectionDate : null,
            },
        });
        await this.prisma.tool.update({
            where: { id: toolId },
            data: {
                lastInspectionAt: completedAt,
                nextInspectionAt: dto.passed
                    ? nextInspectionDate
                    : tool.nextInspectionAt,
                status: dto.passed ? client_1.ToolStatus.ACTIVE : client_1.ToolStatus.INSPECTION_DUE,
            },
        });
        if (dto.workerId) {
            await this.syncWorkerWalletItem(dto.workerId, tool.companyId, `tool:${toolId}`, dto.passed ? 'ACTIVE' : 'FAILED', `Tool inspection ${dto.passed ? 'passed' : 'failed'}`);
        }
        return inspection;
    }
    async assignToolToWorker(toolId, dto, assignedBy) {
        const tool = await this.getTool(toolId);
        await this.closeActiveToolAssignments(toolId);
        const assignment = await this.prisma.toolAssignment.create({
            data: {
                toolId,
                workerId: dto.workerId,
                projectId: dto.projectId,
                companyId: tool.companyId,
                assignedBy,
            },
            include: { worker: true, project: true },
        });
        await this.syncWorkerWalletItem(dto.workerId, tool.companyId, `tool:${toolId}`, 'ACTIVE', `Assigned tool: ${tool.name}`);
        return assignment;
    }
    async assignToolToProject(toolId, dto, assignedBy) {
        const tool = await this.getTool(toolId);
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        await this.closeActiveToolAssignments(toolId);
        return this.prisma.toolAssignment.create({
            data: {
                toolId,
                workerId: dto.workerId,
                projectId: dto.projectId,
                companyId: project.companyId,
                assignedBy,
            },
            include: { worker: true, project: true },
        });
    }
    async returnTool(toolId) {
        await this.closeActiveToolAssignments(toolId);
        return { toolId, returned: true };
    }
    async listPpe(companyId) {
        await this.processPpeExpiry(companyId);
        return this.prisma.pPE.findMany({
            where: companyId ? { companyId } : undefined,
            orderBy: { expiresAt: 'asc' },
            include: {
                assignments: {
                    where: { status: client_1.ToolsPpeAssignmentStatus.ACTIVE },
                    include: { worker: true, project: true },
                    take: 1,
                },
            },
        });
    }
    async createPpe(dto) {
        const issuedAt = dto.issuedAt ? new Date(dto.issuedAt) : new Date();
        const expiresAt = dto.expiresAt
            ? new Date(dto.expiresAt)
            : this.defaultPpeExpiry(issuedAt, dto.ppeType);
        return this.prisma.pPE.create({
            data: {
                companyId: dto.companyId,
                name: dto.name,
                ppeType: dto.ppeType,
                serialNumber: dto.serialNumber,
                condition: dto.condition,
                notes: dto.notes,
                issuedAt,
                expiresAt,
                status: expiresAt < new Date() ? client_1.PpeStatus.EXPIRED : client_1.PpeStatus.ACTIVE,
            },
        });
    }
    async getPpe(id) {
        const ppe = await this.prisma.pPE.findUnique({
            where: { id },
            include: {
                inspections: { orderBy: { completedAt: 'desc' }, take: 25 },
                assignments: {
                    orderBy: { assignedAt: 'desc' },
                    include: { worker: true, project: true },
                },
            },
        });
        if (!ppe)
            throw new common_1.NotFoundException('PPE not found');
        return ppe;
    }
    async inspectPpe(ppeId, dto, inspectorUserId) {
        const ppe = await this.getPpe(ppeId);
        const completedAt = new Date();
        let extendedExpiresAt = null;
        if (dto.passed) {
            extendedExpiresAt = dto.extendedExpiresAt
                ? new Date(dto.extendedExpiresAt)
                : this.defaultPpeExpiry(completedAt, ppe.ppeType);
        }
        const inspection = await this.prisma.pPEInspection.create({
            data: {
                ppeId,
                inspectorUserId,
                workerId: dto.workerId,
                passed: dto.passed,
                checklist: dto.checklist,
                notes: dto.notes,
                completedAt,
                extendedExpiresAt,
            },
        });
        if (dto.passed && extendedExpiresAt) {
            await this.prisma.pPE.update({
                where: { id: ppeId },
                data: {
                    expiresAt: extendedExpiresAt,
                    status: client_1.PpeStatus.ACTIVE,
                },
            });
        }
        else if (!dto.passed) {
            await this.prisma.pPE.update({
                where: { id: ppeId },
                data: { status: client_1.PpeStatus.EXPIRED },
            });
        }
        if (dto.workerId) {
            await this.syncWorkerWalletItem(dto.workerId, ppe.companyId, `ppe:${ppeId}`, dto.passed ? 'ACTIVE' : 'FAILED', `PPE inspection ${dto.passed ? 'passed' : 'failed'}`);
        }
        return inspection;
    }
    async assignPpeToWorker(ppeId, dto, assignedBy) {
        const ppe = await this.getPpe(ppeId);
        if (ppe.status === client_1.PpeStatus.EXPIRED) {
            throw new common_1.BadRequestException('Cannot assign expired PPE');
        }
        await this.closeActivePpeAssignments(ppeId);
        const assignment = await this.prisma.pPEAssignment.create({
            data: {
                ppeId,
                workerId: dto.workerId,
                projectId: dto.projectId,
                companyId: ppe.companyId,
                assignedBy,
            },
            include: { worker: true, project: true },
        });
        await this.syncWorkerWalletItem(dto.workerId, ppe.companyId, `ppe:${ppeId}`, 'ACTIVE', `Assigned PPE: ${ppe.name}`);
        return assignment;
    }
    async assignPpeToProject(ppeId, dto, assignedBy) {
        const ppe = await this.getPpe(ppeId);
        if (!dto.workerId) {
            throw new common_1.BadRequestException('workerId required for PPE project assignment');
        }
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this.assignPpeToWorker(ppeId, { workerId: dto.workerId, projectId: dto.projectId }, assignedBy);
    }
    async returnPpe(ppeId) {
        await this.closeActivePpeAssignments(ppeId);
        return { ppeId, returned: true };
    }
    async processPpeExpiry(companyId) {
        const now = new Date();
        const expired = await this.prisma.pPE.updateMany({
            where: Object.assign(Object.assign({}, (companyId ? { companyId } : {})), { status: client_1.PpeStatus.ACTIVE, expiresAt: { lt: now } }),
            data: { status: client_1.PpeStatus.EXPIRED },
        });
        const dueTools = await this.prisma.tool.updateMany({
            where: Object.assign(Object.assign({}, (companyId ? { companyId } : {})), { status: client_1.ToolStatus.ACTIVE, nextInspectionAt: { lt: now } }),
            data: { status: client_1.ToolStatus.INSPECTION_DUE },
        });
        return { ppeExpired: expired.count, toolsMarkedDue: dueTools.count };
    }
    async getWorkerToolsPpe(workerId) {
        const [tools, ppe] = await Promise.all([
            this.prisma.toolAssignment.findMany({
                where: { workerId, status: client_1.ToolsPpeAssignmentStatus.ACTIVE },
                include: { tool: true, project: true },
            }),
            this.prisma.pPEAssignment.findMany({
                where: { workerId, status: client_1.ToolsPpeAssignmentStatus.ACTIVE },
                include: { ppe: true, project: true },
            }),
        ]);
        return { tools, ppe };
    }
    defaultPpeExpiry(from, ppeType) {
        var _a;
        const d = new Date(from);
        d.setDate(d.getDate() + ((_a = PPE_DEFAULT_EXPIRY_DAYS[ppeType]) !== null && _a !== void 0 ? _a : 365));
        return d;
    }
    async closeActiveToolAssignments(toolId) {
        await this.prisma.toolAssignment.updateMany({
            where: { toolId, status: client_1.ToolsPpeAssignmentStatus.ACTIVE },
            data: {
                status: client_1.ToolsPpeAssignmentStatus.RETURNED,
                returnedAt: new Date(),
            },
        });
    }
    async closeActivePpeAssignments(ppeId) {
        await this.prisma.pPEAssignment.updateMany({
            where: { ppeId, status: client_1.ToolsPpeAssignmentStatus.ACTIVE },
            data: {
                status: client_1.ToolsPpeAssignmentStatus.RETURNED,
                returnedAt: new Date(),
            },
        });
    }
    async syncWorkerWalletItem(workerId, companyId, catalogTypeKey, status, notes) {
        const existing = await this.prisma.workerWalletItem.findFirst({
            where: { workerId, catalogTypeKey },
        });
        if (existing) {
            await this.prisma.workerWalletItem.update({
                where: { id: existing.id },
                data: { status, notes, updatedAt: new Date() },
            });
        }
        else {
            await this.prisma.workerWalletItem.create({
                data: { workerId, companyId, catalogTypeKey, status, notes },
            });
        }
    }
};
exports.ToolsPpeCoreService = ToolsPpeCoreService;
exports.ToolsPpeCoreService = ToolsPpeCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ToolsPpeCoreService);
//# sourceMappingURL=tools-ppe-core.service.js.map