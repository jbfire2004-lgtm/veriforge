"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? []);
}
exports.taskRepository = {
    create(data) {
        return prisma_1.prisma.task.create({
            data: {
                companyId: data.companyId,
                workPackageId: data.workPackageId,
                title: data.title,
                description: data.description,
                taskType: data.taskType,
                requiredSkills: json(data.requiredSkills),
                requiredEquipment: json(data.requiredEquipment),
                requiredTraining: json(data.requiredTraining),
                requiredControls: json(data.requiredControls),
                requiredPpe: json(data.requiredPpe),
                requiredJha: json(data.requiredJha),
                status: data.status ?? client_1.TaskStatus.draft,
            },
        });
    },
    findById(id, companyId) {
        return prisma_1.prisma.task.findFirst({
            where: { id, companyId },
            include: { assignments: true },
        });
    },
    listByWorkPackage(workPackageId, companyId) {
        return prisma_1.prisma.task.findMany({
            where: { workPackageId, companyId },
            include: { assignments: true },
            orderBy: { createdAt: 'desc' },
        });
    },
    updateRequirements(id, companyId, data) {
        return prisma_1.prisma.task.updateMany({
            where: { id, companyId },
            data: {
                requiredSkills: data.requiredSkills !== undefined ? json(data.requiredSkills) : undefined,
                requiredEquipment: data.requiredEquipment !== undefined ? json(data.requiredEquipment) : undefined,
                requiredTraining: data.requiredTraining !== undefined ? json(data.requiredTraining) : undefined,
                requiredControls: data.requiredControls !== undefined ? json(data.requiredControls) : undefined,
                requiredPpe: data.requiredPpe !== undefined ? json(data.requiredPpe) : undefined,
                requiredJha: data.requiredJha !== undefined ? json(data.requiredJha) : undefined,
                status: data.status,
                version: data.version,
            },
        });
    },
    updateLifecycle(id, companyId, data) {
        return prisma_1.prisma.task.updateMany({ where: { id, companyId }, data });
    },
    upsertAssignment(taskId, assigneeType, assigneeId) {
        return prisma_1.prisma.taskAssignment.upsert({
            where: { taskId_assigneeType_assigneeId: { taskId, assigneeType, assigneeId } },
            create: { taskId, assigneeType, assigneeId },
            update: { assignedAt: new Date() },
        });
    },
    syncAssignments(taskId, workers, equipment) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.taskAssignment.deleteMany({ where: { taskId } });
            const rows = [
                ...workers.map((id) => ({ taskId, assigneeType: 'worker', assigneeId: id })),
                ...equipment.map((id) => ({ taskId, assigneeType: 'equipment', assigneeId: id })),
            ];
            if (rows.length > 0) {
                await tx.taskAssignment.createMany({ data: rows });
            }
        });
    },
};
