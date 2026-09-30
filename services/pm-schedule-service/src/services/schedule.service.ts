import { ScheduleStatus } from '@prisma/client';
import { cailClient } from '../clients/cail.client';
import { projectClient } from '../clients/project.client';
import { taskClient } from '../clients/task.client';
import { schedulingEngine } from '../engines/scheduling.engine';
import { safetyGateEngine } from '../engines/safety-gate.engine';
import { scheduleRepository } from '../models/schedule.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type {
  DelayPrediction,
  GanttView,
  SafetyGateContext,
  SafetyGateResult,
  ScheduleConflict,
  ScheduleEntry,
  ScheduleSlot,
} from '../types';
import { logger } from '../utils/logger';

type DbEntry = NonNullable<Awaited<ReturnType<typeof scheduleRepository.findById>>>;

function mapEntry(row: DbEntry): ScheduleEntry {
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

function toSlots(entries: DbEntry[], extra?: ScheduleSlot): ScheduleSlot[] {
  const slots: ScheduleSlot[] = entries.map((e) => ({
    id: e.id,
    workerId: e.workerId,
    equipmentId: e.equipmentId,
    taskId: e.taskId,
    startTime: e.startTime,
    endTime: e.endTime,
  }));
  if (extra) slots.push(extra);
  return slots;
}

function buildGantt(projectId: string, entries: DbEntry[], conflicts: ScheduleConflict[]): GanttView {
  const mapped = entries.map(mapEntry);
  const workerLanes: Record<string, ScheduleEntry[]> = {};
  const equipmentLanes: Record<string, ScheduleEntry[]> = {};

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

async function evaluateSafety(
  taskId: string | undefined,
  companyId: string,
  workerId: string | undefined,
  equipmentId: string | undefined,
  safetyContext: SafetyGateContext | undefined,
  token: string,
): Promise<SafetyGateResult | null> {
  if (!taskId) return null;

  const task = await taskClient.fetchTask(taskId, companyId, token);
  if (!task) return null;

  const workers = new Set(task.assignedWorkers);
  if (workerId) workers.add(workerId);
  const equipment = new Set(task.assignedEquipment);
  if (equipmentId) equipment.add(equipmentId);

  return safetyGateEngine.evaluate(taskId, task.requirements, {
    ...safetyContext,
    assignedWorkers: safetyContext?.assignedWorkers ?? [...workers],
    assignedEquipment: safetyContext?.assignedEquipment ?? [...equipment],
  });
}

function resolveStatus(
  conflicts: ScheduleConflict[],
  safetyGate: SafetyGateResult | null,
  blockOnSafety: boolean,
): ScheduleStatus {
  if (safetyGate && !safetyGate.passed && blockOnSafety) {
    return ScheduleStatus.safety_blocked;
  }
  if (conflicts.length > 0) {
    return ScheduleStatus.conflict;
  }
  return ScheduleStatus.scheduled;
}

export const scheduleService = {
  async create(
    input: {
      companyId: string;
      projectId: string;
      taskId?: string;
      workerId?: string;
      equipmentId?: string;
      startTime: string;
      endTime: string;
      safetyContext?: SafetyGateContext;
      runSafetyGate?: boolean;
      blockOnSafetyFailure?: boolean;
      runDelayPrediction?: boolean;
    },
    token: string,
  ) {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestError('Invalid start_time or end_time');
    }
    if (endTime <= startTime) {
      throw new BadRequestError('end_time must be after start_time');
    }

    await projectClient.verifyProject(input.projectId, input.companyId, token);

    const existing = await scheduleRepository.listByProject(input.projectId, input.companyId);
    const candidate: ScheduleSlot = {
      workerId: input.workerId ?? null,
      equipmentId: input.equipmentId ?? null,
      taskId: input.taskId ?? null,
      startTime,
      endTime,
    };
    const conflicts = schedulingEngine.detectConflicts(toSlots(existing, candidate));

    let safetyGate: SafetyGateResult | null = null;
    if (input.runSafetyGate !== false && input.taskId) {
      safetyGate = await evaluateSafety(
        input.taskId,
        input.companyId,
        input.workerId,
        input.equipmentId,
        input.safetyContext,
        token,
      );
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

    const row = await scheduleRepository.create({
      companyId: input.companyId,
      projectId: input.projectId,
      taskId: input.taskId,
      workerId: input.workerId,
      equipmentId: input.equipmentId,
      startTime,
      endTime,
      status,
    });

    let delayPrediction: DelayPrediction | null = null;
    if (input.runDelayPrediction) {
      delayPrediction = await cailClient.predictScheduleDelay(
        {
          companyId: input.companyId,
          projectId: input.projectId,
          taskId: input.taskId,
          workerId: input.workerId,
          equipmentId: input.equipmentId,
          startTime: input.startTime,
          endTime: input.endTime,
        },
        token,
      );
    }

    logger.info('schedule entry created', {
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

  async getProjectGantt(projectId: string, companyId: string): Promise<GanttView> {
    const entries = await scheduleRepository.listByProject(projectId, companyId);
    const conflicts = schedulingEngine.detectConflicts(toSlots(entries));
    return buildGantt(projectId, entries, conflicts);
  },

  async update(
    id: string,
    companyId: string,
    input: {
      taskId?: string | null;
      workerId?: string | null;
      equipmentId?: string | null;
      startTime?: string;
      endTime?: string;
      status?: ScheduleStatus;
      safetyContext?: SafetyGateContext;
      runSafetyGate?: boolean;
      blockOnSafetyFailure?: boolean;
      runDelayPrediction?: boolean;
    },
    token: string,
  ) {
    const current = await scheduleRepository.findById(id, companyId);
    if (!current) throw new NotFoundError('Schedule entry not found');

    const startTime = input.startTime ? new Date(input.startTime) : current.startTime;
    const endTime = input.endTime ? new Date(input.endTime) : current.endTime;
    if (endTime <= startTime) {
      throw new BadRequestError('end_time must be after start_time');
    }

    const taskId = input.taskId !== undefined ? input.taskId : current.taskId;
    const workerId = input.workerId !== undefined ? input.workerId : current.workerId;
    const equipmentId = input.equipmentId !== undefined ? input.equipmentId : current.equipmentId;

    const siblings = (await scheduleRepository.listByProject(current.projectId, companyId)).filter(
      (e) => e.id !== id,
    );
    const candidate: ScheduleSlot = {
      id,
      workerId,
      equipmentId,
      taskId,
      startTime,
      endTime,
    };
    const conflicts = schedulingEngine.detectConflicts(toSlots(siblings, candidate));

    let safetyGate: SafetyGateResult | null = null;
    if (input.runSafetyGate !== false && taskId) {
      safetyGate = await evaluateSafety(
        taskId,
        companyId,
        workerId ?? undefined,
        equipmentId ?? undefined,
        input.safetyContext,
        token,
      );
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

    const status =
      input.status ??
      resolveStatus(conflicts, safetyGate, blockOnSafety);

    await scheduleRepository.update(id, companyId, {
      taskId,
      workerId,
      equipmentId,
      startTime,
      endTime,
      status,
    });

    const updated = (await scheduleRepository.findById(id, companyId))!;

    let delayPrediction: DelayPrediction | null = null;
    if (input.runDelayPrediction) {
      delayPrediction = await cailClient.predictScheduleDelay(
        {
          companyId,
          projectId: current.projectId,
          taskId: taskId ?? undefined,
          workerId: workerId ?? undefined,
          equipmentId: equipmentId ?? undefined,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
        token,
      );
    }

    return {
      updated: true,
      entry: mapEntry(updated),
      conflicts,
      safetyGate,
      delayPrediction,
    };
  },

  detectConflicts(input: {
    companyId: string;
    projectId?: string;
    slots?: Array<{
      id?: string;
      workerId?: string;
      equipmentId?: string;
      taskId?: string;
      startTime: string;
      endTime: string;
    }>;
  }) {
    if (input.projectId) {
      return scheduleRepository.listByProject(input.projectId, input.companyId).then((entries) => {
        const slots: ScheduleSlot[] = entries.map((e) => ({
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
          conflicts: schedulingEngine.detectConflicts(slots),
          slotCount: slots.length,
        };
      });
    }

    if (!input.slots?.length) {
      throw new BadRequestError('project_id or slots array is required');
    }

    const slots: ScheduleSlot[] = input.slots.map((s, i) => ({
      id: s.id ?? `slot-${i}`,
      workerId: s.workerId ?? null,
      equipmentId: s.equipmentId ?? null,
      taskId: s.taskId ?? null,
      startTime: new Date(s.startTime),
      endTime: new Date(s.endTime),
    }));

    return Promise.resolve({
      conflicts: schedulingEngine.detectConflicts(slots),
      slotCount: slots.length,
    });
  },
};
