import { TaskStatus } from '@prisma/client';
import { workPackageClient } from '../clients/work-package.client';
import { safetyGateEngine, extractRequirements, toStringArray } from '../engines/safety-gate.engine';
import { taskRepository } from '../models/task.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type { TaskDetail, TaskRequirements, SafetyGateContext } from '../types';
import { logger } from '../utils/logger';

function mapTask(
  t: NonNullable<Awaited<ReturnType<typeof taskRepository.findById>>>,
): TaskDetail {
  const workflowTimestamp = t.updatedAt.toISOString();
  return {
    id: t.id,
    companyId: t.companyId,
    workPackageId: t.workPackageId,
    title: t.title,
    description: t.description,
    taskType: t.taskType,
    requiredSkills: toStringArray(t.requiredSkills),
    requiredEquipment: toStringArray(t.requiredEquipment),
    requiredTraining: toStringArray(t.requiredTraining),
    requiredControls: toStringArray(t.requiredControls),
    requiredPpe: toStringArray(t.requiredPpe),
    requiredJha: toStringArray(t.requiredJha),
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

async function requireTask(id: string, companyId: string) {
  const task = await taskRepository.findById(id, companyId);
  if (!task) throw new NotFoundError('Task not found');
  return task;
}

function assignmentsFromTask(task: Awaited<ReturnType<typeof requireTask>>) {
  const workers = task.assignments.filter((a) => a.assigneeType === 'worker').map((a) => a.assigneeId);
  const equipment = task.assignments.filter((a) => a.assigneeType === 'equipment').map((a) => a.assigneeId);
  return { workers, equipment };
}

export const taskService = {
  async create(
    input: {
      companyId: string;
      workPackageId: string;
      title: string;
      description?: string;
      taskType?: string;
      requirements?: TaskRequirements;
      assignedWorkers?: string[];
      assignedEquipment?: string[];
    },
    token: string,
  ) {
    await workPackageClient.verifyWorkPackage(input.workPackageId, input.companyId, token);

    const task = await taskRepository.create({
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
      await taskRepository.syncAssignments(
        task.id,
        input.assignedWorkers ?? [],
        input.assignedEquipment ?? [],
      );
    }

    logger.info('task created', { taskId: task.id, workPackageId: input.workPackageId });
    return mapTask((await taskRepository.findById(task.id, input.companyId))!);
  },

  async getById(id: string, companyId: string) {
    return mapTask(await requireTask(id, companyId));
  },

  async listByWorkPackage(workPackageId: string, companyId: string) {
    const tasks = await taskRepository.listByWorkPackage(workPackageId, companyId);
    return tasks.map(mapTask);
  },

  async updateRequirements(
    id: string,
    companyId: string,
    input: TaskRequirements & {
      status?: TaskStatus;
      assignedWorkers?: string[];
      assignedEquipment?: string[];
      safetyContext?: SafetyGateContext;
      runSafetyGate?: boolean;
    },
  ) {
    const task = await requireTask(id, companyId);
    const merged: TaskRequirements = {
      requiredSkills: input.requiredSkills ?? toStringArray(task.requiredSkills),
      requiredEquipment: input.requiredEquipment ?? toStringArray(task.requiredEquipment),
      requiredTraining: input.requiredTraining ?? toStringArray(task.requiredTraining),
      requiredControls: input.requiredControls ?? toStringArray(task.requiredControls),
      requiredPpe: input.requiredPpe ?? toStringArray(task.requiredPpe),
      requiredJha: input.requiredJha ?? toStringArray(task.requiredJha),
    };

    if (input.assignedWorkers || input.assignedEquipment) {
      const current = assignmentsFromTask(task);
      await taskRepository.syncAssignments(
        id,
        input.assignedWorkers ?? current.workers,
        input.assignedEquipment ?? current.equipment,
      );
    }

    let safetyGate = null;
    if (input.runSafetyGate !== false && input.safetyContext) {
      const refreshed = await requireTask(id, companyId);
      const { workers, equipment } = assignmentsFromTask(refreshed);
      safetyGate = safetyGateEngine.evaluate(id, merged, {
        ...input.safetyContext,
        assignedWorkers: input.safetyContext.assignedWorkers ?? workers,
        assignedEquipment: input.safetyContext.assignedEquipment ?? equipment,
      });

      if (!safetyGate.passed && input.status === TaskStatus.ready) {
        return { updated: false, safetyGate, reason: safetyGate.reason };
      }
    }

    await taskRepository.updateRequirements(id, companyId, {
      ...merged,
      status: input.status,
      version: task.version + 1,
    });

    const updated = await requireTask(id, companyId);
    return { updated: true, task: mapTask(updated), safetyGate };
  },

  async start(
    id: string,
    companyId: string,
    safetyContext?: SafetyGateContext,
  ) {
    const task = await requireTask(id, companyId);

    if (task.status === TaskStatus.completed || task.status === TaskStatus.cancelled) {
      throw new BadRequestError(`Cannot start task in status ${task.status}`);
    }

    const requirements = extractRequirements(task);
    const { workers, equipment } = assignmentsFromTask(task);
    const gate = safetyGateEngine.evaluate(id, requirements, {
      ...safetyContext,
      assignedWorkers: safetyContext?.assignedWorkers ?? workers,
      assignedEquipment: safetyContext?.assignedEquipment ?? equipment,
    });

    if (!gate.passed) {
      return { started: false, safetyGate: gate };
    }

    await taskRepository.updateLifecycle(id, companyId, {
      status: TaskStatus.in_progress,
      startDate: new Date(),
    });

    const updated = await requireTask(id, companyId);
    return { started: true, task: mapTask(updated), safetyGate: gate };
  },

  async complete(id: string, companyId: string) {
    const task = await requireTask(id, companyId);

    if (task.status !== TaskStatus.in_progress && task.status !== TaskStatus.blocked) {
      throw new BadRequestError(`Cannot complete task in status ${task.status}`);
    }

    await taskRepository.updateLifecycle(id, companyId, {
      status: TaskStatus.completed,
      endDate: new Date(),
    });

    const updated = await requireTask(id, companyId);
    return { task: mapTask(updated) };
  },
};
