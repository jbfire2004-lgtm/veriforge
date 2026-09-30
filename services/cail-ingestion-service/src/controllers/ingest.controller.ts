import type { Request, Response, NextFunction } from 'express';
import { domainEventConsumer } from '../consumers/domain-event.consumer';
import { ingestService } from '../services/ingest.service';
import { assertCompanyScope } from '../middleware/auth.middleware';
import type { DomainEventPayload, RawIngestRecord } from '../types';

export const ingestController = {
  async manual(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const records = (req.body.records ?? []) as RawIngestRecord[];
      const normalizedRecords = records.map((r) => ({
        module: r.module ?? (r as { source_module?: string }).source_module ?? 'unknown',
        id: r.id ?? (r as { source_id?: string }).source_id ?? '',
        payload: r.payload ?? (r as { data?: Record<string, unknown> }).data ?? {},
        labels: r.labels ?? (r as { label_set?: Record<string, unknown> }).label_set,
      }));

      const result = await ingestService.ingestManual({
        companyId,
        modelId: req.body.model_id ?? req.body.modelId,
        version: req.body.version,
        datasetReference: req.body.dataset_reference ?? req.body.datasetReference,
        records: normalizedRecords,
      });

      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const stats = await ingestService.getStats(companyId);
      return res.json(stats);
    } catch (e) {
      next(e);
    }
  },

  async event(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = String(req.body.company_id ?? req.body.companyId ?? req.companyId);
      assertCompanyScope(req, companyId);

      const payload: DomainEventPayload = {
        name: req.body.name,
        occurredAt: req.body.occurred_at ?? req.body.occurredAt ?? new Date().toISOString(),
        actorId: req.body.actor_id ?? req.body.actorId,
        companyId: req.body.company_id ?? req.body.companyId ?? companyId,
        projectId: req.body.project_id ?? req.body.projectId,
        entityType: req.body.entity_type ?? req.body.entityType,
        entityId: req.body.entity_id ?? req.body.entityId,
        data: req.body.data,
      };

      const events = req.body.events as DomainEventPayload[] | undefined;
      if (events?.length) {
        const batch = await ingestService.ingestEvents(
          events.map((e) => ({
            ...e,
            companyId: e.companyId ?? companyId,
          })),
        );
        return res.status(202).json(batch);
      }

      const { accepted, handlersRun } = await domainEventConsumer.dispatch({
        ...payload,
        companyId,
      });

      return res.status(accepted ? 202 : 400).json({ accepted, handlersRun });
    } catch (e) {
      next(e);
    }
  },
};
