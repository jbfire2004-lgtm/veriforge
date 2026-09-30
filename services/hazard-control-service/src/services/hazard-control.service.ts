import { hazardControlRepository } from '../models/hazard-control.repository';
import { sifHecaScoringEngine } from '../engines/sif-heca-scoring.engine';
import { energyWheelEngine } from '../engines/energy-wheel.engine';
import { hazardControlMappingEngine } from '../engines/hazard-control-mapping.engine';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import type { EnergyType } from '../types';
import { logger } from '../utils/logger';

function toHazardDto(hazard: Awaited<ReturnType<typeof hazardControlRepository.findHazard>>) {
  if (!hazard) return null;
  const energies = energyWheelEngine.detectFromText(
    `${hazard.title ?? ''} ${hazard.description ?? ''} ${hazard.energyType}`,
  );
  const suggestedControls = energyWheelEngine.suggestControlDescriptions(
    energies.map((e) => e.energyType),
  );

  const ppe = hazard.requiredPpe as unknown[];
  const training = hazard.requiredTraining as unknown[];
  const controls = hazard.controlLinks ?? [];

  const mappingValidation = hazardControlMappingEngine.validateMapping({
    hazardTitle: hazard.title ?? hazard.hazardType,
    linkedControlCount: controls.length,
    ppeCount: ppe.length,
    trainingCount: training.length,
    weakIssues: controls
      .filter((l) => l.control.controlStrength < 3)
      .map((l) => `Weak control: ${l.control.title ?? l.control.id}`),
    sifPotential: hazard.sifPotential,
  });

  return {
    id: hazard.id,
    companyId: hazard.companyId,
    hazardType: hazard.hazardType,
    category: hazard.category,
    energyType: hazard.energyType,
    severity: hazard.severity,
    likelihood: hazard.likelihood,
    sifPotential: hazard.sifPotential,
    hecaCategory: hazard.hecaCategory,
    requiredControls: hazard.requiredControls,
    requiredTraining: hazard.requiredTraining,
    requiredPpe: hazard.requiredPpe,
    version: hazard.version,
    title: hazard.title,
    description: hazard.description,
    controls: controls.map((l) => ({
      id: l.control.id,
      controlType: l.control.controlType,
      hierarchyLevel: l.control.hierarchyLevel,
      controlStrength: l.control.controlStrength,
      title: l.control.title,
    })),
    energyWheel: {
      detections: energies,
      suggestedControls,
      aggregateSeverity: energyWheelEngine.aggregateEnergySeverity(energies),
    },
    mappingValidation,
    createdAt: hazard.createdAt.toISOString(),
    updatedAt: hazard.updatedAt.toISOString(),
  };
}

function toControlDto(control: Awaited<ReturnType<typeof hazardControlRepository.findControl>>) {
  if (!control) return null;
  return {
    id: control.id,
    companyId: control.companyId,
    controlType: control.controlType,
    hierarchyLevel: control.hierarchyLevel,
    controlStrength: control.controlStrength,
    verificationSteps: control.verificationSteps,
    requiredTraining: control.requiredTraining,
    requiredPpe: control.requiredPpe,
    version: control.version,
    title: control.title,
    description: control.description,
    hazards: control.hazardLinks.map((l) => ({
      id: l.hazard.id,
      hazardType: l.hazard.hazardType,
      title: l.hazard.title,
    })),
    createdAt: control.createdAt.toISOString(),
    updatedAt: control.updatedAt.toISOString(),
  };
}

