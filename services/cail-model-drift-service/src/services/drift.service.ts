import { driftDetectionEngine } from '../engines/drift-detection.engine';
import { driftRepository } from '../models/drift.repository';
import { NotFoundError } from '../utils/errors';
import type { FeatureStats } from '../engines/drift-detection.engine';

function mapReport(row: {
  id: string;
  companyId: string;
  modelId: string;
  modelVersion: string | null;
  baselineStats: unknown;
  currentStats: unknown;
  featureDrifts: unknown;
  driftScore: number;
  driftDetected: boolean;
  createdBy: string;
  createdAt: Date;
}) {
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

export const driftService = {
  async detect(input: {
    companyId: string;
    modelId: string;
    modelVersion?: string;
    baselineStats: Record<string, FeatureStats>;
    currentStats: Record<string, FeatureStats>;
    createdBy: string;
  }) {
    const thresholds = await driftRepository.listThresholds(input.companyId, input.modelId);
    const thresholdMap = Object.fromEntries(
      thresholds.map((t) => [t.featureName, t.threshold]),
    );

    const result = driftDetectionEngine.detect({
      baseline: input.baselineStats,
      current: input.currentStats,
      thresholds: thresholdMap,
    });

    const report = await driftRepository.createReport({
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
      await driftRepository.emitEvent({
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

  async listReports(companyId: string, modelId?: string) {
    const rows = await driftRepository.listReports(companyId, modelId);
    return rows.map(mapReport);
  },

  async getReport(id: string, companyId: string) {
    const row = await driftRepository.findReportById(id, companyId);
    if (!row) throw new NotFoundError('Drift report not found');
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

  async createThreshold(input: {
    companyId: string;
    modelId: string;
    featureName: string;
    method?: string;
    threshold: number;
  }) {
    const row = await driftRepository.createThreshold({
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

  async listThresholds(companyId: string, modelId?: string) {
    const rows = await driftRepository.listThresholds(companyId, modelId);
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

  async updateThreshold(
    id: string,
    companyId: string,
    data: { threshold?: number; method?: string; enabled?: boolean },
  ) {
    const result = await driftRepository.updateThreshold(id, companyId, data);
    if (result.count === 0) throw new NotFoundError('Threshold not found');
    const rows = await driftRepository.listThresholds(companyId);
    const row = rows.find((r) => r.id === id);
    if (!row) throw new NotFoundError('Threshold not found');
    return {
      id: row.id,
      feature_name: row.featureName,
      threshold: row.threshold,
      enabled: row.enabled,
    };
  },

  async deleteThreshold(id: string, companyId: string) {
    const result = await driftRepository.deleteThreshold(id, companyId);
    if (result.count === 0) throw new NotFoundError('Threshold not found');
  },
};
