"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
exports.scheduleRepository = {
    create(data) {
        return prisma_1.prisma.projectSchedule.create({ data });
    },
    findById(id, companyId) {
        return prisma_1.prisma.projectSchedule.findFirst({ where: { id, companyId } });
    },
    listByProject(projectId, companyId) {
        return prisma_1.prisma.projectSchedule.findMany({
            where: { projectId, companyId, status: { not: client_1.ScheduleStatus.cancelled } },
            orderBy: { startTime: 'asc' },
        });
    },
    update(id, companyId, data) {
        return prisma_1.prisma.projectSchedule.updateMany({ where: { id, companyId }, data });
    },
};