export const hazardControlService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async createHazard(input: {
    companyId: string;
    hazardType: string;
    category: string;
    energyType: string;
    severity: number;
    likelihood: number;
    title?: string;
    description?: string;
    requiredControls?: unknown[];
    requiredTraining?: unknown[];
    requiredPpe?: unknown[];
  }) {
    if (input.severity < 1 || input.severity > 5 || input.likelihood < 1 || input.likelihood > 5) {
      throw new BadRequestError('severity and likelihood must be between 1 and 5');
    }

    const text = `${input.title ?? ''} ${input.description ?? ''}`;
    const energies = energyWheelEngine.detectFromText(text);
    const highEnergyCount = energies.filter((e) => e.highEnergyFlag).length;

    const score = sifHecaScoringEngine.score({
      severity: input.severity,
      likelihood: input.likelihood,
      highEnergyCount,
      openCapaCount: 0,
      priorIncidentCount: 0,
    });

    const suggested = energyWheelEngine.suggestControlDescriptions(
      energies.map((e) => e.energyType as EnergyType),
    );

    const hazard = await hazardControlRepository.createHazard({
      ...input,
      sifPotential: score.sifPotential,
      hecaCategory: score.hecaCategory,
      requiredControls: input.requiredControls ?? suggested,
      requiredTraining: input.requiredTraining ?? [],
      requiredPpe: input.requiredPpe ?? [],
    });

    logger.info('hazard created', { hazardId: hazard.id, companyId: input.companyId });
    return toHazardDto(await hazardControlRepository.findHazard(hazard.id, input.companyId));
  },

  async createControl(input: {
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
    if (input.controlStrength < 1 || input.controlStrength > 5) {
      throw new BadRequestError('controlStrength must be between 1 and 5');
    }

    const control = await hazardControlRepository.createControl(input);
    logger.info('control created', { controlId: control.id, companyId: input.companyId });
    return toControlDto(await hazardControlRepository.findControl(control.id, input.companyId));
  },

  async mapControls(input: {
    companyId: string;
    hazardId: string;
    controlIds: string[];
  }) {
    const hazard = await hazardControlRepository.findHazard(input.hazardId, input.companyId);
    if (!hazard) throw new NotFoundError('Hazard not found');

    const links = [];
    for (const controlId of input.controlIds) {
      const control = await hazardControlRepository.findControl(controlId, input.companyId);
      if (!control) throw new NotFoundError(`Control not found: ${controlId}`);

      try {
        const link = await hazardControlRepository.linkHazardControl(
          input.hazardId,
          controlId,
        );
        links.push(link);
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
          throw new ConflictError('Hazard-control mapping already exists');
        }
        throw e;
      }
    }

    await hazardControlRepository.updateHazard(input.hazardId, input.companyId, {
      version: hazard.version + 1,
    });

    return {
      hazardId: input.hazardId,
      linked: links.length,
      mapping: hazardControlMappingEngine.validateMapping({
        hazardTitle: hazard.title ?? hazard.hazardType,
        linkedControlCount: await hazardControlRepository.countHazardControls(input.hazardId),
        ppeCount: (hazard.requiredPpe as unknown[]).length,
        trainingCount: (hazard.requiredTraining as unknown[]).length,
        weakIssues: [],
        sifPotential: hazard.sifPotential,
      }),
    };
  },

  async scoreSifHeca(input: {
    companyId: string;
    hazardId: string;
    highEnergyCount?: number;
    openCapaCount?: number;
    priorIncidentCount?: number;
  }) {
    const hazard = await hazardControlRepository.findHazard(input.hazardId, input.companyId);
    if (!hazard) throw new NotFoundError('Hazard not found');

    const energies = energyWheelEngine.detectFromText(
      `${hazard.title ?? ''} ${hazard.description ?? ''}`,
    );

    const score = sifHecaScoringEngine.score({
      severity: hazard.severity,
      likelihood: hazard.likelihood,
      highEnergyCount: input.highEnergyCount ?? energies.filter((e) => e.highEnergyFlag).length,
      openCapaCount: input.openCapaCount ?? 0,
      priorIncidentCount: input.priorIncidentCount ?? 0,
    });

    await hazardControlRepository.updateHazard(input.hazardId, input.companyId, {
      sifPotential: score.sifPotential,
      hecaCategory: score.hecaCategory,
      version: hazard.version + 1,
    });

    return { hazardId: input.hazardId, ...score };
  },

  async getHazard(id: string, companyId: string) {
    const hazard = await hazardControlRepository.findHazard(id, companyId);
    if (!hazard) throw new NotFoundError('Hazard not found');
    return toHazardDto(hazard);
  },

  async getControl(id: string, companyId: string) {
    const control = await hazardControlRepository.findControl(id, companyId);
    if (!control) throw new NotFoundError('Control not found');
    return toControlDto(control);
  },
};
