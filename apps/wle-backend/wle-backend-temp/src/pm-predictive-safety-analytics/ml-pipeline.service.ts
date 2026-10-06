import { Injectable } from '@nestjs/common';
import {
  CailIntelEntityType,
  CailIntelInferenceMode,
  CailIntelPredictionType,
  CailIntelScoreType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CailDataIngestionEngine } from '../pm-unified-safety-intelligence/engines/data-ingestion.engine';
import { MODEL_KEY, MODEL_VERSION } from './engines/risk-scoring-model.engine';
import { PredictiveFeatureExtractionService } from './feature-extraction.service';
import type {
  EntityRiskScore,
  PreventiveAction,
} from './types/predictive-analytics.types';

@Injectable()
export class PredictiveMlPipelineService {
  private readonly ingestion = new CailDataIngestionEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly features: PredictiveFeatureExtractionService,
  ) {}

  /**
   * ML pipeline stage 1–3: extract → normalize → persist training features
   */
  async ingest(companyId: number, projectId?: number) {
    const extracted = await this.features.extract(companyId, projectId);
    const raw = this.features.toIngestRecords(extracted);
    const report = this.ingestion.normalize(raw);

    let created = 0;
    for (const rec of report.records) {
      await this.prisma.cailTrainingData.create({
        data: {
          companyId,
          projectId,
          sourceModule: rec.sourceModule,
          sourceId: rec.sourceId,
          featureJson: rec.featureJson as Prisma.InputJsonValue,
          labelJson: rec.labelJson as Prisma.InputJsonValue | undefined,
          qualityScore: rec.qualityScore,
        },
      });
      created++;
    }

    return {
      recordsIngested: created,
      modules: [...new Set(report.records.map((r) => r.sourceModule))],
      quality: {
        missing: report.missing.length,
        conflicts: report.conflicts.length,
        outliers: report.outliers.length,
        anomalies: report.anomalies.length,
      },
    };
  }

  /**
   * ML pipeline stage 4: persist scores & predictions to CAIL intel tables
   */
  async persistIntelOutputs(
    companyId: number,
    projectId: number | undefined,
    entities: {
      workers: EntityRiskScore[];
      contractors: EntityRiskScore[];
      tasks: EntityRiskScore[];
      locations: EntityRiskScore[];
    },
    preventiveActions: PreventiveAction[],
  ) {
    const mode: CailIntelInferenceMode = 'batch';

    const persistScore = async (
      e: EntityRiskScore,
      scoreType: CailIntelScoreType,
      entityType: CailIntelEntityType,
    ) => {
      await this.prisma.cailScore.create({
        data: {
          companyId,
          projectId,
          entityType,
          entityId: e.entityId,
          scoreType,
          score: e.riskScore,
          maxScore: 100,
          componentsJson: {
            factors: e.factors,
            probability: e.probability,
          } as Prisma.InputJsonValue,
          modelKey: MODEL_KEY,
          modelVersion: MODEL_VERSION,
          inferenceMode: mode,
        },
      });
    };

    const persistPrediction = async (
      e: EntityRiskScore,
      predictionType: CailIntelPredictionType,
      entityType: CailIntelEntityType,
    ) => {
      await this.prisma.cailPrediction.create({
        data: {
          companyId,
          projectId,
          entityType,
          entityId: e.entityId,
          predictionType,
          probability: e.probability,
          riskLevel: e.riskLevel,
          factorsJson: e.factors as Prisma.InputJsonValue,
          modelKey: MODEL_KEY,
          modelVersion: MODEL_VERSION,
          inferenceMode: mode,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    };

    for (const w of entities.workers.slice(0, 50)) {
      await persistScore(w, 'worker_safety', 'worker');
      await persistPrediction(w, 'worker_risk', 'worker');
    }
    for (const c of entities.contractors.slice(0, 30)) {
      await persistScore(c, 'company_safety', 'company');
      await persistPrediction(c, 'company_risk', 'company');
    }
    for (const t of entities.tasks.slice(0, 30)) {
      await persistScore(t, 'jha_quality', 'jha_flha');
      await persistPrediction(t, 'incident_likelihood', 'jha_flha');
    }
    for (const l of entities.locations.slice(0, 30)) {
      await persistScore(l, 'hazard_severity', 'zone');
      await persistPrediction(l, 'hazard_emergence', 'zone');
    }

    for (const action of preventiveActions.slice(0, 25)) {
      await this.prisma.cailRecommendation.create({
        data: {
          companyId,
          projectId,
          recommendationType: this.mapActionCategory(action.category),
          title: action.title,
          reason: action.description,
          evidenceJson: action.evidence as Prisma.InputJsonValue,
          requiredActionsJson: [
            { priority: action.priority },
          ] as Prisma.InputJsonValue,
          confidence: action.confidence,
          modelKey: MODEL_KEY,
          status: 'open',
        },
      });
    }
  }

  private mapActionCategory(category: string) {
    const map: Record<string, string> = {
      training: 'training',
      inspection: 'inspection_focus',
      capa: 'corrective_action',
      equipment: 'equipment_maintenance',
      control: 'control',
      contractor: 'corrective_action',
    };
    return (map[category] ?? 'corrective_action') as never;
  }
}
