import type { Request, Response, NextFunction } from 'express';
import { inspectionService } from '../services/inspection.service';
import type { ChecklistItem, InspectionFindingInput } from '../types';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function authToken(req: Request): string {
  return req.headers.authorization?.slice(7) ?? '';
}

function mapChecklistItems(items: unknown): ChecklistItem[] | undefined {
  if (!Array.isArray(items)) return undefined;
  return items.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      key: String(row.key ?? ''),
      label: String(row.label ?? row.key ?? ''),
      weight: row.weight != null ? Number(row.weight) : undefined,
      required: row.required as boolean | undefined,
      critical: row.critical as boolean | undefined,
    };
  });
}

function mapFindings(items: unknown): InspectionFindingInput[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      itemKey: String(row.item_key ?? row.itemKey ?? ''),
      findingType: String(row.finding_type ?? row.findingType ?? 'pass') as InspectionFindingInput['findingType'],
      severity: row.severity as string | undefined,
      description: row.description as string | undefined,
      photoUrl: (row.photo_url ?? row.photoUrl) as string | undefined,
      hazardId: (row.hazard_id ?? row.hazardId) as string | undefined,
      controlId: (row.control_id ?? row.controlId) as string | undefined,
      correctiveActionId: (row.corrective_action_id ?? row.correctiveActionId) as string | undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
    };
  });
}

export const inspectionController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const inspection = await inspectionService.create({
        companyId,
        projectId: req.body.project_id,
        checklistType: req.body.checklist_type,
        title: req.body.title,
        description: req.body.description,
        checklistId: req.body.checklist_id,
        checklistItems: mapChecklistItems(req.body.checklist_items),
        equipmentId: req.body.equipment_id,
        workerId: req.body.worker_id,
        inspectorId: req.body.inspector_id,
        location: req.body.location,
        scheduledAt: req.body.scheduled_at,
        passThreshold: req.body.pass_threshold,
        metadata: req.body.metadata,
        createdBy: req.userId!,
        schedule: req.body.schedule,
      });

      return res.status(201).json(inspection);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const inspections = await inspectionService.list({
        companyId,
        projectId: req.query.project_id as string | undefined,
        workerId: req.query.worker_id as string | undefined,
        equipmentId: req.query.equipment_id as string | undefined,
        status: req.query.status as import('@prisma/client').InspectionStatus | undefined,
      });

      return res.json({ items: inspections, count: inspections.length });
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const inspection = await inspectionService.getById(routeParam(req.params.id), companyId);
      return res.json(inspection);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const inspection = await inspectionService.update({
        id: routeParam(req.params.id),
        companyId,
        title: req.body.title,
        description: req.body.description,
        checklistItems: mapChecklistItems(req.body.checklist_items),
        equipmentId: req.body.equipment_id,
        workerId: req.body.worker_id,
        inspectorId: req.body.inspector_id,
        location: req.body.location,
        scheduledAt: req.body.scheduled_at,
        passThreshold: req.body.pass_threshold,
        metadata: req.body.metadata,
      });

      return res.json(inspection);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const result = await inspectionService.softDelete(routeParam(req.params.id), companyId);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async submitFindings(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const inspection = await inspectionService.submitFindings({
        id: routeParam(req.params.id),
        companyId,
        userId: req.userId!,
        token: authToken(req),
        findings: mapFindings(req.body.findings),
        autoCreateCapa: req.body.auto_create_capa,
      });

      return res.json(inspection);
    } catch (e) {
      next(e);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const inspection = await inspectionService.complete({
        id: routeParam(req.params.id),
        companyId,
        userId: req.userId!,
        token: authToken(req),
      });

      return res.json(inspection);
    } catch (e) {
      next(e);
    }
  },

  async safetyGate(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const result = await inspectionService.safetyGateCheck({
        id: routeParam(req.params.id),
        companyId,
        token: authToken(req),
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async syncOffline(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      inspectionService.assertCompanyAccess(req.companyId!, companyId);

      const result = await inspectionService.syncOffline({
        deviceId: req.body.device_id,
        companyId,
        userId: req.userId!,
        token: authToken(req),
        actions: req.body.actions,
        batchId: req.body.batch_id,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },
};
