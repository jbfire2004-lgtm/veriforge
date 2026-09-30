"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
const client_1 = require("@prisma/client");
const work_package_client_1 = require("../clients/work-package.client");
const safety_gate_engine_1 = require("../engines/safety-gate.engine");
const task_repository_1 = require("../models/task.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapTask(t) {
    const workflowTimestamp = t.updatedAt.toISOString();
    return {
        id: t.id,
        companyId: t.companyId,
        workPackageId: t.workPackageId,
        title: t.title,
        description: t.description,
        taskType: t.taskType,
        requiredSkills: (0, safety_gate_engine_1.toStringArray)(t.requiredSkills),
        requiredEquipment: (0, safety_gate_engine_1.toStringArray)(t.requiredEquipment),
        requiredTraining: (0, safety_gate_engine_1.toStringArray)(t.requiredTraining),
        requiredControls: (0, safety_gate_engine_1.toStringArray)(t.requiredControls),
        requiredPpe: (0, safety_gate_engine_1.toStringArray)(t.requiredPpe),
        requiredJha: (0, safety_gate_engine_1.toStringArray)(t.requiredJha),
        status: t.status,
        startDate: t.startDate?.toISOString() ?? null,
        endDate: t.endDate?.toISOString() ?? null,
        version: t.version,
        assignments: t.assignments.map((a) => ({
            type: a.assigneeType,
            assigneeId: a.assigneeId,
            assignedAt: a.assignedAt.toISOString(),
        })),
        createdAt: t.createdAt.toISOString(),
        updatedAt: workflowTimestamp,
        workflow: 'vera-core.pm.task',
        workflowTimestamp,
    };
}
async function requireTask(id, companyId) {
    const task = await task_repository_1.taskRepository.findById(id, companyId);
    if (!task)
        throw new errors_1.NotFoundError('Task not found');
    return task;
}
function assignmentsFromTask(task) {
    const workers = task.assignments.filter((a) => a.assigneeType === 'worker').map((a) => a.assigneeId);
    const equipment = task.assignments.filter((a) => a.assigneeType === 'equipment').map((a) => a.assigneeId);
    return { workers, equipment };
}
exports.taskService = {
    async create(input, token) {
        await work_package_client_1.workPackageClient.verifyWorkPackage(input.workPackageId, input.companyId, token);
        const task = await task_repository_1.taskRepository.create({
            companyId: input.companyId,
            workPackageId: input.workPackageId,
            title: input.title,
            description: input.description,
            taskType: input.taskType,
            requiredSkills: input.requirements?.requiredSkills,
            requiredEquipment: input.requirements?.requiredEquipment,
            requiredTraining: input.requirements?.requiredTraining,
            requiredControls: input.requirements?.requiredControls,
            requiredPpe: input.requirements?.requiredPpe,
            requiredJha: input.requirements?.requiredJha,
        });
        if (input.assignedWorkers?.length || input.assignedEquipment?.length) {
            await task_repository_1.taskRepository.syncAssignments(task.id, input.assignedWorkers ?? [], input.assignedEquipment ?? []);
        }
        logger_1.logger.info('task created', { taskId: task.id, workPackageId: input.workPackageId });
        return mapTask((await task_repository_1.taskRepository.findById(task.id, input.companyId)));
    },
    async getById(id, companyId) {
        return mapTask(await requireTask(id, companyId));
    },
    async listByWorkPackage(workPackageId, companyId) {
        const tasks = await task_repository_1.taskRepository.listByWorkPackage(workPackageId, companyId);
        return tasks.map(mapTask);
    },
    async updateRequirements(id, companyId, input) {
        const task = await requireTask(id, companyId);
        const merged = {
            requiredSkills: input.requiredSkills ?? (0, safety_gate_engine_1.toStringArray)(task.requiredSkills),
            requiredEquipment: input.requiredEquipment ?? (0, safety_gate_engine_1.toStringArray)(task.requiredEquipment),
            requiredTraining: input.requiredTraining ?? (0, safety_gate_engine_1.toStringArray)(task.requiredTraining),
            requiredControls: input.requiredControls ?? (0, safety_gate_engine_1.toStringArray)(task.requiredControls),
            requiredPpe: input.requiredPpe ?? (0, safety_gate_engine_1.toStringArray)(task.requiredPpe),
            requiredJha: input.requiredJha ?? (0, safety_gate_engine_1.toStringArray)(task.requiredJha),
        };
        if (input.assignedWorkers || input.assignedEquipment) {
            const current = assignmentsFromTask(task);
            await task_repository_1.taskRepository.syncAssignments(id, input.assignedWorkers ?? current.workers, input.assignedEquipment ?? current.equipment);
        }
        let safetyGate = null;
        if (input.runSafetyGate !== false && input.safetyContext) {
            const refreshed = await requireTask(id, companyId);
            const { workers, equipment } = assignmentsFromTask(refreshed);
            safetyGate = safety_gate_engine_1.safetyGateEngine.evaluate(id, merged, {
                ...input.safetyContext,
                assignedWorkers: input.safetyContext.assignedWorkers ?? workers,
                assignedEquipment: input.safetyContext.assignedEquipment ?? equipment,
            });
            if (!safetyGate.passed && input.status === client_1.TaskStatus.ready) {
                return { updated: false, safetyGate, reason: safetyGate.reason };
            }
        }
        await task_repository_1.taskRepository.updateRequirements(id, companyId, {
            ...merged,
            status: input.status,
            version: task.version + 1,
        });
        const updated = await requireTask(id, companyId);
        return { updated: true, task: mapTask(updated), safetyGate };
    },
    async start(id, companyId, safetyContext) {
        const task = await requireTask(id, companyId);
        if (task.status === client_1.TaskStatus.completed || task.status === client_1.TaskStatus.cancelled) {
            throw new errors_1.BadRequestError(`Cannot start task in status ${task.status}`);
        }
        const requirements = (0, safety_gate_engine_1.extractRequirements)(task);
        const { workers, equipment } = assignmentsFromTask(task);
        const gate = safety_gate_engine_1.safetyGateEngine.evaluate(id, requirements, {
            ...safetyContext,
            assignedWorkers: safetyContext?.assignedWorkers ?? workers,
            assignedEquipment: safetyContext?.assignedEquipment ?? equipment,
        });
        if (!gate.passed) {
            return { started: false, safetyGate: gate };
        }
        await task_repository_1.taskRepository.updateLifecycle(id, companyId, {
            status: client_1.TaskStatus.in_progress,
            startDate: new Date(),
        });
        const updated = await requireTask(id, companyId);
        return { started: true, task: mapTask(updated), safetyGate: gate };
    },
    async complete(id, companyId) {
        const task = await requireTask(id, companyId);
        if (task.status !== client_1.TaskStatus.in_progress && task.status !== client_1.TaskStatus.blocked) {
            throw new errors_1.BadRequestError(`Cannot complete task in status ${task.status}`);
        }
        await task_repository_1.taskRepository.updateLifecycle(id, companyId, {
            status: client_1.TaskStatus.completed,
            endDate: new Date(),
        });
        const updated = await requireTask(id, companyId);
        return { task: mapTask(updated) };
    },
};
