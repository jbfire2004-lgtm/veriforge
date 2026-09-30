import { Prisma, TrainingStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? []) as Prisma.InputJsonValue;
}

export const trainingRepository = {
  createCourse(data: {
    companyId: string;
    name: string;
    category: string;
    provider?: string;
    durationHours?: number;
    expiryDays?: number;
  }) {
    return prisma.trainingCourse.create({ data });
  },

  findCourse(id: string, companyId: string) {
    return prisma.trainingCourse.findFirst({ where: { id, companyId } });
  },

  upsertMatrix(data: {
    companyId: string;
    role: string;
    requiredCourses: unknown;
    version?: number;
  }) {
    return prisma.trainingMatrix.upsert({
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

  findMatrix(companyId: string, role: string) {
    return prisma.trainingMatrix.findUnique({
      where: { companyId_role: { companyId, role } },
    });
  },

  assignTraining(data: {
    companyId: string;
    workerId: string;
    courseId: string;
  }) {
    return prisma.workerTraining.create({
      data: {
        companyId: data.companyId,
        workerId: data.workerId,
        courseId: data.courseId,
        status: TrainingStatus.assigned,
      },
      include: { course: true },
    });
  },

  findWorkerTraining(id: string, companyId: string) {
    return prisma.workerTraining.findFirst({
      where: { id, companyId },
      include: { course: true },
    });
  },

  updateWorkerTraining(
    id: string,
    companyId: string,
    data: Partial<{
      status: TrainingStatus;
      completionDate: Date;
      expiryDate: Date;
      competencyLevel: string;
      competencyScore: number;
      certificatePath: string;
      verifiedAt: Date;
      verifiedBy: string;
    }>,
  ) {
    return prisma.workerTraining.updateMany({
      where: { id, companyId },
      data,
    });
  },

  findWorkerRecords(workerId: string, companyId: string) {
    return prisma.workerTraining.findMany({
      where: { workerId, companyId },
      include: { course: true },
      orderBy: { assignedAt: 'desc' },
    });
  },

  markExpired(ids: string[]) {
    if (ids.length === 0) return Promise.resolve({ count: 0 });
    return prisma.workerTraining.updateMany({
      where: { id: { in: ids } },
      data: { status: TrainingStatus.expired },
    });
  },
};
