"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? []);
}
exports.trainingRepository = {
    createCourse(data) {
        return prisma_1.prisma.trainingCourse.create({ data });
    },
    findCourse(id, companyId) {
        return prisma_1.prisma.trainingCourse.findFirst({ where: { id, companyId } });
    },
    upsertMatrix(data) {
        return prisma_1.prisma.trainingMatrix.upsert({
            where: { companyId_role: { companyId: data.companyId, role: data.role } },
            create: {
                companyId: data.companyId,
                role: data.role,
                requiredCourses: json(data.requiredCourses),
            },
            update: {
                requiredCourses: json(data.requiredCourses),
                version: data.version,
            },
        });
    },
    findMatrix(companyId, role) {
        return prisma_1.prisma.trainingMatrix.findUnique({
            where: { companyId_role: { companyId, role } },
        });
    },
    assignTraining(data) {
        return prisma_1.prisma.workerTraining.create({
            data: {
                companyId: data.companyId,
                workerId: data.workerId,
                courseId: data.courseId,
                status: client_1.TrainingStatus.assigned,
            },
            include: { course: true },
        });
    },
    findWorkerTraining(id, companyId) {
        return prisma_1.prisma.workerTraining.findFirst({
            where: { id, companyId },
            include: { course: true },
        });
    },
    updateWorkerTraining(id, companyId, data) {
        return prisma_1.prisma.workerTraining.updateMany({
            where: { id, companyId },
            data,
        });
    },
    findWorkerRecords(workerId, companyId) {
        return prisma_1.prisma.workerTraining.findMany({
            where: { workerId, companyId },
            include: { course: true },
            orderBy: { assignedAt: 'desc' },
        });
    },
    markExpired(ids) {
        if (ids.length === 0)
            return Promise.resolve({ count: 0 });
        return prisma_1.prisma.workerTraining.updateMany({
            where: { id: { in: ids } },
            data: { status: client_1.TrainingStatus.expired },
        });
    },
};
