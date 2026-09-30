import { TrainingJobStatus } from '@prisma/client';
import { jobStatusTransitionEngine } from '../engines/job-status-transition.engine';
import { trainingRepository } from '../models/training.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';
import type { DatasetReferenceInput, ModelArtifactInput, TrainingJobStatus as JobStatus } from '../types';

function mapJob(row: Awaited<ReturnType<typeof trainingRepository.findById>>) {
  if (!row) return null;
  return {
    id: row.id,
    company_id: row.companyId,
    name: row.name,
    model_type: row.modelType,
    status: row.status,
    config: row.config,
    error_message: row.errorMessage,
    started_at: row.startedAt?.toISOString() ?? null,
    completed_at: row.completedAt?.toISOString() ?? null,
    created_by: row.createdBy,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    allowed_transitions: jobStatusTransitionEngine.allowedNext(row.status as JobStatus),
    dataset_references: row.datasetReferences.map((d) => ({
      id: d.id,
      dataset_id: d.datasetId,
      dataset_version: d.datasetVersion,
      source_type: d.sourceType,
      metadata: d.metadata,
    })),
    artifacts: row.artifacts.map((a) => ({
      id: a.id,
      artifact_uri: a.artifactUri,
      artifact_type: a.artifactType,
      checksum: a.checksum,
      size_bytes: a.sizeBytes ? Number(a.sizeBytes) : null,
      metadata: a.metadata,
    })),
  };
}

export const trainingService = {
  async create(input: {
    companyId: string;
    name: string;
    modelType: string;
    config?: Record<string, unknown>;
    createdBy: string;
    datasets?: DatasetReferenceInput[];
  }) {
    const job = await trainingRepository.create({
      companyId: input.companyId,
      name: input.name,
      modelType: input.modelType,
      config: input.config,
      createdBy: input.createdBy,
    });

    if (input.datasets?.length) {
      for (const ds of input.datasets) {
        await trainingRepository.addDatasetReference({
          companyId: input.companyId,
          trainingJobId: job.id,
          datasetId: ds.datasetId,
          datasetVersion: ds.datasetVersion,
          sourceType: ds.sourceType,
          metadata: ds.metadata,
        });
      }
    }

    const full = await trainingRepository.findById(job.id, input.companyId);
    return mapJob(full)!;
  },

  async list(companyId: string, status?: TrainingJobStatus) {
    const rows = await trainingRepository.list(companyId, status);
    return rows.map((r) => mapJob(r)!);
  },

  async getById(id: string, companyId: string) {
    const row = await trainingRepository.findById(id, companyId);
    if (!row) throw new NotFoundError('Training job not found');
    return mapJob(row)!;
  },

  async update(
    id: string,
    companyId: string,
    data: { name?: string; modelType?: string; config?: Record<string, unknown> },
  ) {
    const existing = await trainingRepository.findById(id, companyId);
    if (!existing) throw new NotFoundError('Training job not found');

    await trainingRepository.update(id, companyId, data);
    return this.getById(id, companyId);
  },

  async updateStatus(id: string, companyId: string, status: TrainingJobStatus) {
    const existing = await trainingRepository.findById(id, companyId);
    if (!existing) throw new NotFoundError('Training job not found');

    jobStatusTransitionEngine.assertTransition(existing.status as JobStatus, status as JobStatus);

    const patch: {
      status: TrainingJobStatus;
      errorMessage?: string | null;
      startedAt?: Date | null;
      completedAt?: Date | null;
    } = { status };

    if (status === TrainingJobStatus.running) {
      patch.startedAt = new Date();
    }
    if (status === TrainingJobStatus.completed) {
      patch.completedAt = new Date();
    }
    if (status === TrainingJobStatus.failed) {
      patch.errorMessage = 'Training failed';
    }

    await trainingRepository.updateStatus(id, companyId, patch);
    return this.getById(id, companyId);
  },

  async delete(id: string, companyId: string) {
    const result = await trainingRepository.delete(id, companyId);
    if (result.count === 0) throw new NotFoundError('Training job not found');
  },

  async addArtifact(id: string, companyId: string, input: ModelArtifactInput) {
    const existing = await trainingRepository.findById(id, companyId);
    if (!existing) throw new NotFoundError('Training job not found');

    const artifact = await trainingRepository.addArtifact({
      companyId,
      trainingJobId: id,
      artifactUri: input.artifactUri,
      artifactType: input.artifactType,
      checksum: input.checksum,
      sizeBytes: input.sizeBytes !== undefined ? BigInt(input.sizeBytes) : undefined,
      metadata: input.metadata,
    });

    return {
      id: artifact.id,
      artifact_uri: artifact.artifactUri,
      artifact_type: artifact.artifactType,
      checksum: artifact.checksum,
      size_bytes: artifact.sizeBytes ? Number(artifact.sizeBytes) : null,
      metadata: artifact.metadata,
    };
  },

  async handleIngestionEvent(input: {
    companyId: string;
    eventType: string;
    payload: Record<string, unknown>;
    createdBy: string;
    autoCreateJob?: boolean;
  }) {
    if (!input.eventType.startsWith('cail.ingest')) {
      throw new BadRequestError('Unsupported ingestion event type');
    }

    let trainingJobId: string | undefined;

    if (input.autoCreateJob !== false) {
      const job = await this.create({
        companyId: input.companyId,
        name: `Auto job from ${input.eventType}`,
        modelType: String(input.payload.model_type ?? 'default'),
        config: { source_event: input.eventType },
        createdBy: input.createdBy,
        datasets: input.payload.dataset_id
          ? [{
              datasetId: String(input.payload.dataset_id),
              datasetVersion: input.payload.dataset_version
                ? String(input.payload.dataset_version)
                : undefined,
              sourceType: 'ingestion',
            }]
          : undefined,
      });
      trainingJobId = job.id;
    }

    const log = await trainingRepository.logIngestionEvent({
      companyId: input.companyId,
      eventType: input.eventType,
      payload: input.payload,
      trainingJobId,
    });

    return {
      accepted: true,
      event_id: log.id,
      training_job_id: trainingJobId ?? null,
    };
  },
};
