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
exports.InactivationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let InactivationService = class InactivationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async deactivateWorkerAtCompany(workerId, companyId, reason) {
        const now = new Date();
        await this.prisma.companyLink.updateMany({
            where: { workerId, companyId, active: true },
            data: { active: false, endDate: now },
        });
        if (reason === 'NEW_COMPANY_LINK') {
            await this.prisma.worker.update({
                where: { id: workerId },
                data: { companyId },
            });
        }
        else if (reason !== 'REMOVED_FROM_PROJECT') {
            const activeElsewhere = await this.prisma.companyLink.findFirst({
                where: { workerId, active: true, companyId: { not: companyId } },
            });
            if (!activeElsewhere) {
                await this.prisma.worker.update({
                    where: { id: workerId },
                    data: { companyId: null },
                });
            }
        }
        await this.prisma.projectAssignment.updateMany({
            where: {
                workerId,
                companyId,
                status: client_1.AssignmentStatus.ACTIVE,
            },
            data: {
                status: client_1.AssignmentStatus.REMOVED,
                endedAt: now,
            },
        });
        return { workerId, companyId, reason, deactivatedAt: now };
    }
    async deactivateEquipmentAtCompany(equipmentId, companyId, reason) {
        const now = new Date();
        const complianceStatus = reason === 'INSPECTION_FAILED'
            ? client_1.LinkComplianceStatus.LOCKED_OUT
            : undefined;
        await this.prisma.equipmentLink.updateMany({
            where: { equipmentId, companyId, active: true },
            data: Object.assign({ active: false, endDate: now }, (complianceStatus ? { complianceStatus } : {})),
        });
        if (reason === 'NEW_COMPANY_LINK') {
            await this.prisma.equipment.update({
                where: { id: equipmentId },
                data: { companyId },
            });
        }
        else if (reason !== 'REMOVED_FROM_PROJECT') {
            const activeElsewhere = await this.prisma.equipmentLink.findFirst({
                where: { equipmentId, active: true, companyId: { not: companyId } },
            });
            if (!activeElsewhere) {
                await this.prisma.equipment.update({
                    where: { id: equipmentId },
                    data: { companyId: null },
                });
            }
        }
        await this.prisma.equipmentProjectAssignment.updateMany({
            where: {
                equipmentId,
                companyId,
                status: client_1.AssignmentStatus.ACTIVE,
            },
            data: {
                status: client_1.AssignmentStatus.REMOVED,
                endedAt: now,
            },
        });
        return { equipmentId, companyId, reason, deactivatedAt: now };
    }
    async closeProject(projectId) {
        const now = new Date();
        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: { status: client_1.ProjectStatus.CLOSED, endDate: now },
        });
        await this.prisma.projectAssignment.updateMany({
            where: { projectId, status: client_1.AssignmentStatus.ACTIVE },
            data: { status: client_1.AssignmentStatus.COMPLETED, endedAt: now },
        });
        await this.prisma.equipmentProjectAssignment.updateMany({
            where: { projectId, status: client_1.AssignmentStatus.ACTIVE },
            data: { status: client_1.AssignmentStatus.COMPLETED, endedAt: now },
        });
        const workerIds = await this.prisma.projectAssignment.findMany({
            where: { projectId },
            select: { workerId: true },
            distinct: ['workerId'],
        });
        for (const { workerId } of workerIds) {
            const otherActive = await this.prisma.projectAssignment.count({
                where: {
                    workerId,
                    companyId: project.companyId,
                    status: client_1.AssignmentStatus.ACTIVE,
                    projectId: { not: projectId },
                },
            });
            if (otherActive === 0) {
                await this.deactivateWorkerAtCompany(workerId, project.companyId, 'PROJECT_CLOSED');
            }
        }
        const equipmentIds = await this.prisma.equipmentProjectAssignment.findMany({
            where: { projectId },
            select: { equipmentId: true },
            distinct: ['equipmentId'],
        });
        for (const { equipmentId } of equipmentIds) {
            const otherActive = await this.prisma.equipmentProjectAssignment.count({
                where: {
                    equipmentId,
                    companyId: project.companyId,
                    status: client_1.AssignmentStatus.ACTIVE,
                    projectId: { not: projectId },
                },
            });
            if (otherActive === 0) {
                await this.deactivateEquipmentAtCompany(equipmentId, project.companyId, 'PROJECT_CLOSED');
            }
        }
        return project;
    }
    async lockoutEquipment(equipmentId, reason) {
        const now = new Date();
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: {
                safetyStatus: 'UNSAFE',
                lockedOutAt: now,
                lockoutReason: reason,
            },
        });
        await this.prisma.equipmentLink.updateMany({
            where: { equipmentId, active: true },
            data: { complianceStatus: client_1.LinkComplianceStatus.LOCKED_OUT },
        });
        return { equipmentId, lockedOutAt: now, reason };
    }
};
exports.InactivationService = InactivationService;
exports.InactivationService = InactivationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InactivationService);
//# sourceMappingURL=inactivation.service.js.map