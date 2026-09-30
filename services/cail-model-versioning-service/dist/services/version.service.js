"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionService = void 0;
const client_1 = require("@prisma/client");
const version_promotion_engine_1 = require("../engines/version-promotion.engine");
const version_repository_1 = require("../models/version.repository");
const training_client_1 = require("../clients/training.client");
const errors_1 = require("../utils/errors");
function mapVersion(row) {
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
exports.versionService = {
    async register(input) {
        const existing = await version_repository_1.versionRepository.findByModelVersion(input.companyId, input.modelId, input.version);
        if (existing)
            throw new errors_1.ConflictError('Model version already exists');
        let artifactUri = input.artifactUri;
        if (input.trainingJobId && !artifactUri) {
            const job = await training_client_1.trainingClient.getTrainingJob(input.companyId, input.trainingJobId);
            artifactUri = job?.artifacts?.[0]?.artifact_uri;
        }
        const row = await version_repository_1.versionRepository.create({
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
    async list(companyId, modelId, status) {
        const rows = await version_repository_1.versionRepository.list(companyId, modelId, status);
        return rows.map(mapVersion);
    },
    async getById(id, companyId) {
        const row = await version_repository_1.versionRepository.findById(id, companyId);
        if (!row)
            throw new errors_1.NotFoundError('Model version not found');
        return mapVersion(row);
    },
    async promote(id, companyId, performedBy, reason) {
        const row = await version_repository_1.versionRepository.findById(id, companyId);
        if (!row)
            throw new errors_1.NotFoundError('Model version not found');
        version_promotion_engine_1.versionPromotionEngine.assertPromote(row.status);
        const toStatus = version_promotion_engine_1.versionPromotionEngine.canPromote(row.status);
        if (toStatus === client_1.ModelVersionStatus.production) {
            await version_repository_1.versionRepository.retireProduction(companyId, row.modelId, id);
        }
        await version_repository_1.versionRepository.updateStatus(id, companyId, toStatus);
        await version_repository_1.versionRepository.recordPromotion({
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
    async rollback(id, companyId, performedBy, reason) {
        const row = await version_repository_1.versionRepository.findById(id, companyId);
        if (!row)
            throw new errors_1.NotFoundError('Model version not found');
        version_promotion_engine_1.versionPromotionEngine.assertRollback(row.status);
        const toStatus = version_promotion_engine_1.versionPromotionEngine.canRollback(row.status);
        await version_repository_1.versionRepository.updateStatus(id, companyId, toStatus);
        await version_repository_1.versionRepository.recordPromotion({
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
    async registerFromTraining(input) {
        const job = await training_client_1.trainingClient.getTrainingJob(input.companyId, input.trainingJobId, input.token);
        if (!job)
            throw new errors_1.NotFoundError('Training job not found or unavailable');
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
