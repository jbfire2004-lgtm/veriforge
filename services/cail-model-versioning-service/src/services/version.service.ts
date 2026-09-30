import { ModelVersionStatus } from '@prisma/client';
import { versionPromotionEngine } from '../engines/version-promotion.engine';
import { versionRepository } from '../models/version.repository';
import { trainingClient } from '../clients/training.client';
import { ConflictError, NotFoundError } from '../utils/errors';
import type { ModelVersionStatus as Status } from '../types';

function mapVersion(row: NonNullable<Awaited<ReturnType<typeof versionRepository.findById>>>) {
  return {
    id: row.id,
    company_id: row.companyId,
    model_id: row.modelId,
    version: row.version,
    status: row.status,
    training_job_id: row.trainingJobId,
    artifact_uri: row.artifactUri,
    metadata: row.metadata,
    created_by: row.createdBy,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export const versionService = {
  async register(input: {
    companyId: string;
    modelId: string;
    version: string;
    createdBy: string;
    trainingJobId?: string;
    artifactUri?: string;
    metadata?: Record<string, unknown>;
  }) {
    const existing = await versionRepository.findByModelVersion(
      input.companyId,
      input.modelId,
      input.version,
    );
    if (existing) throw new ConflictError('Model version already exists');

    let artifactUri = input.artifactUri;
    if (input.trainingJobId && !artifactUri) {
      const job = await trainingClient.getTrainingJob(input.companyId, input.trainingJobId);
      artifactUri = job?.artifacts?.[0]?.artifact_uri;
    }

    const row = await versionRepository.create({
      companyId: input.companyId,
      modelId: input.modelId,
      version: input.version,
      createdBy: input.createdBy,
      trainingJobId: input.trainingJobId,
      artifactUri,
      metadata: input.metadata,
    });

    return mapVersion(row);
  },

  async list(companyId: string, modelId?: string, status?: ModelVersionStatus) {
    const rows = await versionRepository.list(companyId, modelId, status);
    return rows.map(mapVersion);
  },

  async getById(id: string, companyId: string) {
    const row = await versionRepository.findById(id, companyId);
    if (!row) throw new NotFoundError('Model version not found');
    return mapVersion(row);
  },

  async promote(id: string, companyId: string, performedBy: string, reason?: string) {
    const row = await versionRepository.findById(id, companyId);
    if (!row) throw new NotFoundError('Model version not found');

    versionPromotionEngine.assertPromote(row.status as Status);
    const toStatus = versionPromotionEngine.canPromote(row.status as Status)!;

    if (toStatus === ModelVersionStatus.production) {
      await versionRepository.retireProduction(companyId, row.modelId, id);
    }

    await versionRepository.updateStatus(id, companyId, toStatus);
    await versionRepository.recordPromotion({
      companyId,
      modelVersionId: id,
      action: 'promote',
      fromStatus: row.status,
      toStatus,
      performedBy,
      reason,
    });

    return this.getById(id, companyId);
  },

  async rollback(id: string, companyId: string, performedBy: string, reason?: string) {
    const row = await versionRepository.findById(id, companyId);
    if (!row) throw new NotFoundError('Model version not found');

    versionPromotionEngine.assertRollback(row.status as Status);
    const toStatus = versionPromotionEngine.canRollback(row.status as Status)!;

    await versionRepository.updateStatus(id, companyId, toStatus);
    await versionRepository.recordPromotion({
      companyId,
      modelVersionId: id,
      action: 'rollback',
      fromStatus: row.status,
      toStatus,
      performedBy,
      reason,
    });

    return this.getById(id, companyId);
  },

  async registerFromTraining(input: {
    companyId: string;
    modelId: string;
    version: string;
    trainingJobId: string;
    createdBy: string;
    token: string;
  }) {
    const job = await trainingClient.getTrainingJob(
      input.companyId,
      input.trainingJobId,
      input.token,
    );
    if (!job) throw new NotFoundError('Training job not found or unavailable');

    return this.register({
      companyId: input.companyId,
      modelId: input.modelId,
      version: input.version,
      createdBy: input.createdBy,
      trainingJobId: input.trainingJobId,
      artifactUri: job.artifacts?.[0]?.artifact_uri,
      metadata: { training_status: job.status },
    });
  },
};
