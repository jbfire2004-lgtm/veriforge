import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

function jsonArray(value: unknown): Prisma.InputJsonValue {
  return (Array.isArray(value) ? value : []) as Prisma.InputJsonValue;
}

export const hazardControlRepository = {
  createHazard(data: {
    companyId: string;
    hazardType: string;
    category: string;
    energyType: string;
    severity: number;
    likelihood: number;
    sifPotential?: boolean;
    hecaCategory: string;
    requiredControls?: unknown[];
    requiredTraining?: unknown[];
    requiredPpe?: unknown[];
    title?: string;
    description?: string;
  }) {
    return prisma.hazard.create({
      data: {
        companyId: data.companyId,
        hazardType: data.hazardType,
        category: data.category,
        energyType: data.energyType,
        severity: data.severity,
        likelihood: data.likelihood,
        sifPotential: data.sifPotential ?? false,
        hecaCategory: data.hecaCategory,
        requiredControls: jsonArray(data.requiredControls),
        requiredTraining: jsonArray(data.requiredTraining),
        requiredPpe: jsonArray(data.requiredPpe),
        title: data.title,
        description: data.description,
      },
    });
  },

  async updateHazard(
    id: string,
    companyId: string,
    data: Partial<{
      severity: number;
      likelihood: number;
      sifPotential: boolean;
      hecaCategory: string;
      requiredControls: unknown[];
      requiredTraining: unknown[];
      requiredPpe: unknown[];
      version: number;
    }>,
  ) {
    const existing = await prisma.hazard.findFirst({ where: { id, companyId } });
    if (!existing) return null;
    return prisma.hazard.update({
      where: { id },
      data: {
        ...data,
        requiredControls: data.requiredControls
          ? jsonArray(data.requiredControls)
          : undefined,
        requiredTraining: data.requiredTraining
          ? jsonArray(data.requiredTraining)
          : undefined,
        requiredPpe: data.requiredPpe ? jsonArray(data.requiredPpe) : undefined,
      },
    });
  },

  findHazard(id: string, companyId: string) {
    return prisma.hazard.findFirst({
      where: { id, companyId },
      include: {
        controlLinks: { include: { control: true } },
      },
    });
  },

  createControl(data: {
    companyId: string;
    controlType: string;
    hierarchyLevel: number;
    controlStrength: number;
    verificationSteps?: unknown[];
    requiredTraining?: unknown[];
    requiredPpe?: unknown[];
    title?: string;
    description?: string;
  }) {
    return prisma.control.create({
      data: {
        companyId: data.companyId,
        controlType: data.controlType,
        hierarchyLevel: data.hierarchyLevel,
        controlStrength: data.controlStrength,
        verificationSteps: jsonArray(data.verificationSteps),
        requiredTraining: jsonArray(data.requiredTraining),
        requiredPpe: jsonArray(data.requiredPpe),
        title: data.title,
        description: data.description,
      },
    });
  },

  findControl(id: string, companyId: string) {
    return prisma.control.findFirst({
      where: { id, companyId },
      include: {
        hazardLinks: { include: { hazard: true } },
      },
    });
  },

  async linkHazardControl(hazardId: string, controlId: string) {
    return prisma.hazardControl.create({
      data: { hazardId, controlId },
    });
  },

  countHazardControls(hazardId: string) {
    return prisma.hazardControl.count({ where: { hazardId } });
  },
};
