"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestService = void 0;
const env_1 = require("../config/env");
const domain_event_consumer_1 = require("../consumers/domain-event.consumer");
const anomaly_engine_1 = require("../engines/anomaly.engine");
const feature_set_engine_1 = require("../engines/feature-set.engine");
const normalization_engine_1 = require("../engines/normalization.engine");
const training_data_repository_1 = require("../models/training-data.repository");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function resolveCompanyId(explicit, fromEvent) {
    const id = explicit ?? (fromEvent !== undefined ? String(fromEvent) : undefined);
    if (!id)
        throw new errors_1.BadRequestError('company_id is required');
    return id;
}
function datasetRef(prefix, companyId) {
    const day = new Date().toISOString().slice(0, 10);
    return `${prefix}/${companyId}/${day}`;
}
exports.ingestService = {
    async ingestManual(input) {
        if (!input.records?.length) {
            throw new errors_1.BadRequestError('records array is required');
        }
        const modelId = input.modelId ?? env_1.env.defaultModelId;
        const version = input.version ?? env_1.env.defaultModelVersion;
        const datasetReference = input.datasetReference ?? datasetRef('manual', input.companyId);
        const report = normalization_engine_1.normalizationEngine.normalize(input.records);
        const normAnomalies = anomaly_engine_1.anomalyEngine.detectFromNormalization(report);
        const rows = [];
        const anomalyKeys = new Set(normAnomalies.map((a) => `${a.sourceModule}:${a.sourceId}`));
        for (const record of report.records) {
            const feature = feature_set_engine_1.featureSetEngine.buildFromRecord(input.companyId, record);
            const featureAnomalies = anomaly_engine_1.anomalyEngine.detectFromFeature(feature);
            const isAnomaly = anomalyKeys.has(`${record.sourceModule}:${record.sourceId}`) ||
                featureAnomalies.length > 0;
            rows.push({
                companyId: input.companyId,
                modelId,
                version,
                datasetReference,
                featureSet: feature,
                labelSet: record.labelJson,
                sourceEvent: 'manual.ingest',
                anomalyFlag: isAnomaly,
                qualityScore: record.qualityScore,
            });
        }
        const result = await training_data_repository_1.trainingDataRepository.createMany(rows);
        logger_1.logger.info('manual ingest complete', {
            companyId: input.companyId,
            stored: result.count,
            skipped: report.missing.length,
        });
        return {
            stored: result.count,
            skipped: report.missing.length,
            anomalies: normAnomalies,
            datasetReference,
            modelId,
            version,
            report,
        };
    },
    async ingestEvent(event) {
        const companyId = resolveCompanyId(undefined, event.companyId);
        const modelId = env_1.env.defaultModelId;
        const version = env_1.env.defaultModelVersion;
        const datasetReference = datasetRef(`events/${event.name}`, companyId);
        const raw = [
            {
                module: event.entityType ?? event.name.split('.')[0],
                id: String(event.entityId ?? event.name),
                payload: {
                    ...event.data,
                    entityType: event.entityType,
                    entityId: event.entityId,
                    projectId: event.projectId,
                    actorId: event.actorId,
                    eventName: event.name,
                },
                labels: {
                    event: event.name,
                    occurredAt: event.occurredAt,
                },
            },
        ];
        const report = normalization_engine_1.normalizationEngine.normalize(raw);
        const normAnomalies = anomaly_engine_1.anomalyEngine.detectFromNormalization(report);
        const feature = report.records[0] !== undefined
            ? feature_set_engine_1.featureSetEngine.buildFromRecord(companyId, report.records[0], {
                eventName: event.name,
                occurredAt: event.occurredAt,
                projectId: event.projectId !== undefined ? String(event.projectId) : undefined,
            })
            : feature_set_engine_1.featureSetEngine.buildFromEvent(companyId, event);
        const featureAnomalies = anomaly_engine_1.anomalyEngine.detectFromFeature(feature);
        const isAnomaly = normAnomalies.length > 0 || featureAnomalies.length > 0;
        const result = await training_data_repository_1.trainingDataRepository.createMany([
            {
                companyId,
                modelId,
                version,
                datasetReference,
                featureSet: feature,
                labelSet: {
                    event: event.name,
                    occurredAt: event.occurredAt,
                    ...(report.records[0]?.labelJson ?? {}),
                },
                sourceEvent: event.name,
                anomalyFlag: isAnomaly,
                qualityScore: report.records[0]?.qualityScore ?? 1,
            },
        ]);
        return {
            stored: result.count,
            skipped: report.missing.length,
            anomalies: [...normAnomalies, ...featureAnomalies],
            datasetReference,
            modelId,
            version,
        };
    },
    async ingestEvents(events) {
        let processed = 0;
        let rejected = 0;
        for (const event of events) {
            const dispatch = await domain_event_consumer_1.domainEventConsumer.dispatch(event);
            if (!dispatch.accepted) {
                rejected += 1;
                continue;
            }
            processed += 1;
        }
        return { processed, rejected };
    },
    async getStats(companyId) {
        const [totalRecords, anomalyCount, byModel, byDataset, bySourceEvent, last] = await Promise.all([
            training_data_repository_1.trainingDataRepository.countByCompany(companyId),
            training_data_repository_1.trainingDataRepository.countAnomalies(companyId),
            training_data_repository_1.trainingDataRepository.groupByModel(companyId),
            training_data_repository_1.trainingDataRepository.groupByDataset(companyId),
            training_data_repository_1.trainingDataRepository.groupBySourceEvent(companyId),
            training_data_repository_1.trainingDataRepository.lastCreatedAt(companyId),
        ]);
        return {
            companyId,
            totalRecords,
            anomalyCount,
            byModel: byModel.map((r) => ({
                modelId: r.modelId,
                version: r.version,
                count: r._count._all,
            })),
            byDataset: byDataset.map((r) => ({
                datasetReference: r.datasetReference,
                count: r._count._all,
            })),
            bySourceEvent: bySourceEvent
                .filter((r) => r.sourceEvent)
                .map((r) => ({
                sourceEvent: r.sourceEvent,
                count: r._count._all,
            })),
            eventsProcessed: domain_event_consumer_1.domainEventConsumer.getEventCounts(),
            lastIngestedAt: last?.createdAt.toISOString() ?? null,
        };
    },
};
