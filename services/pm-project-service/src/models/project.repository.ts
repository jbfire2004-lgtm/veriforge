import { Prisma, RiskLevel, WorkPackageStatus, TaskStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonValue;
}

export const projectRepository = {
  async createProject(data: {
    companyId: string;
    name: string;
    type?: string;
    scope?: string;
    startDate?: Date;
    endDate?: Date;
    riskLevel?: RiskLevel;
    metadata?: unknown;
    createdBy: string;
    workPackages?: Array<{ name: string; description?: string; tasks?: Array<{ name: string; linkedEntityType?: string; linkedEntityId?: string }> }>;
  }) {
    const project = await prisma.project.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        type: data.type,
        scope: data.scope,
        startDate: data.startDate,
        endDate: data.endDate,
        riskLevel: data.riskLevel ?? RiskLevel.low,
        metadata: json(data.metadata),
        createdBy: data.createdBy,
      },
    });

    for (const wp of data.workPackages ?? []) {
      const workPackage = await prisma.workPackage.create({
        data: {
          projectId: project.id,
          companyId: data.companyId,
          name: wp.name,
          description: wp.description,
        },
      });

      for (const task of wp.tasks ?? []) {
        await prisma.projectTask.create({
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

    return prisma.project.findFirstOrThrow({
      where: { id: project.id },
      include: {
        workPackages: { include: { tasks: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  },

  findProject(id: string, companyId: string) {
    return prisma.project.findFirst({
      where: { id, companyId },
      include: {
        workPackages: { include: { tasks: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  },

  listByCompany(companyId: string) {
    return prisma.project.findMany({
      where: { companyId },
      include: {
        workPackages: { include: { _count: { select: { tasks: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateRiskLevel(id: string, companyId: string, riskLevel: RiskLevel) {
    return prisma.project.updateMany({
      where: { id, companyId },
      data: { riskLevel },
    });
  },

  updateMetadata(id: string, companyId: string, metadata: unknown) {
    return prisma.project.updateMany({
      where: { id, companyId },
      data: { metadata: json(metadata) },
    });
  },

  createWorkPackage(data: {
    projectId: string;
    companyId: string;
    name: string;
    description?: string;
    status?: WorkPackageStatus;
  }) {
    return prisma.workPackage.create({ data });
  },

  createTask(data: {
    projectId: string;
    workPackageId?: string;
    companyId: string;
    name: string;
    status?: TaskStatus;
    linkedEntityType?: string;
    linkedEntityId?: string;
  }) {
    return prisma.projectTask.create({ data });
  },
};
