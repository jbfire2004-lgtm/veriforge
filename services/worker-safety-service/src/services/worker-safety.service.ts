import { workerRepository } from '../models/worker.repository';
import { workerScoringEngine } from '../engines/worker-scoring.engine';
import { ForbiddenError, BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

function mapProfile(p: NonNullable<Awaited<ReturnType<typeof workerRepository.findProfile>>>) {
  return {
    id: p.id,
    companyId: p.companyId,
    workerId: p.workerId,
    role: p.role,
    trade: p.trade,
    medicalRestrictions: p.medicalRestrictions,
    safetyScore: p.safetyScore,
    riskLevel: p.riskLevel,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export const workerSafetyService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async assertWorkerCompany(workerId: string, companyId: string) {
    const profile = await workerRepository.findProfile(workerId, companyId);
    if (profile && profile.companyId !== companyId) {
      throw new ForbiddenError('Worker does not belong to company');
    }
    return profile;
  },

  async upsertProfile(input: {
    companyId: string;
    workerId: string;
    role: string;
    trade?: string;
    medicalRestrictions?: unknown;
    competencyCode?: string;
    competencyLevel?: string;
  }) {
    const profile = await workerRepository.upsertProfile(input);

    if (input.competencyCode) {
      await workerRepository.upsertCompetency({
        companyId: input.companyId,
        workerId: input.workerId,
        competencyCode: input.competencyCode,
        level: input.competencyLevel,
      });
    }

    logger.info('worker profile updated', { workerId: input.workerId });
    return mapProfile(profile);
  },

  async addTraining(input: {
    companyId: string;
    workerId: string;
    courseId: string;
    completionDate: string;
    expiryDate?: string;
    competencyLevel?: string;
    certificatePath?: string;
  }) {
    await this.assertWorkerCompany(input.workerId, input.companyId);

    const row = await workerRepository.addTraining({
      ...input,
      completionDate: new Date(input.completionDate),
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
    });

    return {
      id: row.id,
      workerId: row.workerId,
      courseId: row.courseId,
      completionDate: row.completionDate.toISOString(),
      expiryDate: row.expiryDate?.toISOString() ?? null,
      competencyLevel: row.competencyLevel,
      certificatePath: row.certificatePath,
    };
  },

  async addAuthorization(input: {
    companyId: string;
    workerId: string;
    equipmentType: string;
    authorizationType: string;
    issueDate: string;
    expiryDate?: string;
  }) {
    await this.assertWorkerCompany(input.workerId, input.companyId);

    const row = await workerRepository.addAuthorization({
      ...input,
      issueDate: new Date(input.issueDate),
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
    });

    return {
      id: row.id,
      workerId: row.workerId,
      equipmentType: row.equipmentType,
      authorizationType: row.authorizationType,
      issueDate: row.issueDate.toISOString(),
      expiryDate: row.expiryDate?.toISOString() ?? null,
    };
  },

  async addRestriction(input: {
    companyId: string;
    workerId: string;
    restrictionType: string;
    description?: string;
    effectiveDate?: string;
    expiryDate?: string;
    updateProfile?: boolean;
  }) {
    let profile = await workerRepository.findProfile(input.workerId, input.companyId);
    if (!profile) {
      throw new NotFoundError('Worker profile not found — create profile first');
    }

    const row = await workerRepository.addRestriction({
      companyId: input.companyId,
      workerId: input.workerId,
      restrictionType: input.restrictionType,
      description: input.description,
      effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : undefined,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
    });

    if (input.updateProfile !== false) {
      const existing = (profile.medicalRestrictions as unknown[]) ?? [];
      const updated = [
        ...existing,
        {
          restrictionType: input.restrictionType,
          description: input.description,
          effectiveDate: row.effectiveDate.toISOString(),
          expiryDate: row.expiryDate?.toISOString() ?? null,
        },
      ];
      profile = await workerRepository.upsertProfile({
        companyId: input.companyId,
        workerId: input.workerId,
        role: profile.role,
        trade: profile.trade ?? undefined,
        medicalRestrictions: updated,
      });
    }

    return {
      id: row.id,
      workerId: row.workerId,
      restrictionType: row.restrictionType,
      description: row.description,
      effectiveDate: row.effectiveDate.toISOString(),
      expiryDate: row.expiryDate?.toISOString() ?? null,
      profile: mapProfile(profile),
    };
  },

  async addExposure(input: {
    companyId: string;
    workerId: string;
    hazardId: string;
    severity: number;
    likelihood: number;
    exposureDate: string;
  }) {
    if (input.severity < 1 || input.severity > 5 || input.likelihood < 1 || input.likelihood > 5) {
      throw new BadRequestError('severity and likelihood must be between 1 and 5');
    }

    await this.assertWorkerCompany(input.workerId, input.companyId);

    const row = await workerRepository.addExposure({
      ...input,
      exposureDate: new Date(input.exposureDate),
    });

    return {
      id: row.id,
      workerId: row.workerId,
      hazardId: row.hazardId,
      severity: row.severity,
      likelihood: row.likelihood,
      exposureDate: row.exposureDate.toISOString(),
      riskScore: row.severity * row.likelihood,
    };
  },

  async addCorrective(input: {
    companyId: string;
    workerId: string;
    correctiveActionId: string;
    status?: string;
  }) {
    await this.assertWorkerCompany(input.workerId, input.companyId);

    const row = await workerRepository.addCorrective(input);
    return {
      id: row.id,
      workerId: row.workerId,
      correctiveActionId: row.correctiveActionId,
      status: row.status,
      assignedAt: row.assignedAt.toISOString(),
    };
  },

  async logAccess(input: {
    companyId: string;
    workerId: string;
    siteId?: string;
    accessType: string;
    granted?: boolean;
    reason?: string;
  }) {
    await this.assertWorkerCompany(input.workerId, input.companyId);
    return workerRepository.addAccessLog(input);
  },

  async recordIncident(input: {
    companyId: string;
    workerId: string;
    incidentId: string;
    role?: string;
    incidentDate: string;
  }) {
    await this.assertWorkerCompany(input.workerId, input.companyId);
    return workerRepository.addIncident({
      ...input,
      incidentDate: new Date(input.incidentDate),
    });
  },

  async getScore(workerId: string, companyId: string) {
    const ctx = await workerRepository.getScoreContext(workerId, companyId);
    if (!ctx.profile) {
      throw new NotFoundError('Worker profile not found');
    }

    const score = workerScoringEngine.compute(workerId, companyId, {
      profile: {
        role: ctx.profile.role,
        medicalRestrictions: ctx.profile.medicalRestrictions,
      },
      training: ctx.training,
      authorizations: ctx.authorizations,
      restrictions: ctx.restrictions,
      exposures: ctx.exposures,
      incidents: ctx.incidents,
      corrective: ctx.corrective,
      accessLogs: ctx.accessLogs,
    });

    await workerRepository.updateScore(workerId, companyId, score.score, score.riskLevel);

    return score;
  },
};
