"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driftService = void 0;
const drift_detection_engine_1 = require("../engines/drift-detection.engine");
const drift_repository_1 = require("../models/drift.repository");
const errors_1 = require("../utils/errors");
function mapReport(row) {
    return {
        id: row.id,
        company_id: row.companyId,
        model_id: row.modelId,
        model_version: row.modelVersion,
        baseline_stats: row.baselineStats,
        current_stats: row.currentStats,
        feature_drifts: row.featureDrifts,
        drift_score: row.driftScore,
        drift_detected: row.driftDetected,
        created_by: row.createdBy,
        created_at: row.createdAt.toISOString(),
    };
}
exports.driftService = {
    async detect(input) {
        const thresholds = await drift_repository_1.driftRepository.listThresholds(input.companyId, input.modelId);
        const thresholdMap = Object.fromEntries(thresholds.map((t) => [t.featureName, t.threshold]));
        const result = drift_detection_engine_1.driftDetectionEngine.detect({
            baseline: input.baselineStats,
            current: input.currentStats,
            thresholds: thresholdMap,
        });
        const report = await drift_repository_1.driftRepository.createReport({
            companyId: input.companyId,
            modelId: input.modelId,
            modelVersion: input.modelVersion,
            baselineStats: input.baselineStats,
            currentStats: input.currentStats,
            featureDrifts: result.featureDrifts,
            driftScore: result.driftScore,
            driftDetected: result.driftDetected,
            createdBy: input.createdBy,
        });
        if (result.driftDetected) {
            await drift_repository_1.driftRepository.emitEvent({
                companyId: input.companyId,
                driftReportId: report.id,
                eventType: 'cail.drift.detected',
                payload: {
                    model_id: input.modelId,
                    drift_score: result.driftScore,
                    features: result.featureDrifts.filter((f) => f.drifted).map((f) => f.feature),
                },
            });
        }
        return mapReport(report);
    },
    async listReports(companyId, modelId) {
        const rows = await drift_repository_1.driftRepository.listReports(companyId, modelId);
        return rows.map(mapReport);
    },
    async getReport(id, companyId) {
        const row = await drift_repository_1.driftRepository.findReportById(id, companyId);
        if (!row)
            throw new errors_1.NotFoundError('Drift report not found');
        return {
            ...mapReport(row),
            events: row.events.map((e) => ({
                id: e.id,
                event_type: e.eventType,
                payload: e.payload,
                emitted_at: e.emittedAt.toISOString(),
            })),
        };
    },
    async createThreshold(input) {
        const row = await drift_repository_1.driftRepository.createThreshold({
            companyId: input.companyId,
            modelId: input.modelId,
            featureName: input.featureName,
            method: input.method ?? 'z_score',
            threshold: input.threshold,
        });
        return {
            id: row.id,
            company_id: row.companyId,
            model_id: row.modelId,
            feature_name: row.featureName,
            method: row.method,
            threshold: row.threshold,
            enabled: row.enabled,
        };
    },
    async listThresholds(companyId, modelId) {
        const rows = await drift_repository_1.driftRepository.listThresholds(companyId, modelId);
        return rows.map((r) => ({
            id: r.id,
            company_id: r.companyId,
            model_id: r.modelId,
            feature_name: r.featureName,
            method: r.method,
            threshold: r.threshold,
            enabled: r.enabled,
        }));
    },
    async updateThreshold(id, companyId, data) {
        const result = await drift_repository_1.driftRepository.updateThreshold(id, companyId, data);
        if (result.count === 0)
            throw new errors_1.NotFoundError('Threshold not found');
        const rows = await drift_repository_1.driftRepository.listThresholds(companyId);
        const row = rows.find((r) => r.id === id);
        if (!row)
            throw new errors_1.NotFoundError('Threshold not found');
        return {
            id: row.id,
            feature_name: row.featureName,
            threshold: row.threshold,
            enabled: row.enabled,
        };
    },
    async deleteThreshold(id, companyId) {
        const result = await drift_repository_1.driftRepository.deleteThreshold(id, companyId);
        if (result.count === 0)
            throw new errors_1.NotFoundError('Threshold not found');
    },
};
