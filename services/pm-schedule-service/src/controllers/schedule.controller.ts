import type { Request, Response, NextFunction } from 'express';
import { ScheduleStatus } from '@prisma/client';
import { scheduleService } from '../services/schedule.service';
import { assertCompanyScope } from '../middleware/auth.middleware';
import type { SafetyGateContext } from '../types';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function bearerToken(req: Request): string {
  return req.headers.authorization?.slice(7) ?? '';
}

function asStringArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;
  return value.map(String);
}

function parseSafetyContext(body: Record<string, unknown>): SafetyGateContext | undefined {
  const ctx = body.safety_context ?? body.safetyContext;
  if (!ctx || typeof ctx !== 'object') return undefined;
  const c = ctx as Record<string, unknown>;
  return {
    assignedWorkers: asStringArray(c.assigned_workers ?? c.assignedWorkers),
    assignedEquipment: asStringArray(c.assigned_equipment ?? c.assignedEquipment),
    workerSkills: asStringArray(c.worker_skills ?? c.workerSkills),
    completedTraining: asStringArray(c.completed_training ?? c.completedTraining),
    appliedControls: asStringArray(c.applied_controls ?? c.appliedControls),
    confirmedPpe: asStringArray(c.confirmed_ppe ?? c.confirmedPpe),
    activeJhaTypes: asStringArray(c.active_jha_types ?? c.activeJhaTypes),
  };
}

export const scheduleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await scheduleService.create(
        {
          companyId,
          projectId: req.body.project_id ?? req.body.projectId,
          taskId: req.body.task_id ?? req.body.taskId,
          workerId: req.body.worker_id ?? req.body.workerId,
          equipmentId: req.body.equipment_id ?? req.body.equipmentId,
          startTime: req.body.start_time ?? req.body.startTime,
          endTime: req.body.end_time ?? req.body.endTime,
          safetyContext: parseSafetyContext(req.body),
          runSafetyGate: req.body.run_safety_gate ?? req.body.runSafetyGate ?? true,
          blockOnSafetyFailure:
            req.body.block_on_safety_failure ?? req.body.blockOnSafetyFailure ?? true,
          runDelayPrediction:
            req.body.run_delay_prediction ?? req.body.runDelayPrediction ?? false,
        },
        bearerToken(req),
      );

      return res.status(result.scheduled ? 201 : 403).json(result);
    } catch (e) {
      next(e);
    }
  },

  async getByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const gantt = await scheduleService.getProjectGantt(
        routeParam(req.params.project_id),
        companyId,
      );
      return res.json(gantt);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const result = await scheduleService.update(
        routeParam(req.params.id),
        companyId,
        {
          taskId: req.body.task_id ?? req.body.taskId,
          workerId: req.body.worker_id ?? req.body.workerId,
          equipmentId: req.body.equipment_id ?? req.body.equipmentId,
          startTime: req.body.start_time ?? req.body.startTime,
          endTime: req.body.end_time ?? req.body.endTime,
          status: req.body.status as ScheduleStatus | undefined,
          safetyContext: parseSafetyContext(req.body),
          runSafetyGate: req.body.run_safety_gate ?? req.body.runSafetyGate ?? true,
          blockOnSafetyFailure:
            req.body.block_on_safety_failure ?? req.body.blockOnSafetyFailure ?? true,
          runDelayPrediction:
            req.body.run_delay_prediction ?? req.body.runDelayPrediction ?? false,
        },
        bearerToken(req),
      );

      return res.status(result.updated ? 200 : 403).json(result);
    } catch (e) {
      next(e);
    }
  },

  async detectConflicts(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const slots = req.body.slots as
        | Array<{
            id?: string;
            worker_id?: string;
            workerId?: string;
            equipment_id?: string;
            equipmentId?: string;
            task_id?: string;
            taskId?: string;
            start_time?: string;
            startTime?: string;
            end_time?: string;
            endTime?: string;
          }>
        | undefined;

      const normalized = slots?.map((s) => ({
        id: s.id,
        workerId: s.worker_id ?? s.workerId,
        equipmentId: s.equipment_id ?? s.equipmentId,
        taskId: s.task_id ?? s.taskId,
        startTime: s.start_time ?? s.startTime ?? '',
        endTime: s.end_time ?? s.endTime ?? '',
      }));

      const result = await scheduleService.detectConflicts({
        companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        slots: normalized,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
