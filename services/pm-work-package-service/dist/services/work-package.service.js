"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workPackageService = void 0;
const client_1 = require("@prisma/client");
const pm_project_client_1 = require("../clients/pm-project.client");
const safety_gate_engine_1 = require("../engines/safety-gate.engine");
const work_package_repository_1 = require("../models/work-package.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapWorkPackage(p) {
    return {
        id: p.id,
        companyId: p.companyId,
        projectId: p.projectId,
        title: p.title,
        description: p.description,
        requiredEquipment: (0, safety_gate_engine_1.toStringArray)(p.requiredEquipment),
        requiredWorkers: (0, safety_gate_engine_1.toStringArray)(p.requiredWorkers),
        requiredTraining: (0, safety_gate_engine_1.toStringArray)(p.requiredTraining),
        requiredJha: (0, safety_gate_engine_1.toStringArray)(p.requiredJha),
        requiredInspections: (0, safety_gate_engine_1.toStringArray)(p.requiredInspections),
        requiredPermits: (0, safety_gate_engine_1.toStringArray)(p.requiredPermits),
        version: p.version,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    };
}
exports.workPackageService = {
    async create(input, token) {
        const projectOk = await pm_project_client_1.pmProjectClient.verifyProject(input.projectId, input.companyId, token);
        if (!projectOk) {
            logger_1.logger.warn('project verification failed', { projectId: input.projectId });
        }
        const pkg = await work_package_repository_1.workPackageRepository.create({
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
        logger_1.logger.info('work package created', { workPackageId: pkg.id, projectId: input.projectId });
        return mapWorkPackage(pkg);
    },
    async getById(id, companyId) {
        const pkg = await work_package_repository_1.workPackageRepository.findById(id, companyId);
        if (!pkg)
            throw new errors_1.NotFoundError('Work package not found');
        return mapWorkPackage(pkg);
    },
    async listByProject(projectId, companyId) {
        const packages = await work_package_repository_1.workPackageRepository.listByProject(projectId, companyId);
        return packages.map(mapWorkPackage);
    },
    async updateRequirements(id, companyId, token, input) {
        const pkg = await work_package_repository_1.workPackageRepository.findById(id, companyId);
        if (!pkg)
            throw new errors_1.NotFoundError('Work package not found');
        const merged = {
            requiredEquipment: input.requiredEquipment ?? (0, safety_gate_engine_1.toStringArray)(pkg.requiredEquipment),
            requiredWorkers: input.requiredWorkers ?? (0, safety_gate_engine_1.toStringArray)(pkg.requiredWorkers),
            requiredTraining: input.requiredTraining ?? (0, safety_gate_engine_1.toStringArray)(pkg.requiredTraining),
            requiredJha: input.requiredJha ?? (0, safety_gate_engine_1.toStringArray)(pkg.requiredJha),
            requiredInspections: input.requiredInspections ?? (0, safety_gate_engine_1.toStringArray)(pkg.requiredInspections),
            requiredPermits: input.requiredPermits ?? (0, safety_gate_engine_1.toStringArray)(pkg.requiredPermits),
        };
        let safetyGate = null;
        if (input.runSafetyGate !== false && input.safetyContext) {
            const wpGate = safety_gate_engine_1.safetyGateEngine.evaluate(id, pkg.version + 1, merged, input.safetyContext);
            const projectGate = await pm_project_client_1.pmProjectClient.checkProjectSafetyGate(pkg.projectId, companyId, token, {
                completed_training: input.safetyContext.completedTraining,
                has_active_jha: (input.safetyContext.activeJhaTypes?.length ?? 0) > 0,
                has_permits: (input.safetyContext.activePermits?.length ?? 0) > 0,
            });
            safetyGate = {
                workPackage: wpGate,
                project: projectGate,
                passed: wpGate.passed && projectGate.passed,
            };
            if (!safetyGate.passed && input.status === client_1.WorkPackageStatus.active) {
                return {
                    updated: false,
                    safetyGate,
                    reason: 'Cannot activate work package — safety requirements not met',
                };
            }
        }
        await work_package_repository_1.workPackageRepository.updateRequirements(id, companyId, {
            requiredEquipment: merged.requiredEquipment,
            requiredWorkers: merged.requiredWorkers,
            requiredTraining: merged.requiredTraining,
            requiredJha: merged.requiredJha,
            requiredInspections: merged.requiredInspections,
            requiredPermits: merged.requiredPermits,
            status: input.status,
            version: pkg.version + 1,
        });
        const updated = await work_package_repository_1.workPackageRepository.findById(id, companyId);
        return {
            updated: true,
            workPackage: mapWorkPackage(updated),
            safetyGate,
        };
    },
};
