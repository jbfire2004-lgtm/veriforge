import { Prisma, PublishStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? []) as Prisma.InputJsonValue;
}

export const projectSafetyRepository = {
  findProfile(projectId: string, companyId: string) {
    return prisma.projectSafetyProfile.findFirst({
      where: { projectId, companyId },
    });
  },

  upsertProfile(data: {
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
    const publish = data.publish === true;
    return prisma.projectSafetyProfile.upsert({
      where: { projectId: data.projectId },
      create: {
        companyId: data.companyId,
        projectId: data.projectId,
        riskLevel: data.riskLevel ?? 'medium',
        requiredJhaTypes: json(data.requiredJhaTypes ?? []),
        requiredInspections: json(data.requiredInspections ?? []),
        requiredTraining: json(data.requiredTraining ?? []),
        requiredEquipmentCertifications: json(data.requiredEquipmentCertifications ?? []),
        requiredPpe: json(data.requiredPpe ?? []),
        requiredEmergencyPlans: json(data.requiredEmergencyPlans ?? []),
        status: publish ? PublishStatus.published : PublishStatus.draft,
        publishedAt: publish ? new Date() : undefined,
      },
      update: {
        riskLevel: data.riskLevel,
        requiredJhaTypes: data.requiredJhaTypes != null ? json(data.requiredJhaTypes) : undefined,
        requiredInspections:
          data.requiredInspections != null ? json(data.requiredInspections) : undefined,
        requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
        requiredEquipmentCertifications:
          data.requiredEquipmentCertifications != null
            ? json(data.requiredEquipmentCertifications)
            : undefined,
        requiredPpe: data.requiredPpe != null ? json(data.requiredPpe) : undefined,
        requiredEmergencyPlans:
          data.requiredEmergencyPlans != null ? json(data.requiredEmergencyPlans) : undefined,
        status: publish ? PublishStatus.published : undefined,
        publishedAt: publish ? new Date() : undefined,
        version: publish ? { increment: 1 } : undefined,
      },
    });
  },

  createProfileVersion(data: {
    profileId: string;
    companyId: string;
    projectId: string;
    version: number;
    snapshot: Prisma.InputJsonValue;
  }) {
    return prisma.projectSafetyProfileVersion.create({ data });
  },

  bumpProfileVersion(projectId: string, companyId: string, version: number) {
    return prisma.projectSafetyProfile.updateMany({
      where: { projectId, companyId },
      data: { version },
    });
  },

  upsertHazard(data: {
    companyId: string;
    projectId: string;
    hazardId: string;
    title?: string;
    severity: number;
    likelihood: number;
    sifPotential: boolean;
    hecaCategory: string;
    requiredControls?: unknown;
    version?: number;
    publish?: boolean;
  }) {
    return prisma.projectHazardLibrary.upsert({
      where: { projectId_hazardId: { projectId: data.projectId, hazardId: data.hazardId } },
      create: {
        companyId: data.companyId,
        projectId: data.projectId,
        hazardId: data.hazardId,
        title: data.title,
        severity: data.severity,
        likelihood: data.likelihood,
        sifPotential: data.sifPotential,
        hecaCategory: data.hecaCategory,
        requiredControls: json(data.requiredControls ?? []),
        status: data.publish ? PublishStatus.published : PublishStatus.draft,
      },
      update: {
        title: data.title,
        severity: data.severity,
        likelihood: data.likelihood,
        sifPotential: data.sifPotential,
        hecaCategory: data.hecaCategory,
        requiredControls: data.requiredControls != null ? json(data.requiredControls) : undefined,
        version: data.version,
        status: data.publish ? PublishStatus.published : undefined,
      },
    });
  },

  upsertControl(data: {
    companyId: string;
    projectId: string;
    controlId: string;
    title?: string;
    controlStrength: number;
    verificationSteps?: unknown;
    version?: number;
    publish?: boolean;
  }) {
    return prisma.projectControlLibrary.upsert({
      where: { projectId_controlId: { projectId: data.projectId, controlId: data.controlId } },
      create: {
        companyId: data.companyId,
        projectId: data.projectId,
        controlId: data.controlId,
        title: data.title,
        controlStrength: data.controlStrength,
        verificationSteps: json(data.verificationSteps ?? []),
        status: data.publish ? PublishStatus.published : PublishStatus.draft,
      },
      update: {
        title: data.title,
        controlStrength: data.controlStrength,
        verificationSteps:
          data.verificationSteps != null ? json(data.verificationSteps) : undefined,
        version: data.version,
        status: data.publish ? PublishStatus.published : undefined,
      },
    });
  },

  createZone(data: {
    companyId: string;
    projectId: string;
    name: string;
    type: string;
    location?: string;
    riskLevel?: string;
  }) {
    return prisma.projectZone.create({ data });
  },

  upsertZoneRule(data: {
    zoneId: string;
    requiredTraining?: unknown;
    requiredPpe?: unknown;
    requiredJha?: unknown;
    requiredPermits?: unknown;
    requiredEquipmentAuthorization?: unknown;
    requiredSds?: unknown;
    version?: number;
  }) {
    return prisma.projectZoneRule.findFirst({ where: { zoneId: data.zoneId } }).then((row) => {
      if (row) {
        return prisma.projectZoneRule.update({
          where: { id: row.id },
          data: {
            requiredTraining:
              data.requiredTraining != null ? json(data.requiredTraining) : undefined,
            requiredPpe: data.requiredPpe != null ? json(data.requiredPpe) : undefined,
            requiredJha: data.requiredJha != null ? json(data.requiredJha) : undefined,
            requiredPermits: data.requiredPermits != null ? json(data.requiredPermits) : undefined,
            requiredEquipmentAuthorization:
              data.requiredEquipmentAuthorization != null
                ? json(data.requiredEquipmentAuthorization)
                : undefined,
            requiredSds: data.requiredSds != null ? json(data.requiredSds) : undefined,
            version: data.version,
          },
        });
      }
      return prisma.projectZoneRule.create({
        data: {
          zoneId: data.zoneId,
          requiredTraining: json(data.requiredTraining ?? []),
          requiredPpe: json(data.requiredPpe ?? []),
          requiredJha: json(data.requiredJha ?? []),
          requiredPermits: json(data.requiredPermits ?? []),
          requiredEquipmentAuthorization: json(data.requiredEquipmentAuthorization ?? []),
          requiredSds: json(data.requiredSds ?? []),
        },
      });
    });
  },

  findZone(id: string, projectId: string, companyId: string) {
    return prisma.projectZone.findFirst({
      where: { id, projectId, companyId },
      include: { rules: true },
    });
  },

  upsertEquipmentRule(data: {
    companyId: string;
    projectId: string;
    ruleKey: string;
    requiredInspections?: unknown;
    requiredCerts?: unknown;
    requiredControls?: unknown;
    version?: number;
  }) {
    return prisma.projectEquipmentRule.upsert({
      where: { projectId_ruleKey: { projectId: data.projectId, ruleKey: data.ruleKey } },
      create: {
        companyId: data.companyId,
        projectId: data.projectId,
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

  upsertTraining(data: {
    companyId: string;
    projectId: string;
    role: string;
    requiredCourses: unknown;
    version?: number;
  }) {
    return prisma.projectTrainingRequirement.upsert({
      where: { projectId_role: { projectId: data.projectId, role: data.role } },
      create: {
        companyId: data.companyId,
        projectId: data.projectId,
        role: data.role,
        requiredCourses: json(data.requiredCourses),
      },
      update: {
        requiredCourses: json(data.requiredCourses),
        version: data.version,
      },
    });
  },

  createEmergency(data: {
    companyId: string;
    projectId: string;
    planType: string;
    title: string;
    content?: unknown;
    publish?: boolean;
  }) {
    return prisma.projectEmergencyRequirement.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        planType: data.planType,
        title: data.title,
        content: json(data.content ?? {}),
        status: data.publish ? PublishStatus.published : PublishStatus.draft,
      },
    });
  },

  async getScoreContext(projectId: string, companyId: string) {
    const [profile, hazards, controls, zones, training, emergency, equipment] = await Promise.all([
      this.findProfile(projectId, companyId),
      prisma.projectHazardLibrary.findMany({ where: { projectId, companyId } }),
      prisma.projectControlLibrary.findMany({ where: { projectId, companyId } }),
      prisma.projectZone.findMany({
        where: { projectId, companyId },
        include: { rules: true },
      }),
      prisma.projectTrainingRequirement.findMany({ where: { projectId, companyId } }),
      prisma.projectEmergencyRequirement.findMany({ where: { projectId, companyId } }),
      prisma.projectEquipmentRule.findMany({ where: { projectId, companyId } }),
    ]);

    return { profile, hazards, controls, zones, training, emergency, equipment };
  },
};
