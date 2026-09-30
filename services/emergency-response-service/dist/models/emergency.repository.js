"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? []);
}
exports.emergencyRepository = {
    createEvent(data) {
        return prisma_1.prisma.emergencyEvent.create({ data });
    },
    findEvent(id, companyId) {
        return prisma_1.prisma.emergencyEvent.findFirst({
            where: { id, companyId },
            include: {
                musterSessions: {
                    include: { attendance: true },
                    orderBy: { startedAt: 'desc' },
                },
                notifications: true,
            },
        });
    },
    updateEventStatus(id, companyId, data) {
        return prisma_1.prisma.emergencyEvent.updateMany({ where: { id, companyId }, data });
    },
    createMusterSession(data) {
        return prisma_1.prisma.musterSession.create({
            data: {
                emergencyId: data.emergencyId,
                musterPoint: data.musterPoint,
                expectedRoster: json(data.expectedRoster),
            },
        });
    },
    findOpenMusterSession(emergencyId) {
        return prisma_1.prisma.musterSession.findFirst({
            where: { emergencyId, status: client_1.MusterSessionStatus.open },
            include: { attendance: true },
            orderBy: { startedAt: 'desc' },
        });
    },
    closeMusterSession(id) {
        return prisma_1.prisma.musterSession.update({
            where: { id },
            data: { status: client_1.MusterSessionStatus.closed, endedAt: new Date() },
        });
    },
    upsertAttendance(data) {
        return prisma_1.prisma.musterAttendance.upsert({
            where: {
                sessionId_workerId: { sessionId: data.sessionId, workerId: data.workerId },
            },
            create: data,
            update: {
                status: data.status,
                checkInTime: data.checkInTime ?? new Date(),
            },
        });
    },
    createPlan(data) {
        return prisma_1.prisma.emergencyPlan.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                planType: data.planType,
                title: data.title,
                content: json(data.content ?? {}),
                filePath: data.filePath,
                version: data.version ?? 1,
            },
        });
    },
    createEquipment(data) {
        return prisma_1.prisma.emergencyEquipment.create({ data });
    },
    createNotification(data) {
        return prisma_1.prisma.emergencyNotification.create({ data });
    },
};
