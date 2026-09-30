"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleService = void 0;
const client_1 = require("@prisma/client");
const cail_client_1 = require("../clients/cail.client");
const project_client_1 = require("../clients/project.client");
const task_client_1 = require("../clients/task.client");
const scheduling_engine_1 = require("../engines/scheduling.engine");
const safety_gate_engine_1 = require("../engines/safety-gate.engine");
const schedule_repository_1 = require("../models/schedule.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function mapEntry(row) {
    return {
        id: row.id,
        companyId: row.companyId,
        projectId: row.projectId,
        taskId: row.taskId,
        workerId: row.workerId,
        equipmentId: row.equipmentId,
        startTime: row.startTime.toISOString(),
        endTime: row.endTime.toISOString(),
        status: row.status,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}
function toSlots(entries, extra) {
    const slots = entries.map((e) => ({
        id: e.id,
        workerId: e.workerId,
        equipmentId: e.equipmentId,
        taskId: e.taskId,
        startTime: e.startTime,
        endTime: e.endTime,
    }));
    if (extra)
        slots.push(extra);
    return slots;
}
function buildGantt(projectId, entries, conflicts) {
    const mapped = entries.map(mapEntry);
    const workerLanes = {};
    const equipmentLanes = {};
    for (const entry of mapped) {
        if (entry.workerId) {
            workerLanes[entry.workerId] = workerLanes[entry.workerId] ?? [];
            workerLanes[entry.workerId].push(entry);
        }
        if (entry.equipmentId) {
            equipmentLanes[entry.equipmentId] = equipmentLanes[entry.equipmentId] ?? [];
            equipmentLanes[entry.equipmentId].push(entry);
        }
    }
    return { projectId, entries: mapped, conflicts, workerLanes, equipmentLanes };
}
async function evaluateSafety(taskId, companyId, workerId, equipmentId, safetyContext, token) {
    if (!taskId)
        return null;
    const task = await task_client_1.taskClient.fetchTask(taskId, companyId, token);
    if (!task)
        return null;
    const workers = new Set(task.assignedWorkers);
    if (workerId)
        workers.add(workerId);
    const equipment = new Set(task.assignedEquipment);
    if (equipmentId)
        equipment.add(equipmentId);
    return safety_gate_engine_1.safetyGateEngine.evaluate(taskId, task.requirements, {
        ...safetyContext,
        assignedWorkers: safetyContext?.assignedWorkers ?? [...workers],
        assignedEquipment: safetyContext?.assignedEquipment ?? [...equipment],
    });
}
function resolveStatus(conflicts, safetyGate, blockOnSafety) {
    if (safetyGate && !safetyGate.passed && blockOnSafety) {
        return client_1.ScheduleStatus.safety_blocked;
    }
    if (conflicts.length > 0) {
        return client_1.ScheduleStatus.conflict;
    }
    return client_1.ScheduleStatus.scheduled;
}
exports.scheduleService = {
    async create(input, token) {
        const startTime = new Date(input.startTime);
        const endTime = new Date(input.endTime);
        if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
            throw new errors_1.BadRequestError('Invalid start_time or end_time');
        }
        if (endTime <= startTime) {
            throw new errors_1.BadRequestError('end_time must be after start_time');
        }
        await project_client_1.projectClient.verifyProject(input.projectId, input.companyId, token);
        const existing = await schedule_repository_1.scheduleRepository.listByProject(input.projectId, input.companyId);
        const candidate = {
            workerId: input.workerId ?? null,
            equipmentId: input.equipmentId ?? null,
            taskId: input.taskId ?? null,
            startTime,
            endTime,
        };
        const conflicts = scheduling_engine_1.schedulingEngine.detectConflicts(toSlots(existing, candidate));
        let safetyGate = null;
        if (input.runSafetyGate !== false && input.taskId) {
            safetyGate = await evaluateSafety(input.taskId, input.companyId, input.workerId, input.equipmentId, input.safetyContext, token);
        }
        const blockOnSafety = input.blockOnSafetyFailure ?? true;
        if (safetyGate && !safetyGate.passed && blockOnSafety) {
            return {
                scheduled: false,
                safetyGate,
                conflicts,
                reason: safetyGate.reason,
            };
        }
        const status = resolveStatus(conflicts, safetyGate, blockOnSafety);
        const row = await schedule_repository_1.scheduleRepository.create({
            companyId: input.companyId,
            projectId: input.projectId,
            taskId: input.taskId,
            workerId: input.workerId,
            equipmentId: input.equipmentId,
            startTime,
            endTime,
            status,
        });
        let delayPrediction = null;
        if (input.runDelayPrediction) {
            delayPrediction = await cail_client_1.cailClient.predictScheduleDelay({
                companyId: input.companyId,
                projectId: input.projectId,
                taskId: input.taskId,
                workerId: input.workerId,
                equipmentId: input.equipmentId,
                startTime: input.startTime,
                endTime: input.endTime,
            }, token);
        }
        logger_1.logger.info('schedule entry created', {
            scheduleId: row.id,
            projectId: input.projectId,
            status,
            conflictCount: conflicts.length,
        });
        return {
            scheduled: true,
            entry: mapEntry(row),
            conflicts,
            safetyGate,
            delayPrediction,
        };
    },
    async getProjectGantt(projectId, companyId) {
        const entries = await schedule_repository_1.scheduleRepository.listByProject(projectId, companyId);
        const conflicts = scheduling_engine_1.schedulingEngine.detectConflicts(toSlots(entries));
        return buildGantt(projectId, entries, conflicts);
    },
    async update(id, companyId, input, token) {
        const current = await schedule_repository_1.scheduleRepository.findById(id, companyId);
        if (!current)
            throw new errors_1.NotFoundError('Schedule entry not found');
        const startTime = input.startTime ? new Date(input.startTime) : current.startTime;
        const endTime = input.endTime ? new Date(input.endTime) : current.endTime;
        if (endTime <= startTime) {
            throw new errors_1.BadRequestError('end_time must be after start_time');
        }
        const taskId = input.taskId !== undefined ? input.taskId : current.taskId;
        const workerId = input.workerId !== undefined ? input.workerId : current.workerId;
        const equipmentId = input.equipmentId !== undefined ? input.equipmentId : current.equipmentId;
        const siblings = (await schedule_repository_1.scheduleRepository.listByProject(current.projectId, companyId)).filter((e) => e.id !== id);
        const candidate = {
            id,
            workerId,
            equipmentId,
            taskId,
            startTime,
            endTime,
        };
        const conflicts = scheduling_engine_1.schedulingEngine.detectConflicts(toSlots(siblings, candidate));
        let safetyGate = null;
        if (input.runSafetyGate !== false && taskId) {
            safetyGate = await evaluateSafety(taskId, companyId, workerId ?? undefined, equipmentId ?? undefined, input.safetyContext, token);
        }
        const blockOnSafety = input.blockOnSafetyFailure ?? true;
        if (safetyGate && !safetyGate.passed && blockOnSafety) {
            return {
                updated: false,
                safetyGate,
                conflicts,
                reason: safetyGate.reason,
            };
        }
        const status = input.status ??
            resolveStatus(conflicts, safetyGate, blockOnSafety);
        await schedule_repository_1.scheduleRepository.update(id, companyId, {
            taskId,
            workerId,
            equipmentId,
            startTime,
            endTime,
            status,
        });
        const updated = (await schedule_repository_1.scheduleRepository.findById(id, companyId));
        let delayPrediction = null;
        if (input.runDelayPrediction) {
            delayPrediction = await cail_client_1.cailClient.predictScheduleDelay({
                companyId,
                projectId: current.projectId,
                taskId: taskId ?? undefined,
                workerId: workerId ?? undefined,
                equipmentId: equipmentId ?? undefined,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            }, token);
        }
        return {
            updated: true,
            entry: mapEntry(updated),
            conflicts,
            safetyGate,
            delayPrediction,
        };
    },
    detectConflicts(input) {
        if (input.projectId) {
            return schedule_repository_1.scheduleRepository.listByProject(input.projectId, input.companyId).then((entries) => {
                const slots = entries.map((e) => ({
                    id: e.id,
                    workerId: e.workerId,
                    equipmentId: e.equipmentId,
                    taskId: e.taskId,
                    startTime: e.startTime,
                    endTime: e.endTime,
                }));
                if (input.slots?.length) {
                    for (const s of input.slots) {
                        slots.push({
                            id: s.id,
                            workerId: s.workerId ?? null,
                            equipmentId: s.equipmentId ?? null,
                            taskId: s.taskId ?? null,
                            startTime: new Date(s.startTime),
                            endTime: new Date(s.endTime),
                        });
                    }
                }
                return {
                    projectId: input.projectId,
                    conflicts: scheduling_engine_1.schedulingEngine.detectConflicts(slots),
                    slotCount: slots.length,
                };
            });
        }
        if (!input.slots?.length) {
            throw new errors_1.BadRequestError('project_id or slots array is required');
        }
        const slots = input.slots.map((s, i) => ({
            id: s.id ?? `slot-${i}`,
            workerId: s.workerId ?? null,
            equipmentId: s.equipmentId ?? null,
            taskId: s.taskId ?? null,
            startTime: new Date(s.startTime),
            endTime: new Date(s.endTime),
        }));
        return Promise.resolve({
            conflicts: scheduling_engine_1.schedulingEngine.detectConflicts(slots),
            slotCount: slots.length,
        });
    },
};
