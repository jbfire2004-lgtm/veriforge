"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workPackageRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? []);
}
exports.workPackageRepository = {
    create(data) {
        return prisma_1.prisma.workPackage.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                requiredEquipment: json(data.requiredEquipment),
                requiredWorkers: json(data.requiredWorkers),
                requiredTraining: json(data.requiredTraining),
                requiredJha: json(data.requiredJha),
                requiredInspections: json(data.requiredInspections),
                requiredPermits: json(data.requiredPermits),
                status: data.status ?? client_1.WorkPackageStatus.draft,
            },
        });
    },
    findById(id, companyId) {
        return prisma_1.prisma.workPackage.findFirst({ where: { id, companyId } });
    },
    listByProject(projectId, companyId) {
        return prisma_1.prisma.workPackage.findMany({
            where: { projectId, companyId },
            orderBy: { createdAt: 'desc' },
        });
    },
    updateRequirements(id, companyId, data) {
        return prisma_1.prisma.workPackage.updateMany({
            where: { id, companyId },
            data: {
                requiredEquipment: data.requiredEquipment !== undefined ? json(data.requiredEquipment) : undefined,
                requiredWorkers: data.requiredWorkers !== undefined ? json(data.requiredWorkers) : undefined,
                requiredTraining: data.requiredTraining !== undefined ? json(data.requiredTraining) : undefined,
                requiredJha: data.requiredJha !== undefined ? json(data.requiredJha) : undefined,
                requiredInspections: data.requiredInspections !== undefined ? json(data.requiredInspections) : undefined,
                requiredPermits: data.requiredPermits !== undefined ? json(data.requiredPermits) : undefined,
                status: data.status,
                version: data.version,
            },
        });
    },
};
