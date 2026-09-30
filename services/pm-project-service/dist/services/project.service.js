"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = void 0;
const safety_gate_engine_1 = require("../engines/safety-gate.engine");
const project_safety_client_1 = require("../clients/project-safety.client");
const project_repository_1 = require("../models/project.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function parseMetadata(raw) {
    if (!raw || typeof raw !== 'object')
        return {};
    return raw;
}
function mapProject(p) {
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
exports.projectService = {
    async create(input) {
        const project = await project_repository_1.projectRepository.createProject({
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
        logger_1.logger.info('project created', { projectId: project.id, companyId: input.companyId });
        return mapProject(project);
    },
    async getById(id, companyId) {
        const project = await project_repository_1.projectRepository.findProject(id, companyId);
        if (!project)
            throw new errors_1.NotFoundError('Project not found');
        return mapProject(project);
    },
    async listByCompany(companyId) {
        const projects = await project_repository_1.projectRepository.listByCompany(companyId);
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
    async updateRisk(id, companyId, riskLevel) {
        const project = await project_repository_1.projectRepository.findProject(id, companyId);
        if (!project)
            throw new errors_1.NotFoundError('Project not found');
        await project_repository_1.projectRepository.updateRiskLevel(id, companyId, riskLevel);
        const updated = await project_repository_1.projectRepository.findProject(id, companyId);
        return {
            id,
            riskLevel: updated.riskLevel,
            previousRiskLevel: project.riskLevel,
        };
    },
    async checkSafetyGate(id, companyId, token, input) {
        const project = await project_repository_1.projectRepository.findProject(id, companyId);
        if (!project)
            throw new errors_1.NotFoundError('Project not found');
        const metadata = parseMetadata(project.metadata);
        const upstreamScore = await project_safety_client_1.projectSafetyClient.fetchProjectSafetyScore(id, companyId, token);
        return safety_gate_engine_1.safetyGateEngine.evaluate(project.riskLevel, metadata, input, upstreamScore ?? undefined);
    },
};
