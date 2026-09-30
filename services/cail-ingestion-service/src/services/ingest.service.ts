import { env } from '../config/env';
import { domainEventConsumer } from '../consumers/domain-event.consumer';
import { anomalyEngine } from '../engines/anomaly.engine';
import { featureSetEngine } from '../engines/feature-set.engine';
import { normalizationEngine } from '../engines/normalization.engine';
import { trainingDataRepository } from '../models/training-data.repository';
import { BadRequestError } from '../utils/errors';
import type {
  DomainEventPayload,
  IngestResult,
  IngestStats,
  RawIngestRecord,
} from '../types';
import { logger } from '../utils/logger';

function resolveCompanyId(explicit?: string, fromEvent?: string | number): string {
  const id = explicit ?? (fromEvent !== undefined ? String(fromEvent) : undefined);
  if (!id) throw new BadRequestError('company_id is required');
  return id;
}

function datasetRef(prefix: string, companyId: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `${prefix}/${companyId}/${day}`;
}

export const ingestService = {
  async ingestManual(input: {
    companyId: string;
    modelId?: string;
    version?: number;
    datasetReference?: string;
    records: RawIngestRecord[];
  }): Promise<IngestResult & { report: ReturnType<typeof normalizationEngine.normalize> }> {
    if (!input.records?.length) {
      throw new BadRequestError('records array is required');
    }

    const modelId = input.modelId ?? env.defaultModelId;
    const version = input.version ?? env.defaultModelVersion;
    const datasetReference = input.datasetReference ?? datasetRef('manual', input.companyId);

    const report = normalizationEngine.normalize(input.records);
    const normAnomalies = anomalyEngine.detectFromNormalization(report);

    const rows: Array<{
      companyId: string;
      modelId: string;
      version: number;
      datasetReference: string;
      featureSet: unknown;
      labelSet?: unknown;
      sourceEvent?: string;
      anomalyFlag: boolean;
      qualityScore: number;
    }> = [];

    const anomalyKeys = new Set(
      normAnomalies.map((a) => `${a.sourceModule}:${a.sourceId}`),
    );

    for (const record of report.records) {
      const feature = featureSetEngine.buildFromRecord(input.companyId, record);
      const featureAnomalies = anomalyEngine.detectFromFeature(feature);
      const isAnomaly =
        anomalyKeys.has(`${record.sourceModule}:${record.sourceId}`) ||
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

    const result = await trainingDataRepository.createMany(rows);

    logger.info('manual ingest complete', {
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

  async ingestEvent(event: DomainEventPayload): Promise<IngestResult> {
    const companyId = resolveCompanyId(undefined, event.companyId);
    const modelId = env.defaultModelId;
    const version = env.defaultModelVersion;
    const datasetReference = datasetRef(`events/${event.name}`, companyId);

    const raw: RawIngestRecord[] = [
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

    const report = normalizationEngine.normalize(raw);
    const normAnomalies = anomalyEngine.detectFromNormalization(report);

    const feature =
      report.records[0] !== undefined
        ? featureSetEngine.buildFromRecord(companyId, report.records[0], {
            eventName: event.name,
            occurredAt: event.occurredAt,
            projectId: event.projectId !== undefined ? String(event.projectId) : undefined,
          })
        : featureSetEngine.buildFromEvent(companyId, event);

    const featureAnomalies = anomalyEngine.detectFromFeature(feature);
    const isAnomaly = normAnomalies.length > 0 || featureAnomalies.length > 0;

    const result = await trainingDataRepository.createMany([
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

  async ingestEvents(events: DomainEventPayload[]): Promise<{
    processed: number;
    rejected: number;
  }> {
    let processed = 0;
    let rejected = 0;

    for (const event of events) {
      const dispatch = await domainEventConsumer.dispatch(event);
      if (!dispatch.accepted) {
        rejected += 1;
        continue;
      }
      processed += 1;
    }

    return { processed, rejected };
  },

  async getStats(companyId: string): Promise<IngestStats> {
    const [totalRecords, anomalyCount, byModel, byDataset, bySourceEvent, last] =
      await Promise.all([
        trainingDataRepository.countByCompany(companyId),
        trainingDataRepository.countAnomalies(companyId),
        trainingDataRepository.groupByModel(companyId),
        trainingDataRepository.groupByDataset(companyId),
        trainingDataRepository.groupBySourceEvent(companyId),
        trainingDataRepository.lastCreatedAt(companyId),
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
          sourceEvent: r.sourceEvent!,
          count: r._count._all,
        })),
      eventsProcessed: domainEventConsumer.getEventCounts(),
      lastIngestedAt: last?.createdAt.toISOString() ?? null,
    };
  },
};
