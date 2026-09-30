import { WorkPackageStatus } from '@prisma/client';
import { pmProjectClient } from '../clients/pm-project.client';
import { safetyGateEngine, extractRequirements, toStringArray } from '../engines/safety-gate.engine';
import { workPackageRepository } from '../models/work-package.repository';
import { NotFoundError } from '../utils/errors';
import type { WorkPackageDetail, WorkPackageRequirements, SafetyGateContext } from '../types';
import { logger } from '../utils/logger';

function mapWorkPackage(
  p: NonNullable<Awaited<ReturnType<typeof workPackageRepository.findById>>>,
): WorkPackageDetail {
  return {
    id: p.id,
    companyId: p.companyId,
    projectId: p.projectId,
    title: p.title,
    description: p.description,
    requiredEquipment: toStringArray(p.requiredEquipment),
    requiredWorkers: toStringArray(p.requiredWorkers),
    requiredTraining: toStringArray(p.requiredTraining),
    requiredJha: toStringArray(p.requiredJha),
    requiredInspections: toStringArray(p.requiredInspections),
    requiredPermits: toStringArray(p.requiredPermits),
    version: p.version,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export const workPackageService = {
  async create(
    input: {
      companyId: string;
      projectId: string;
      title: string;
      description?: string;
      requirements?: WorkPackageRequirements;
      status?: WorkPackageStatus;
    },
    token: string,
  ) {
    const projectOk = await pmProjectClient.verifyProject(input.projectId, input.companyId, token);
    if (!projectOk) {
      logger.warn('project verification failed', { projectId: input.projectId });
    }

    const pkg = await workPackageRepository.create({
      companyId: input.companyId,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      requiredEquipment: input.requirements?.requiredEquipment,
      requiredWorkers: input.requirements?.requiredWorkers,
      requiredTraining: input.requirements?.requiredTraining,
      requiredJha: input.requirements?.requiredJha,
      requiredInspections: input.requirements?.requiredInspections,
      requiredPermits: input.requirements?.requiredPermits,
      status: input.status,
    });

    logger.info('work package created', { workPackageId: pkg.id, projectId: input.projectId });
    return mapWorkPackage(pkg);
  },

  async getById(id: string, companyId: string) {
    const pkg = await workPackageRepository.findById(id, companyId);
    if (!pkg) throw new NotFoundError('Work package not found');
    return mapWorkPackage(pkg);
  },

  async listByProject(projectId: string, companyId: string) {
    const packages = await workPackageRepository.listByProject(projectId, companyId);
    return packages.map(mapWorkPackage);
  },

  async updateRequirements(
    id: string,
    companyId: string,
    token: string,
    input: WorkPackageRequirements & {
      status?: WorkPackageStatus;
      safetyContext?: SafetyGateContext;
      runSafetyGate?: boolean;
    },
  ) {
    const pkg = await workPackageRepository.findById(id, companyId);
    if (!pkg) throw new NotFoundError('Work package not found');

    const merged: WorkPackageRequirements = {
      requiredEquipment: input.requiredEquipment ?? toStringArray(pkg.requiredEquipment),
      requiredWorkers: input.requiredWorkers ?? toStringArray(pkg.requiredWorkers),
      requiredTraining: input.requiredTraining ?? toStringArray(pkg.requiredTraining),
      requiredJha: input.requiredJha ?? toStringArray(pkg.requiredJha),
      requiredInspections: input.requiredInspections ?? toStringArray(pkg.requiredInspections),
      requiredPermits: input.requiredPermits ?? toStringArray(pkg.requiredPermits),
    };

    let safetyGate = null;
    if (input.runSafetyGate !== false && input.safetyContext) {
      const wpGate = safetyGateEngine.evaluate(id, pkg.version + 1, merged, input.safetyContext);

      const projectGate = await pmProjectClient.checkProjectSafetyGate(
        pkg.projectId,
        companyId,
        token,
        {
          completed_training: input.safetyContext.completedTraining,
          has_active_jha: (input.safetyContext.activeJhaTypes?.length ?? 0) > 0,
          has_permits: (input.safetyContext.activePermits?.length ?? 0) > 0,
        },
      );

      safetyGate = {
        workPackage: wpGate,
        project: projectGate,
        passed: wpGate.passed && projectGate.passed,
      };

      if (!safetyGate.passed && input.status === WorkPackageStatus.active) {
        return {
          updated: false,
          safetyGate,
          reason: 'Cannot activate work package — safety requirements not met',
        };
      }
    }

    await workPackageRepository.updateRequirements(id, companyId, {
      requiredEquipment: merged.requiredEquipment,
      requiredWorkers: merged.requiredWorkers,
      requiredTraining: merged.requiredTraining,
      requiredJha: merged.requiredJha,
      requiredInspections: merged.requiredInspections,
      requiredPermits: merged.requiredPermits,
      status: input.status,
      version: pkg.version + 1,
    });

    const updated = await workPackageRepository.findById(id, companyId);
    return {
      updated: true,
      workPackage: mapWorkPackage(updated!),
      safetyGate,
    };
  },
};
