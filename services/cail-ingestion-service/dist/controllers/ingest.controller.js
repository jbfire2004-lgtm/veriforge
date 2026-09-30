"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestController = void 0;
const domain_event_consumer_1 = require("../consumers/domain-event.consumer");
const ingest_service_1 = require("../services/ingest.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.ingestController = {
    async manual(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const records = (req.body.records ?? []);
            const normalizedRecords = records.map((r) => ({
                module: r.module ?? r.source_module ?? 'unknown',
                id: r.id ?? r.source_id ?? '',
                payload: r.payload ?? r.data ?? {},
                labels: r.labels ?? r.label_set,
            }));
            const result = await ingest_service_1.ingestService.ingestManual({
                companyId,
                modelId: req.body.model_id ?? req.body.modelId,
                version: req.body.version,
                datasetReference: req.body.dataset_reference ?? req.body.datasetReference,
                records: normalizedRecords,
            });
            return res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async stats(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const stats = await ingest_service_1.ingestService.getStats(companyId);
            return res.json(stats);
        }
        catch (e) {
            next(e);
        }
    },
    async event(req, res, next) {
        try {
            const companyId = String(req.body.company_id ?? req.body.companyId ?? req.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const payload = {
                name: req.body.name,
                occurredAt: req.body.occurred_at ?? req.body.occurredAt ?? new Date().toISOString(),
                actorId: req.body.actor_id ?? req.body.actorId,
                companyId: req.body.company_id ?? req.body.companyId ?? companyId,
                projectId: req.body.project_id ?? req.body.projectId,
                entityType: req.body.entity_type ?? req.body.entityType,
                entityId: req.body.entity_id ?? req.body.entityId,
                data: req.body.data,
            };
            const events = req.body.events;
            if (events?.length) {
                const batch = await ingest_service_1.ingestService.ingestEvents(events.map((e) => ({
                    ...e,
                    companyId: e.companyId ?? companyId,
                })));
                return res.status(202).json(batch);
            }
            const { accepted, handlersRun } = await domain_event_consumer_1.domainEventConsumer.dispatch({
                ...payload,
                companyId,
            });
            return res.status(accepted ? 202 : 400).json({ accepted, handlersRun });
        }
        catch (e) {
            next(e);
        }
    },
};
