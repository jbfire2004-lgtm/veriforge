import { ScheduleStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

export const scheduleRepository = {
  create(data: {
    companyId: string;
    projectId: string;
    taskId?: string;
    workerId?: string;
    equipmentId?: string;
    startTime: Date;
    endTime: Date;
    status: ScheduleStatus;
  }) {
    return prisma.projectSchedule.create({ data });
  },

  findById(id: string, companyId: string) {
    return prisma.projectSchedule.findFirst({ where: { id, companyId } });
  },

  listByProject(projectId: string, companyId: string) {
    return prisma.projectSchedule.findMany({
      where: { projectId, companyId, status: { not: ScheduleStatus.cancelled } },
      orderBy: { startTime: 'asc' },
    });
  },

  update(
    id: string,
    companyId: string,
    data: {
      taskId?: string | null;
      workerId?: string | null;
      equipmentId?: string | null;
      startTime?: Date;
      endTime?: Date;
      status?: ScheduleStatus;
    },
  ) {
    return prisma.projectSchedule.updateMany({ where: { id, companyId }, data });
  },
};
