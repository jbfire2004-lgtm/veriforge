import { RiskLevel } from '@prisma/client';
import { safetyGateEngine } from '../engines/safety-gate.engine';
import { projectSafetyClient } from '../clients/project-safety.client';
import { projectRepository } from '../models/project.repository';
import { NotFoundError } from '../utils/errors';
import type { ProjectMetadata, ProjectDetail, SafetyGateCheckInput } from '../types';
import { logger } from '../utils/logger';

function parseMetadata(raw: unknown): ProjectMetadata {
  if (!raw || typeof raw !== 'object') return {};
  return raw as ProjectMetadata;
}

function mapProject(
  p: NonNullable<Awaited<ReturnType<typeof projectRepository.findProject>>>,
): ProjectDetail {
  return {
    id: p.id,
    companyId: p.companyId,
    name: p.name,
    type: p.type,
    scope: p.scope,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    riskLevel: p.riskLevel,
    metadata: parseMetadata(p.metadata),
    createdBy: p.createdBy,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    workPackages: p.workPackages.map((wp) => ({
      id: wp.id,
      name: wp.name,
      status: wp.status,
      taskCount: wp.tasks.length,
      tasks: wp.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        workPackageId: t.workPackageId,
        linkedEntityType: t.linkedEntityType,
        linkedEntityId: t.linkedEntityId,
      })),
    })),
  };
}

export const projectService = {
  async create(input: {
    companyId: string;
    name: string;
    type?: string;
    scope?: string;
    startDate?: string;
    endDate?: string;
    riskLevel?: RiskLevel;
    metadata?: ProjectMetadata;
    createdBy: string;
    workPackages?: Array<{
      name: string;
      description?: string;
      tasks?: Array<{
        name: string;
        linkedEntityType?: string;
        linkedEntityId?: string;
      }>;
    }>;
  }) {
    const project = await projectRepository.createProject({
      companyId: input.companyId,
      name: input.name,
      type: input.type,
      scope: input.scope,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      riskLevel: input.riskLevel,
      metadata: input.metadata ?? { safetyGateEnabled: true },
      createdBy: input.createdBy,
      workPackages: input.workPackages,
    });

    logger.info('project created', { projectId: project.id, companyId: input.companyId });
    return mapProject(project);
  },

  async getById(id: string, companyId: string) {
    const project = await projectRepository.findProject(id, companyId);
    if (!project) throw new NotFoundError('Project not found');
    return mapProject(project);
  },

  async listByCompany(companyId: string) {
    const projects = await projectRepository.listByCompany(companyId);
    return projects.map((p) => ({
      id: p.id,
      companyId: p.companyId,
      name: p.name,
      type: p.type,
      scope: p.scope,
      startDate: p.startDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
      riskLevel: p.riskLevel,
      metadata: parseMetadata(p.metadata),
      createdBy: p.createdBy,
      createdAt: p.createdAt.toISOString(),
      workPackageCount: p.workPackages.length,
      taskCount: p.workPackages.reduce((sum, wp) => sum + wp._count.tasks, 0),
    }));
  },

  async updateRisk(id: string, companyId: string, riskLevel: RiskLevel) {
    const project = await projectRepository.findProject(id, companyId);
    if (!project) throw new NotFoundError('Project not found');

    await projectRepository.updateRiskLevel(id, companyId, riskLevel);
    const updated = await projectRepository.findProject(id, companyId);
    return {
      id,
      riskLevel: updated!.riskLevel,
      previousRiskLevel: project.riskLevel,
    };
  },

  async checkSafetyGate(
    id: string,
    companyId: string,
    token: string,
    input: SafetyGateCheckInput,
  ) {
    const project = await projectRepository.findProject(id, companyId);
    if (!project) throw new NotFoundError('Project not found');

    const metadata = parseMetadata(project.metadata);
    const upstreamScore = await projectSafetyClient.fetchProjectSafetyScore(id, companyId, token);

    return safetyGateEngine.evaluate(project.riskLevel, metadata, input, upstreamScore ?? undefined);
  },
};
