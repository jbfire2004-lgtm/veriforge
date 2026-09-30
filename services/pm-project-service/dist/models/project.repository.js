"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? {});
}
exports.projectRepository = {
    async createProject(data) {
        const project = await prisma_1.prisma.project.create({
            data: {
                companyId: data.companyId,
                name: data.name,
                type: data.type,
                scope: data.scope,
                startDate: data.startDate,
                endDate: data.endDate,
                riskLevel: data.riskLevel ?? client_1.RiskLevel.low,
                metadata: json(data.metadata),
                createdBy: data.createdBy,
            },
        });
        for (const wp of data.workPackages ?? []) {
            const workPackage = await prisma_1.prisma.workPackage.create({
                data: {
                    projectId: project.id,
                    companyId: data.companyId,
                    name: wp.name,
                    description: wp.description,
                },
            });
            for (const task of wp.tasks ?? []) {
                await prisma_1.prisma.projectTask.create({
                    data: {
                        projectId: project.id,
                        workPackageId: workPackage.id,
                        companyId: data.companyId,
                        name: task.name,
                        linkedEntityType: task.linkedEntityType,
                        linkedEntityId: task.linkedEntityId,
                    },
                });
            }
        }
        return prisma_1.prisma.project.findFirstOrThrow({
            where: { id: project.id },
            include: {
                workPackages: { include: { tasks: true }, orderBy: { createdAt: 'asc' } },
            },
        });
    },
    findProject(id, companyId) {
        return prisma_1.prisma.project.findFirst({
            where: { id, companyId },
            include: {
                workPackages: { include: { tasks: true }, orderBy: { createdAt: 'asc' } },
            },
        });
    },
    listByCompany(companyId) {
        return prisma_1.prisma.project.findMany({
            where: { companyId },
            include: {
                workPackages: { include: { _count: { select: { tasks: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    updateRiskLevel(id, companyId, riskLevel) {
        return prisma_1.prisma.project.updateMany({
            where: { id, companyId },
            data: { riskLevel },
        });
    },
    updateMetadata(id, companyId, metadata) {
        return prisma_1.prisma.project.updateMany({
            where: { id, companyId },
            data: { metadata: json(metadata) },
        });
    },
    createWorkPackage(data) {
        return prisma_1.prisma.workPackage.create({ data });
    },
    createTask(data) {
        return prisma_1.prisma.projectTask.create({ data });
    },
};
