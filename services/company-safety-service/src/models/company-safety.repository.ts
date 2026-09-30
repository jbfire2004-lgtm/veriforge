import { Prisma, PublishStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? []) as Prisma.InputJsonValue;
}

export const companySafetyRepository = {
  findProfile(companyId: string) {
    return prisma.companySafetyProfile.findUnique({ where: { companyId } });
  },

  upsertProfile(data: {
    companyId: string;
    corporateRiskLevel?: string;
    corporatePolicies?: unknown;
    corporatePpeStandards?: unknown;
    publish?: boolean;
  }) {
    const publish = data.publish === true;
    return prisma.companySafetyProfile.upsert({
      where: { companyId: data.companyId },
      create: {
        companyId: data.companyId,
        corporateRiskLevel: data.corporateRiskLevel ?? 'medium',
        corporatePolicies: json(data.corporatePolicies ?? []),
        corporatePpeStandards: json(data.corporatePpeStandards ?? []),
        status: publish ? PublishStatus.published : PublishStatus.draft,
        publishedAt: publish ? new Date() : undefined,
      },
      update: {
        corporateRiskLevel: data.corporateRiskLevel,
        corporatePolicies: data.corporatePolicies != null ? json(data.corporatePolicies) : undefined,
        corporatePpeStandards:
          data.corporatePpeStandards != null ? json(data.corporatePpeStandards) : undefined,
        status: publish ? PublishStatus.published : undefined,
        publishedAt: publish ? new Date() : undefined,
        version: publish ? { increment: 1 } : undefined,
      },
    });
  },

  createProfileVersion(data: {
    profileId: string;
    companyId: string;
    version: number;
    snapshot: Prisma.InputJsonValue;
  }) {
    return prisma.companySafetyProfileVersion.create({ data });
  },

  bumpProfileVersion(companyId: string, version: number) {
    return prisma.companySafetyProfile.update({
      where: { companyId },
      data: { version },
    });
  },

  upsertHazard(data: {
    companyId: string;
    hazardId: string;
    title?: string;
    severity: number;
    likelihood: number;
    sifPotential: boolean;
    hecaCategory: string;
    requiredControls?: unknown;
    requiredTraining?: unknown;
    publish?: boolean;
    version?: number;
  }) {
    return prisma.companyHazardLibrary.upsert({
      where: { companyId_hazardId: { companyId: data.companyId, hazardId: data.hazardId } },
      create: {
        companyId: data.companyId,
        hazardId: data.hazardId,
        title: data.title,
        severity: data.severity,
        likelihood: data.likelihood,
        sifPotential: data.sifPotential,
        hecaCategory: data.hecaCategory,
        requiredControls: json(data.requiredControls ?? []),
        requiredTraining: json(data.requiredTraining ?? []),
        status: data.publish ? PublishStatus.published : PublishStatus.draft,
      },
      update: {
        title: data.title,
        severity: data.severity,
        likelihood: data.likelihood,
        sifPotential: data.sifPotential,
        hecaCategory: data.hecaCategory,
        requiredControls: data.requiredControls != null ? json(data.requiredControls) : undefined,
        requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
        version: data.version,
        status: data.publish ? PublishStatus.published : undefined,
      },
    });
  },

  upsertControl(data: {
    companyId: string;
    controlId: string;
    title?: string;
    controlStrength: number;
    verificationSteps?: unknown;
    requiredTraining?: unknown;
    publish?: boolean;
    version?: number;
  }) {
    return prisma.companyControlLibrary.upsert({
      where: { companyId_controlId: { companyId: data.companyId, controlId: data.controlId } },
      create: {
        companyId: data.companyId,
        controlId: data.controlId,
        title: data.title,
        controlStrength: data.controlStrength,
        verificationSteps: json(data.verificationSteps ?? []),
        requiredTraining: json(data.requiredTraining ?? []),
        status: data.publish ? PublishStatus.published : PublishStatus.draft,
      },
      update: {
        title: data.title,
        controlStrength: data.controlStrength,
        verificationSteps:
          data.verificationSteps != null ? json(data.verificationSteps) : undefined,
        requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
        version: data.version,
        status: data.publish ? PublishStatus.published : undefined,
      },
    });
  },

  upsertTraining(data: {
    companyId: string;
    role: string;
    requiredCourses: unknown;
    version?: number;
  }) {
    return prisma.companyTrainingMatrix.upsert({
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

  createPolicy(data: {
    companyId: string;
    policyType: string;
    title: string;
    content?: unknown;
    requiresAckForAccess?: boolean;
    publish?: boolean;
  }) {
    return prisma.companyPolicy.create({
      data: {
        companyId: data.companyId,
        policyType: data.policyType,
        title: data.title,
        content: json(data.content ?? {}),
        requiresAckForAccess: data.requiresAckForAccess ?? true,
        status: data.publish ? PublishStatus.published : PublishStatus.draft,
      },
    });
  },

  createSds(data: {
    companyId: string;
    productName: string;
    casNumber?: string;
    whmisClassification?: string;
    ppeRequirements?: unknown;
    filePath?: string;
    publish?: boolean;
  }) {
    return prisma.companySdsLibrary.create({
      data: {
        companyId: data.companyId,
        productName: data.productName,
        casNumber: data.casNumber,
        whmisClassification: data.whmisClassification,
        ppeRequirements: json(data.ppeRequirements ?? []),
        filePath: data.filePath,
        status: data.publish ? PublishStatus.published : PublishStatus.draft,
      },
    });
  },

  createEmergencyPlan(data: {
    companyId: string;
    planType: string;
    title: string;
    content?: unknown;
    publish?: boolean;
  }) {
    return prisma.companyEmergencyPlan.create({
      data: {
        companyId: data.companyId,
        planType: data.planType,
        title: data.title,
        content: json(data.content ?? {}),
        status: data.publish ? PublishStatus.published : PublishStatus.draft,
      },
    });
  },

  upsertEquipmentRule(data: {
    companyId: string;
    ruleKey: string;
    requiredInspections?: unknown;
    requiredCerts?: unknown;
    requiredControls?: unknown;
    version?: number;
  }) {
    return prisma.companyEquipmentRule.upsert({
      where: { companyId_ruleKey: { companyId: data.companyId, ruleKey: data.ruleKey } },
      create: {
        companyId: data.companyId,
        ruleKey: data.ruleKey,
        requiredInspections: json(data.requiredInspections ?? []),
        requiredCerts: json(data.requiredCerts ?? []),
        requiredControls: json(data.requiredControls ?? []),
      },
      update: {
        requiredInspections:
          data.requiredInspections != null ? json(data.requiredInspections) : undefined,
        requiredCerts: data.requiredCerts != null ? json(data.requiredCerts) : undefined,
        requiredControls: data.requiredControls != null ? json(data.requiredControls) : undefined,
        version: data.version,
      },
    });
  },

  upsertZoneTemplate(data: {
    companyId: string;
    templateCode: string;
    zoneType: string;
    title: string;
    requiredTraining?: unknown;
    requiredPpe?: unknown;
    requiresJha?: boolean;
    highRisk?: boolean;
    version?: number;
  }) {
    return prisma.companyZoneTemplate.upsert({
      where: {
        companyId_templateCode: { companyId: data.companyId, templateCode: data.templateCode },
      },
      create: {
        companyId: data.companyId,
        templateCode: data.templateCode,
        zoneType: data.zoneType,
        title: data.title,
        requiredTraining: json(data.requiredTraining ?? []),
        requiredPpe: json(data.requiredPpe ?? []),
        requiresJha: data.requiresJha ?? false,
        highRisk: data.highRisk ?? false,
      },
      update: {
        zoneType: data.zoneType,
        title: data.title,
        requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
        requiredPpe: data.requiredPpe != null ? json(data.requiredPpe) : undefined,
        requiresJha: data.requiresJha,
        highRisk: data.highRisk,
        version: data.version,
      },
    });
  },

  async getBundle(companyId: string) {
    const [
      profile,
      hazards,
      controls,
      trainingMatrix,
      policies,
      sds,
      emergencyPlans,
      equipmentRules,
      zoneTemplates,
    ] = await Promise.all([
      this.findProfile(companyId),
      prisma.companyHazardLibrary.findMany({ where: { companyId } }),
      prisma.companyControlLibrary.findMany({ where: { companyId } }),
      prisma.companyTrainingMatrix.findMany({ where: { companyId } }),
      prisma.companyPolicy.findMany({ where: { companyId } }),
      prisma.companySdsLibrary.findMany({ where: { companyId } }),
      prisma.companyEmergencyPlan.findMany({ where: { companyId } }),
      prisma.companyEquipmentRule.findMany({ where: { companyId } }),
      prisma.companyZoneTemplate.findMany({ where: { companyId } }),
    ]);

    return {
      profile,
      hazards,
      controls,
      trainingMatrix,
      policies,
      sds,
      emergencyPlans,
      equipmentRules,
      zoneTemplates,
    };
  },
};
