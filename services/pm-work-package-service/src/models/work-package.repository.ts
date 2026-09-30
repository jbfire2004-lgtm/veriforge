import { Prisma, WorkPackageStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? []) as Prisma.InputJsonValue;
}

export const workPackageRepository = {
  create(data: {
    companyId: string;
    projectId: string;
    title: string;
    description?: string;
    requiredEquipment?: unknown;
    requiredWorkers?: unknown;
    requiredTraining?: unknown;
    requiredJha?: unknown;
    requiredInspections?: unknown;
    requiredPermits?: unknown;
    status?: WorkPackageStatus;
  }) {
    return prisma.workPackage.create({
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
        status: data.status ?? WorkPackageStatus.draft,
      },
    });
  },

  findById(id: string, companyId: string) {
    return prisma.workPackage.findFirst({ where: { id, companyId } });
  },

  listByProject(projectId: string, companyId: string) {
    return prisma.workPackage.findMany({
      where: { projectId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateRequirements(
    id: string,
    companyId: string,
    data: {
      requiredEquipment?: unknown;
      requiredWorkers?: unknown;
      requiredTraining?: unknown;
      requiredJha?: unknown;
      requiredInspections?: unknown;
      requiredPermits?: unknown;
      status?: WorkPackageStatus;
      version: number;
    },
  ) {
    return prisma.workPackage.updateMany({
      where: { id, companyId },
      data: {
        requiredEquipment: data.requiredEquipment !== undefined ? json(data.requiredEquipment) : undefined,
        requiredWorkers: data.requiredWorkers !== undefined ? json(data.requiredWorkers) : undefined,
        requiredTraining: data.requiredTraining !== undefined ? json(data.requiredTraining) : undefined,
        requiredJha: data.requiredJha !== undefined ? json(data.requiredJha) : undefined,
        requiredInspections:
          data.requiredInspections !== undefined ? json(data.requiredInspections) : undefined,
        requiredPermits: data.requiredPermits !== undefined ? json(data.requiredPermits) : undefined,
        status: data.status,
        version: data.version,
      },
    });
  },
};
