"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingService = void 0;
const client_1 = require("@prisma/client");
const job_status_transition_engine_1 = require("../engines/job-status-transition.engine");
const training_repository_1 = require("../models/training.repository");
const errors_1 = require("../utils/errors");
function mapJob(row) {
    if (!row)
        return null;
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
        allowed_transitions: job_status_transition_engine_1.jobStatusTransitionEngine.allowedNext(row.status),
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
exports.trainingService = {
    async create(input) {
        const job = await training_repository_1.trainingRepository.create({
            companyId: input.companyId,
            name: input.name,
            modelType: input.modelType,
            config: input.config,
            createdBy: input.createdBy,
        });
        if (input.datasets?.length) {
            for (const ds of input.datasets) {
                await training_repository_1.trainingRepository.addDatasetReference({
                    companyId: input.companyId,
                    trainingJobId: job.id,
                    datasetId: ds.datasetId,
                    datasetVersion: ds.datasetVersion,
                    sourceType: ds.sourceType,
                    metadata: ds.metadata,
                });
            }
        }
        const full = await training_repository_1.trainingRepository.findById(job.id, input.companyId);
        return mapJob(full);
    },
    async list(companyId, status) {
        const rows = await training_repository_1.trainingRepository.list(companyId, status);
        return rows.map((r) => mapJob(r));
    },
    async getById(id, companyId) {
        const row = await training_repository_1.trainingRepository.findById(id, companyId);
        if (!row)
            throw new errors_1.NotFoundError('Training job not found');
        return mapJob(row);
    },
    async update(id, companyId, data) {
        const existing = await training_repository_1.trainingRepository.findById(id, companyId);
        if (!existing)
            throw new errors_1.NotFoundError('Training job not found');
        await training_repository_1.trainingRepository.update(id, companyId, data);
        return this.getById(id, companyId);
    },
    async updateStatus(id, companyId, status) {
        const existing = await training_repository_1.trainingRepository.findById(id, companyId);
        if (!existing)
            throw new errors_1.NotFoundError('Training job not found');
        job_status_transition_engine_1.jobStatusTransitionEngine.assertTransition(existing.status, status);
        const patch = { status };
        if (status === client_1.TrainingJobStatus.running) {
            patch.startedAt = new Date();
        }
        if (status === client_1.TrainingJobStatus.completed) {
            patch.completedAt = new Date();
        }
        if (status === client_1.TrainingJobStatus.failed) {
            patch.errorMessage = 'Training failed';
        }
        await training_repository_1.trainingRepository.updateStatus(id, companyId, patch);
        return this.getById(id, companyId);
    },
    async delete(id, companyId) {
        const result = await training_repository_1.trainingRepository.delete(id, companyId);
        if (result.count === 0)
            throw new errors_1.NotFoundError('Training job not found');
    },
    async addArtifact(id, companyId, input) {
        const existing = await training_repository_1.trainingRepository.findById(id, companyId);
        if (!existing)
            throw new errors_1.NotFoundError('Training job not found');
        const artifact = await training_repository_1.trainingRepository.addArtifact({
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
    async handleIngestionEvent(input) {
        if (!input.eventType.startsWith('cail.ingest')) {
            throw new errors_1.BadRequestError('Unsupported ingestion event type');
        }
        let trainingJobId;
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
        const log = await training_repository_1.trainingRepository.logIngestionEvent({
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
