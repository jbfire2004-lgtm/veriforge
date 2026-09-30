import { Prisma } from '@prisma/client';
import { projectSafetyRepository } from '../models/project-safety.repository';
import {
  hazardScoringEngine,
  versioningEngine,
  projectSafetyScoringEngine,
} from '../engines/scoring.engine';
import { ForbiddenError, BadRequestError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

function mapProfile(
  p: NonNullable<Awaited<ReturnType<typeof projectSafetyRepository.findProfile>>>,
) {
  return {
    id: p.id,
    companyId: p.companyId,
    projectId: p.projectId,
    riskLevel: p.riskLevel,
    requiredJhaTypes: p.requiredJhaTypes,
    requiredInspections: p.requiredInspections,
    requiredTraining: p.requiredTraining,
    requiredEquipmentCertifications: p.requiredEquipmentCertifications,
    requiredPpe: p.requiredPpe,
    requiredEmergencyPlans: p.requiredEmergencyPlans,
    version: p.version,
    status: p.status,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

async function snapshotProfile(projectId: string, companyId: string) {
  const profile = await projectSafetyRepository.findProfile(projectId, companyId);
  if (!profile) return;

  const ctx = await projectSafetyRepository.getScoreContext(projectId, companyId);
  await projectSafetyRepository.createProfileVersion({
    profileId: profile.id,
    companyId,
    projectId,
    version: profile.version,
    snapshot: {
      profile: mapProfile(profile),
      counts: {
        hazards: ctx.hazards.length,
        controls: ctx.controls.length,
        zones: ctx.zones.length,
        training: ctx.training.length,
        emergency: ctx.emergency.length,
        equipment: ctx.equipment.length,
      },
    } as Prisma.InputJsonValue,
  });
}

export const projectSafetyService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async assertProjectCompany(projectId: string, companyId: string) {
    const profile = await projectSafetyRepository.findProfile(projectId, companyId);
    if (profile && profile.companyId !== companyId) {
      throw new ForbiddenError('Project does not belong to company');
    }
    return profile;
  },

  async upsertProfile(input: {
    companyId: string;
    projectId: string;
    riskLevel?: string;
    requiredJhaTypes?: unknown;
    requiredInspections?: unknown;
    requiredTraining?: unknown;
    requiredEquipmentCertifications?: unknown;
    requiredPpe?: unknown;
    requiredEmergencyPlans?: unknown;
    publish?: boolean;
  }) {
    const existing = await projectSafetyRepository.findProfile(input.projectId, input.companyId);
    const profile = await projectSafetyRepository.upsertProfile(input);

    if (input.publish) {
      await snapshotProfile(input.projectId, input.companyId);
    } else if (existing) {
      await projectSafetyRepository.bumpProfileVersion(
        input.projectId,
        input.companyId,
        versioningEngine.nextVersion(existing.version),
      );
    }

    logger.info('project safety profile updated', {
      projectId: input.projectId,
      companyId: input.companyId,
    });

    const updated = await projectSafetyRepository.findProfile(input.projectId, input.companyId);
    return mapProfile(updated!);
  },

  async addHazard(input: {
    companyId: string;
    projectId: string;
    hazardId?: string;
    title?: string;
    severity: number;
    likelihood: number;
    requiredControls?: unknown;
    publish?: boolean;
  }) {
    if (input.severity < 1 || input.severity > 5 || input.likelihood < 1 || input.likelihood > 5) {
      throw new BadRequestError('severity and likelihood must be between 1 and 5');
    }

    const hazardId = input.hazardId ?? versioningEngine.newId();
    const score = hazardScoringEngine.score(input.severity, input.likelihood);
    const ctx = await projectSafetyRepository.getScoreContext(input.projectId, input.companyId);
    const prev = ctx.hazards.find((h) => h.hazardId === hazardId);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const hazard = await projectSafetyRepository.upsertHazard({
      ...input,
      hazardId,
      sifPotential: score.sifPotential,
      hecaCategory: score.hecaCategory,
      version,
    });

    return {
      id: hazard.id,
      projectId: hazard.projectId,
      hazardId: hazard.hazardId,
      title: hazard.title,
      severity: hazard.severity,
      likelihood: hazard.likelihood,
      sifPotential: hazard.sifPotential,
      hecaCategory: hazard.hecaCategory,
      requiredControls: hazard.requiredControls,
      version: hazard.version,
      status: hazard.status,
    };
  },

  async addControl(input: {
    companyId: string;
    projectId: string;
    controlId?: string;
    title?: string;
    controlStrength: number;
    verificationSteps?: unknown;
    publish?: boolean;
  }) {
    if (input.controlStrength < 1 || input.controlStrength > 5) {
      throw new BadRequestError('control_strength must be between 1 and 5');
    }

    const controlId = input.controlId ?? versioningEngine.newId();
    const ctx = await projectSafetyRepository.getScoreContext(input.projectId, input.companyId);
    const prev = ctx.controls.find((c) => c.controlId === controlId);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const control = await projectSafetyRepository.upsertControl({
      ...input,
      controlId,
      version,
    });

    return {
      id: control.id,
      projectId: control.projectId,
      controlId: control.controlId,
      title: control.title,
      controlStrength: control.controlStrength,
      verificationSteps: control.verificationSteps,
      version: control.version,
      status: control.status,
    };
  },

  async addZone(input: {
    companyId: string;
    projectId: string;
    name: string;
    type: string;
    location?: string;
    riskLevel?: string;
    rules?: {
      requiredTraining?: unknown;
      requiredPpe?: unknown;
      requiredJha?: unknown;
      requiredPermits?: unknown;
      requiredEquipmentAuthorization?: unknown;
      requiredSds?: unknown;
    };
  }) {
    const zone = await projectSafetyRepository.createZone({
      companyId: input.companyId,
      projectId: input.projectId,
      name: input.name,
      type: input.type,
      location: input.location,
      riskLevel: input.riskLevel,
    });

    let rules = null;
    if (input.rules) {
      rules = await projectSafetyRepository.upsertZoneRule({
        zoneId: zone.id,
        ...input.rules,
      });
    }

    return {
      id: zone.id,
      projectId: zone.projectId,
      name: zone.name,
      type: zone.type,
      location: zone.location,
      riskLevel: zone.riskLevel,
      rules,
    };
  },

  async upsertEquipment(input: {
    companyId: string;
    projectId: string;
    ruleKey: string;
    requiredInspections?: unknown;
    requiredCerts?: unknown;
    requiredControls?: unknown;
  }) {
    const ctx = await projectSafetyRepository.getScoreContext(input.projectId, input.companyId);
    const prev = ctx.equipment.find((e) => e.ruleKey === input.ruleKey);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const rule = await projectSafetyRepository.upsertEquipmentRule({ ...input, version });
    return {
      id: rule.id,
      projectId: rule.projectId,
      ruleKey: rule.ruleKey,
      requiredInspections: rule.requiredInspections,
      requiredCerts: rule.requiredCerts,
      requiredControls: rule.requiredControls,
      version: rule.version,
    };
  },

  async upsertTraining(input: {
    companyId: string;
    projectId: string;
    role: string;
    requiredCourses: unknown;
  }) {
    const ctx = await projectSafetyRepository.getScoreContext(input.projectId, input.companyId);
    const prev = ctx.training.find((t) => t.role === input.role);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const row = await projectSafetyRepository.upsertTraining({ ...input, version });
    return {
      id: row.id,
      projectId: row.projectId,
      role: row.role,
      requiredCourses: row.requiredCourses,
      version: row.version,
    };
  },

  async createEmergency(input: {
    companyId: string;
    projectId: string;
    planType: string;
    title: string;
    content?: unknown;
    publish?: boolean;
  }) {
    const plan = await projectSafetyRepository.createEmergency(input);
    return {
      id: plan.id,
      projectId: plan.projectId,
      planType: plan.planType,
      title: plan.title,
      content: plan.content,
      version: plan.version,
      status: plan.status,
    };
  },

  async getScore(projectId: string, companyId: string) {
    const ctx = await projectSafetyRepository.getScoreContext(projectId, companyId);
    if (!ctx.profile && ctx.hazards.length === 0) {
      throw new NotFoundError('Project safety context not found');
    }

    return projectSafetyScoringEngine.compute(projectId, companyId, {
      profile: ctx.profile
        ? {
            riskLevel: ctx.profile.riskLevel,
            status: ctx.profile.status,
            requiredJhaTypes: ctx.profile.requiredJhaTypes,
            requiredTraining: ctx.profile.requiredTraining,
            requiredEmergencyPlans: ctx.profile.requiredEmergencyPlans,
          }
        : null,
      hazards: ctx.hazards,
      controls: ctx.controls,
      zones: ctx.zones.map((z) => ({ rules: z.rules, riskLevel: z.riskLevel })),
      training: ctx.training,
      emergency: ctx.emergency,
      equipment: ctx.equipment,
    }, ctx.profile?.version ?? 1);
  },
};
