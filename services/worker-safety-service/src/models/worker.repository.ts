import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? []) as Prisma.InputJsonValue;
}

export const workerRepository = {
  findProfile(workerId: string, companyId: string) {
    return prisma.workerProfile.findFirst({ where: { workerId, companyId } });
  },

  upsertProfile(data: {
    companyId: string;
    workerId: string;
    role: string;
    trade?: string;
    medicalRestrictions?: unknown;
  }) {
    return prisma.workerProfile.upsert({
      where: { workerId: data.workerId },
      create: {
        companyId: data.companyId,
        workerId: data.workerId,
        role: data.role,
        trade: data.trade,
        medicalRestrictions: json(data.medicalRestrictions ?? []),
      },
      update: {
        role: data.role,
        trade: data.trade,
        medicalRestrictions:
          data.medicalRestrictions != null ? json(data.medicalRestrictions) : undefined,
      },
    });
  },

  updateScore(workerId: string, companyId: string, safetyScore: number, riskLevel: string) {
    return prisma.workerProfile.updateMany({
      where: { workerId, companyId },
      data: { safetyScore, riskLevel },
    });
  },

  addTraining(data: {
    companyId: string;
    workerId: string;
    courseId: string;
    completionDate: Date;
    expiryDate?: Date;
    competencyLevel?: string;
    certificatePath?: string;
  }) {
    return prisma.workerTraining.create({ data });
  },

  upsertCompetency(data: {
    companyId: string;
    workerId: string;
    competencyCode: string;
    level?: string;
  }) {
    return prisma.workerCompetency.upsert({
      where: {
        workerId_competencyCode: {
          workerId: data.workerId,
          competencyCode: data.competencyCode,
        },
      },
      create: {
        companyId: data.companyId,
        workerId: data.workerId,
        competencyCode: data.competencyCode,
        level: data.level ?? 'basic',
      },
      update: { level: data.level },
    });
  },

  addAuthorization(data: {
    companyId: string;
    workerId: string;
    equipmentType: string;
    authorizationType: string;
    issueDate: Date;
    expiryDate?: Date;
  }) {
    return prisma.workerAuthorization.create({ data });
  },

  addRestriction(data: {
    companyId: string;
    workerId: string;
    restrictionType: string;
    description?: string;
    effectiveDate?: Date;
    expiryDate?: Date;
  }) {
    return prisma.workerRestriction.create({ data });
  },

  addExposure(data: {
    companyId: string;
    workerId: string;
    hazardId: string;
    severity: number;
    likelihood: number;
    exposureDate: Date;
  }) {
    return prisma.workerHazardExposure.create({ data });
  },

  addIncident(data: {
    companyId: string;
    workerId: string;
    incidentId: string;
    role?: string;
    incidentDate: Date;
  }) {
    return prisma.workerIncident.create({ data });
  },

  addCorrective(data: {
    companyId: string;
    workerId: string;
    correctiveActionId: string;
    status?: string;
  }) {
    return prisma.workerCorrectiveAssignment.create({ data });
  },

  addAccessLog(data: {
    companyId: string;
    workerId: string;
    siteId?: string;
    accessType: string;
    granted?: boolean;
    reason?: string;
  }) {
    return prisma.workerAccessLog.create({ data });
  },

  async getScoreContext(workerId: string, companyId: string) {
    const [
      profile,
      training,
      authorizations,
      restrictions,
      exposures,
      incidents,
      corrective,
      accessLogs,
    ] = await Promise.all([
      this.findProfile(workerId, companyId),
      prisma.workerTraining.findMany({ where: { workerId, companyId } }),
      prisma.workerAuthorization.findMany({ where: { workerId, companyId } }),
      prisma.workerRestriction.findMany({ where: { workerId, companyId } }),
      prisma.workerHazardExposure.findMany({ where: { workerId, companyId } }),
      prisma.workerIncident.findMany({ where: { workerId, companyId } }),
      prisma.workerCorrectiveAssignment.findMany({ where: { workerId, companyId } }),
      prisma.workerAccessLog.findMany({ where: { workerId, companyId }, take: 100 }),
    ]);

    return {
      profile,
      training,
      authorizations,
      restrictions,
      exposures,
      incidents,
      corrective,
      accessLogs,
    };
  },
};
