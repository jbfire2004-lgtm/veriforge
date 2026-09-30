import { Prisma } from '@prisma/client';
import { companySafetyRepository } from '../models/company-safety.repository';
import { hazardScoringEngine } from '../engines/hazard-scoring.engine';
import { versioningEngine } from '../engines/versioning.engine';
import { ForbiddenError, BadRequestError } from '../utils/errors';
import type { CompanySafetyBundle } from '../types';
import { logger } from '../utils/logger';

function toIso(d: Date | null | undefined) {
  return d?.toISOString() ?? null;
}

function mapProfile(p: NonNullable<Awaited<ReturnType<typeof companySafetyRepository.findProfile>>>) {
  return {
    id: p.id,
    companyId: p.companyId,
    corporateRiskLevel: p.corporateRiskLevel,
    corporatePolicies: p.corporatePolicies,
    corporatePpeStandards: p.corporatePpeStandards,
    version: p.version,
    status: p.status,
    publishedAt: toIso(p.publishedAt),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

async function snapshotProfile(companyId: string) {
  const profile = await companySafetyRepository.findProfile(companyId);
  if (!profile) return;

  const bundle = await companySafetyRepository.getBundle(companyId);
  await companySafetyRepository.createProfileVersion({
    profileId: profile.id,
    companyId,
    version: profile.version,
    snapshot: {
      profile: mapProfile(profile),
      counts: {
        hazards: bundle.hazards.length,
        controls: bundle.controls.length,
        trainingRoles: bundle.trainingMatrix.length,
        policies: bundle.policies.length,
        sds: bundle.sds.length,
        emergencyPlans: bundle.emergencyPlans.length,
        equipmentRules: bundle.equipmentRules.length,
        zoneTemplates: bundle.zoneTemplates.length,
      },
    } as Prisma.InputJsonValue,
  });
}

export const companySafetyService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async upsertProfile(input: {
    companyId: string;
    corporateRiskLevel?: string;
    corporatePolicies?: unknown;
    corporatePpeStandards?: unknown;
    publish?: boolean;
  }) {
    const existing = await companySafetyRepository.findProfile(input.companyId);
    const profile = await companySafetyRepository.upsertProfile(input);

    if (input.publish) {
      await snapshotProfile(input.companyId);
    } else if (existing) {
      await companySafetyRepository.bumpProfileVersion(
        input.companyId,
        versioningEngine.nextVersion(existing.version),
      );
    }

    logger.info('company safety profile updated', { companyId: input.companyId });
    const updated = await companySafetyRepository.findProfile(input.companyId);
    return mapProfile(updated!);
  },

  async addHazard(input: {
    companyId: string;
    hazardId?: string;
    title?: string;
    severity: number;
    likelihood: number;
    requiredControls?: unknown;
    requiredTraining?: unknown;
    publish?: boolean;
  }) {
    if (input.severity < 1 || input.severity > 5 || input.likelihood < 1 || input.likelihood > 5) {
      throw new BadRequestError('severity and likelihood must be between 1 and 5');
    }

    const hazardId = input.hazardId ?? versioningEngine.newHazardId();
    const score = hazardScoringEngine.score(input.severity, input.likelihood);

    const existing = await companySafetyRepository.getBundle(input.companyId);
    const prev = existing.hazards.find((h) => h.hazardId === hazardId);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const hazard = await companySafetyRepository.upsertHazard({
      ...input,
      hazardId,
      sifPotential: score.sifPotential,
      hecaCategory: score.hecaCategory,
      version,
    });

    return {
      id: hazard.id,
      companyId: hazard.companyId,
      hazardId: hazard.hazardId,
      title: hazard.title,
      severity: hazard.severity,
      likelihood: hazard.likelihood,
      sifPotential: hazard.sifPotential,
      hecaCategory: hazard.hecaCategory,
      requiredControls: hazard.requiredControls,
      requiredTraining: hazard.requiredTraining,
      version: hazard.version,
      status: hazard.status,
    };
  },

  async addControl(input: {
    companyId: string;
    controlId?: string;
    title?: string;
    controlStrength: number;
    verificationSteps?: unknown;
    requiredTraining?: unknown;
    publish?: boolean;
  }) {
    if (input.controlStrength < 1 || input.controlStrength > 5) {
      throw new BadRequestError('control_strength must be between 1 and 5');
    }

    const controlId = input.controlId ?? versioningEngine.newControlId();
    const existing = await companySafetyRepository.getBundle(input.companyId);
    const prev = existing.controls.find((c) => c.controlId === controlId);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const control = await companySafetyRepository.upsertControl({
      ...input,
      controlId,
      version,
    });

    return {
      id: control.id,
      companyId: control.companyId,
      controlId: control.controlId,
      title: control.title,
      controlStrength: control.controlStrength,
      verificationSteps: control.verificationSteps,
      requiredTraining: control.requiredTraining,
      version: control.version,
      status: control.status,
    };
  },

  async upsertTraining(input: {
    companyId: string;
    role: string;
    requiredCourses: unknown;
  }) {
    const existing = await companySafetyRepository.getBundle(input.companyId);
    const prev = existing.trainingMatrix.find((t) => t.role === input.role);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const row = await companySafetyRepository.upsertTraining({
      ...input,
      version,
    });

    return {
      id: row.id,
      companyId: row.companyId,
      role: row.role,
      requiredCourses: row.requiredCourses,
      version: row.version,
    };
  },

  async createPolicy(input: {
    companyId: string;
    policyType: string;
    title: string;
    content?: unknown;
    requiresAckForAccess?: boolean;
    publish?: boolean;
  }) {
    const policy = await companySafetyRepository.createPolicy(input);
    return {
      id: policy.id,
      companyId: policy.companyId,
      policyType: policy.policyType,
      title: policy.title,
      content: policy.content,
      requiresAckForAccess: policy.requiresAckForAccess,
      version: policy.version,
      status: policy.status,
    };
  },

  async createSds(input: {
    companyId: string;
    productName: string;
    casNumber?: string;
    whmisClassification?: string;
    ppeRequirements?: unknown;
    filePath?: string;
    publish?: boolean;
  }) {
    const sds = await companySafetyRepository.createSds(input);
    return {
      id: sds.id,
      companyId: sds.companyId,
      productName: sds.productName,
      casNumber: sds.casNumber,
      whmisClassification: sds.whmisClassification,
      ppeRequirements: sds.ppeRequirements,
      version: sds.version,
      filePath: sds.filePath,
      status: sds.status,
    };
  },

  async createEmergencyPlan(input: {
    companyId: string;
    planType: string;
    title: string;
    content?: unknown;
    publish?: boolean;
  }) {
    const plan = await companySafetyRepository.createEmergencyPlan(input);
    return {
      id: plan.id,
      companyId: plan.companyId,
      planType: plan.planType,
      title: plan.title,
      content: plan.content,
      version: plan.version,
      status: plan.status,
    };
  },

  async upsertEquipmentRule(input: {
    companyId: string;
    ruleKey: string;
    requiredInspections?: unknown;
    requiredCerts?: unknown;
    requiredControls?: unknown;
  }) {
    const existing = await companySafetyRepository.getBundle(input.companyId);
    const prev = existing.equipmentRules.find((r) => r.ruleKey === input.ruleKey);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const rule = await companySafetyRepository.upsertEquipmentRule({ ...input, version });
    return {
      id: rule.id,
      companyId: rule.companyId,
      ruleKey: rule.ruleKey,
      requiredInspections: rule.requiredInspections,
      requiredCerts: rule.requiredCerts,
      requiredControls: rule.requiredControls,
      version: rule.version,
    };
  },

  async upsertZoneTemplate(input: {
    companyId: string;
    templateCode: string;
    zoneType: string;
    title: string;
    requiredTraining?: unknown;
    requiredPpe?: unknown;
    requiresJha?: boolean;
    highRisk?: boolean;
  }) {
    const existing = await companySafetyRepository.getBundle(input.companyId);
    const prev = existing.zoneTemplates.find((z) => z.templateCode === input.templateCode);
    const version = prev ? versioningEngine.nextVersion(prev.version) : 1;

    const zone = await companySafetyRepository.upsertZoneTemplate({ ...input, version });
    return {
      id: zone.id,
      companyId: zone.companyId,
      templateCode: zone.templateCode,
      zoneType: zone.zoneType,
      title: zone.title,
      requiredTraining: zone.requiredTraining,
      requiredPpe: zone.requiredPpe,
      requiresJha: zone.requiresJha,
      highRisk: zone.highRisk,
      version: zone.version,
    };
  },

  async getCompanySafety(companyId: string): Promise<CompanySafetyBundle> {
    const bundle = await companySafetyRepository.getBundle(companyId);

    return {
      companyId,
      profile: bundle.profile ? mapProfile(bundle.profile) : null,
      hazards: bundle.hazards.map((h) => ({
        id: h.id,
        hazardId: h.hazardId,
        title: h.title,
        severity: h.severity,
        likelihood: h.likelihood,
        sifPotential: h.sifPotential,
        hecaCategory: h.hecaCategory,
        requiredControls: h.requiredControls,
        requiredTraining: h.requiredTraining,
        version: h.version,
        status: h.status,
      })),
      controls: bundle.controls.map((c) => ({
        id: c.id,
        controlId: c.controlId,
        title: c.title,
        controlStrength: c.controlStrength,
        verificationSteps: c.verificationSteps,
        requiredTraining: c.requiredTraining,
        version: c.version,
        status: c.status,
      })),
      trainingMatrix: bundle.trainingMatrix.map((t) => ({
        id: t.id,
        role: t.role,
        requiredCourses: t.requiredCourses,
        version: t.version,
      })),
      policies: bundle.policies.map((p) => ({
        id: p.id,
        policyType: p.policyType,
        title: p.title,
        content: p.content,
        requiresAckForAccess: p.requiresAckForAccess,
        version: p.version,
        status: p.status,
      })),
      sds: bundle.sds.map((s) => ({
        id: s.id,
        productName: s.productName,
        casNumber: s.casNumber,
        whmisClassification: s.whmisClassification,
        ppeRequirements: s.ppeRequirements,
        version: s.version,
        filePath: s.filePath,
        status: s.status,
      })),
      emergencyPlans: bundle.emergencyPlans.map((e) => ({
        id: e.id,
        planType: e.planType,
        title: e.title,
        content: e.content,
        version: e.version,
        status: e.status,
      })),
      equipmentRules: bundle.equipmentRules.map((r) => ({
        id: r.id,
        ruleKey: r.ruleKey,
        requiredInspections: r.requiredInspections,
        requiredCerts: r.requiredCerts,
        requiredControls: r.requiredControls,
        version: r.version,
      })),
      zoneTemplates: bundle.zoneTemplates.map((z) => ({
        id: z.id,
        templateCode: z.templateCode,
        zoneType: z.zoneType,
        title: z.title,
        requiredTraining: z.requiredTraining,
        requiredPpe: z.requiredPpe,
        requiresJha: z.requiresJha,
        highRisk: z.highRisk,
        version: z.version,
      })),
      counts: {
        hazards: bundle.hazards.length,
        controls: bundle.controls.length,
        trainingRoles: bundle.trainingMatrix.length,
        policies: bundle.policies.length,
        sds: bundle.sds.length,
        emergencyPlans: bundle.emergencyPlans.length,
        equipmentRules: bundle.equipmentRules.length,
        zoneTemplates: bundle.zoneTemplates.length,
      },
    };
  },
};
