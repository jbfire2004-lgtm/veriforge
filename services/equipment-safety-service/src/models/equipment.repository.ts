import {
  AuthorizationStatus,
  EquipmentStatus,
  InspectionStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../db/prisma';

export const equipmentRepository = {
  createEquipment(data: {
    companyId: string;
    projectId?: string;
    type: string;
    model?: string;
    serialNumber?: string;
    status?: EquipmentStatus;
  }) {
    return prisma.equipment.create({ data });
  },

  findEquipment(id: string, companyId: string) {
    return prisma.equipment.findFirst({ where: { id, companyId } });
  },

  updateEquipment(
    id: string,
    companyId: string,
    data: Partial<{
      status: EquipmentStatus;
      conditionScore: number;
      lastInspectionDate: Date;
      nextInspectionDue: Date;
      projectId: string;
    }>,
  ) {
    return prisma.equipment.updateMany({ where: { id, companyId }, data });
  },

  createInspection(data: {
    equipmentId: string;
    inspectorId: string;
    templateId?: string;
    status: InspectionStatus;
    notes?: string;
  }) {
    return prisma.equipmentInspection.create({ data });
  },

  listInspections(equipmentId: string, limit = 10) {
    return prisma.equipmentInspection.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  createCertification(data: {
    equipmentId: string;
    certificationType: string;
    issuedBy?: string;
    issueDate: Date;
    expiryDate?: Date;
  }) {
    return prisma.equipmentCertification.create({ data });
  },

  listCertifications(equipmentId: string) {
    return prisma.equipmentCertification.findMany({
      where: { equipmentId },
      orderBy: { issueDate: 'desc' },
    });
  },

  upsertAuthorization(data: {
    equipmentId: string;
    workerId: string;
    authorizedBy: string;
    expiryDate?: Date;
  }) {
    return prisma.equipmentAuthorization.upsert({
      where: {
        equipmentId_workerId: {
          equipmentId: data.equipmentId,
          workerId: data.workerId,
        },
      },
      create: {
        equipmentId: data.equipmentId,
        workerId: data.workerId,
        authorizedBy: data.authorizedBy,
        expiryDate: data.expiryDate,
        status: AuthorizationStatus.active,
      },
      update: {
        authorizedBy: data.authorizedBy,
        expiryDate: data.expiryDate,
        status: AuthorizationStatus.active,
      },
    });
  },

  listAuthorizations(equipmentId: string) {
    return prisma.equipmentAuthorization.findMany({ where: { equipmentId } });
  },

  findActiveLockout(equipmentId: string) {
    return prisma.equipmentLockout.findFirst({
      where: { equipmentId, active: true },
      orderBy: { lockedAt: 'desc' },
    });
  },

  createLockout(data: {
    equipmentId: string;
    reason: string;
    lockedBy: string;
  }) {
    return prisma.equipmentLockout.create({ data });
  },

  deactivateLockout(id: string, unlockedBy: string) {
    return prisma.equipmentLockout.update({
      where: { id },
      data: { active: false, unlockedBy, unlockedAt: new Date() },
    });
  },

  getScoreContext(id: string, companyId: string) {
    return prisma.equipment.findFirst({
      where: { id, companyId },
      include: {
        inspections: { orderBy: { createdAt: 'desc' }, take: 5 },
        certifications: true,
        authorizations: true,
        lockouts: { where: { active: true }, take: 1 },
      },
    });
  },

  async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  },
};
