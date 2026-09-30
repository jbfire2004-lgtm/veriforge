import { Prisma, TaskStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? []) as Prisma.InputJsonValue;
}

export const taskRepository = {
  create(data: {
    companyId: string;
    workPackageId: string;
    title: string;
    description?: string;
    taskType?: string;
    requiredSkills?: unknown;
    requiredEquipment?: unknown;
    requiredTraining?: unknown;
    requiredControls?: unknown;
    requiredPpe?: unknown;
    requiredJha?: unknown;
    status?: TaskStatus;
  }) {
    return prisma.task.create({
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
        status: data.status ?? TaskStatus.draft,
      },
    });
  },

  findById(id: string, companyId: string) {
    return prisma.task.findFirst({
      where: { id, companyId },
      include: { assignments: true },
    });
  },

  listByWorkPackage(workPackageId: string, companyId: string) {
    return prisma.task.findMany({
      where: { workPackageId, companyId },
      include: { assignments: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateRequirements(
    id: string,
    companyId: string,
    data: {
      requiredSkills?: unknown;
      requiredEquipment?: unknown;
      requiredTraining?: unknown;
      requiredControls?: unknown;
      requiredPpe?: unknown;
      requiredJha?: unknown;
      status?: TaskStatus;
      version: number;
    },
  ) {
    return prisma.task.updateMany({
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

  updateLifecycle(
    id: string,
    companyId: string,
    data: { status: TaskStatus; startDate?: Date; endDate?: Date },
  ) {
    return prisma.task.updateMany({ where: { id, companyId }, data });
  },

  upsertAssignment(taskId: string, assigneeType: string, assigneeId: string) {
    return prisma.taskAssignment.upsert({
      where: { taskId_assigneeType_assigneeId: { taskId, assigneeType, assigneeId } },
      create: { taskId, assigneeType, assigneeId },
      update: { assignedAt: new Date() },
    });
  },

  syncAssignments(taskId: string, workers: string[], equipment: string[]) {
    return prisma.$transaction(async (tx) => {
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
