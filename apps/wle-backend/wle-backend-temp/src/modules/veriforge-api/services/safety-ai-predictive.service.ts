import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type PredictionType =
  | 'incident'
  | 'risk'
  | 'compliance'
  | 'training'
  | 'equipment'
  | 'fieldHazard'
  | 'kpiTrend';

export type ModelKind =
  | 'timeSeries'
  | 'riskScoring'
  | 'classification'
  | 'anomaly'
  | 'predictiveScore';

export type ClassificationLabel = 'pass' | 'fail' | 'critical';
export type DataDomain =
  | 'training'
  | 'verification'
  | 'compliance'
  | 'incident'
  | 'equipment'
  | 'fieldOps'
  | 'culture';

export type Prediction = {
  id: string;
  type: PredictionType;
  title: string;
  summary: string;
  score: number;
  confidence: number;
  classification: ClassificationLabel;
  modelId: string;
  modelKind: ModelKind;
  inputs: DataDomain[];
  horizonDays: number;
  series: number[];
  timestamp: string;
  userId: number;
};

export type RiskZone = {
  id: string;
  label: string;
  likelihood: number;
  severity: number;
  score: number;
  predicted: boolean;
  timestamp: string;
};

export type ModelSpec = {
  id: string;
  name: string;
  kind: ModelKind;
  description: string;
  inputs: DataDomain[];
  version: string;
};

export type PredictiveAnalytics = {
  totalPredictions: number;
  criticalCount: number;
  averageScore: number;
  averageConfidence: number;
  typeCounts: Record<PredictionType, number>;
  highRiskZones: number;
  modelCount: number;
  predictiveHealthScore: number;
  timestamp: string;
  userId: number | null;
};

const TYPES: PredictionType[] = [
  'incident',
  'risk',
  'compliance',
  'training',
  'equipment',
  'fieldHazard',
  'kpiTrend',
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function classify(score: number): ClassificationLabel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'fail';
  return 'pass';
}

@Injectable()
export class SafetyAiPredictiveService {
  private predSeq = 20;
  private predictions: Prediction[] = [];
  private zones: RiskZone[] = [];
  private models: ModelSpec[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const userId = 1;

    this.models = [
      {
        id: 'mdl-ts-incident',
        name: 'Incident Time-Series',
        kind: 'timeSeries',
        description: 'Forecasts incident probability from severity/frequency history',
        inputs: ['incident', 'fieldOps', 'culture'],
        version: '1.4.0',
      },
      {
        id: 'mdl-risk-matrix',
        name: 'Risk Scoring Matrix',
        kind: 'riskScoring',
        description: 'Industrial 0–100 risk score from likelihood × severity',
        inputs: ['incident', 'equipment', 'fieldOps'],
        version: '2.1.0',
      },
      {
        id: 'mdl-clf-compliance',
        name: 'Compliance Classifier',
        kind: 'classification',
        description: 'Pass/fail/critical lapse classification from expiry gaps',
        inputs: ['compliance', 'training', 'verification'],
        version: '1.2.1',
      },
      {
        id: 'mdl-anom-equip',
        name: 'Equipment Anomaly Detector',
        kind: 'anomaly',
        description: 'Detects defect/inspection anomalies for failure modeling',
        inputs: ['equipment', 'fieldOps'],
        version: '1.0.3',
      },
      {
        id: 'mdl-score-kpi',
        name: 'KPI Predictive Scorer',
        kind: 'predictiveScore',
        description: '0–100 industrial predictive score across KPI trends',
        inputs: [
          'training',
          'verification',
          'compliance',
          'incident',
          'equipment',
          'fieldOps',
          'culture',
        ],
        version: '3.0.0',
      },
    ];

    this.predictions = [
      {
        id: 'pred-incident-01',
        type: 'incident',
        title: 'Incident Probability · Cell B',
        summary: 'Elevated likelihood from severity clustering and overdue CAPA',
        score: 78,
        confidence: 86,
        classification: 'critical',
        modelId: 'mdl-ts-incident',
        modelKind: 'timeSeries',
        inputs: ['incident', 'fieldOps', 'culture'],
        horizonDays: 14,
        series: [42, 48, 55, 61, 68, 74, 78],
        timestamp: now,
        userId,
      },
      {
        id: 'pred-risk-01',
        type: 'risk',
        title: 'Site Risk Forecast',
        summary: 'High-risk zone expansion on crane path and confined space',
        score: 72,
        confidence: 81,
        classification: 'fail',
        modelId: 'mdl-risk-matrix',
        modelKind: 'riskScoring',
        inputs: ['incident', 'equipment', 'fieldOps'],
        horizonDays: 21,
        series: [50, 54, 58, 63, 67, 70, 72],
        timestamp: now,
        userId,
      },
      {
        id: 'pred-comp-01',
        type: 'compliance',
        title: 'Compliance Lapse Forecast',
        summary: 'Document expiry cluster predicted within 10 days',
        score: 81,
        confidence: 90,
        classification: 'critical',
        modelId: 'mdl-clf-compliance',
        modelKind: 'classification',
        inputs: ['compliance', 'training', 'verification'],
        horizonDays: 10,
        series: [35, 44, 52, 60, 68, 75, 81],
        timestamp: now,
        userId,
      },
      {
        id: 'pred-train-01',
        type: 'training',
        title: 'Training Failure Prediction',
        summary: 'Overdue modules and low quiz scores signal fail risk',
        score: 64,
        confidence: 77,
        classification: 'fail',
        modelId: 'mdl-clf-compliance',
        modelKind: 'classification',
        inputs: ['training', 'verification'],
        horizonDays: 7,
        series: [40, 45, 50, 55, 58, 61, 64],
        timestamp: now,
        userId,
      },
      {
        id: 'pred-equip-01',
        type: 'equipment',
        title: 'Equipment Failure · Crane-04',
        summary: 'Anomaly spike in defect rate and inspection misses',
        score: 69,
        confidence: 84,
        classification: 'fail',
        modelId: 'mdl-anom-equip',
        modelKind: 'anomaly',
        inputs: ['equipment', 'fieldOps'],
        horizonDays: 30,
        series: [30, 38, 45, 52, 58, 64, 69],
        timestamp: now,
        userId,
      },
      {
        id: 'pred-field-01',
        type: 'fieldHazard',
        title: 'Field Hazard Forecast',
        summary: 'GPS-clustered hazard density rising on Zone 3',
        score: 58,
        confidence: 73,
        classification: 'fail',
        modelId: 'mdl-ts-incident',
        modelKind: 'timeSeries',
        inputs: ['fieldOps', 'incident'],
        horizonDays: 5,
        series: [28, 34, 40, 46, 51, 55, 58],
        timestamp: now,
        userId,
      },
      {
        id: 'pred-kpi-01',
        type: 'kpiTrend',
        title: 'KPI Trend Analysis',
        summary: 'Composite industrial score trending down across domains',
        score: 47,
        confidence: 88,
        classification: 'pass',
        modelId: 'mdl-score-kpi',
        modelKind: 'predictiveScore',
        inputs: [
          'training',
          'verification',
          'compliance',
          'incident',
          'equipment',
          'fieldOps',
          'culture',
        ],
        horizonDays: 28,
        series: [72, 68, 64, 60, 55, 51, 47],
        timestamp: now,
        userId,
      },
    ];

    this.zones = [
      {
        id: 'rz-1',
        label: 'Crane Path',
        likelihood: 4,
        severity: 5,
        score: 88,
        predicted: true,
        timestamp: now,
      },
      {
        id: 'rz-2',
        label: 'Confined Space',
        likelihood: 3,
        severity: 5,
        score: 76,
        predicted: true,
        timestamp: now,
      },
      {
        id: 'rz-3',
        label: 'Hot Work Bay',
        likelihood: 3,
        severity: 3,
        score: 52,
        predicted: false,
        timestamp: now,
      },
      {
        id: 'rz-4',
        label: 'Muster Gate',
        likelihood: 2,
        severity: 2,
        score: 28,
        predicted: false,
        timestamp: now,
      },
      {
        id: 'rz-5',
        label: 'Zone 3 Field',
        likelihood: 4,
        severity: 4,
        score: 80,
        predicted: true,
        timestamp: now,
      },
      {
        id: 'rz-6',
        label: 'Tool Crib',
        likelihood: 1,
        severity: 2,
        score: 18,
        predicted: false,
        timestamp: now,
      },
    ];
  }

  overview() {
    return {
      features: [
        'Incident prediction',
        'Risk forecasting',
        'Compliance lapse prediction',
        'Training failure prediction',
        'Equipment failure modeling',
        'Field hazard forecasting',
        'KPI trend analysis',
      ],
      models: this.models,
      predictions: this.predictions,
      riskZones: this.zones,
      analytics: this.analytics(null),
    };
  }

  listByType(type: PredictionType) {
    return this.predictions.filter((p) => p.type === type);
  }

  get(id: string) {
    const row = this.predictions.find((p) => p.id === id);
    if (!row) throw new NotFoundException(`Prediction ${id} not found`);
    return row;
  }

  listModels() {
    return this.models;
  }

  listZones() {
    return this.zones;
  }

  run(
    input: {
      type: PredictionType;
      title?: string;
      modelId?: string;
      horizonDays?: number;
      seedScore?: number;
    },
    userId: number,
  ) {
    const model =
      this.models.find((m) => m.id === input.modelId) ??
      this.models.find((m) =>
        input.type === 'equipment'
          ? m.kind === 'anomaly'
          : input.type === 'risk'
            ? m.kind === 'riskScoring'
            : input.type === 'kpiTrend'
              ? m.kind === 'predictiveScore'
              : input.type === 'compliance' || input.type === 'training'
                ? m.kind === 'classification'
                : m.kind === 'timeSeries',
      ) ??
      this.models[0];

    const base =
      input.seedScore ??
      clamp(40 + Math.floor(Math.random() * 45) + (input.type === 'incident' ? 10 : 0));
    const series: number[] = [];
    let cursor = clamp(base - 30);
    for (let i = 0; i < 7; i++) {
      cursor = clamp(cursor + 3 + Math.floor(Math.random() * 6));
      series.push(cursor);
    }
    const score = series[series.length - 1];
    const confidence = clamp(70 + Math.floor(Math.random() * 25));
    const classification = classify(score);

    const prediction: Prediction = {
      id: `pred-${this.predSeq++}`,
      type: input.type,
      title: input.title ?? `${input.type} prediction`,
      summary: `Model ${model.id} forecast · horizon ${input.horizonDays ?? 14}d`,
      score,
      confidence,
      classification,
      modelId: model.id,
      modelKind: model.kind,
      inputs: model.inputs,
      horizonDays: input.horizonDays ?? 14,
      series,
      timestamp: new Date().toISOString(),
      userId,
    };

    this.predictions = [prediction, ...this.predictions];

    if (classification === 'critical') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL PREDICTION',
        message: `${prediction.title} scored ${prediction.score} (confidence ${prediction.confidence}%).`,
        forgeStatus: 'failed',
      });
    }

    return { prediction, analytics: this.analytics(userId) };
  }

  refresh(id: string, userId: number) {
    const existing = this.get(id);
    const delta = Math.floor(Math.random() * 11) - 4;
    const score = clamp(existing.score + delta);
    const series = [...existing.series.slice(1), score];
    const confidence = clamp(existing.confidence + (Math.floor(Math.random() * 5) - 2));
    const classification = classify(score);
    const updated: Prediction = {
      ...existing,
      score,
      confidence,
      classification,
      series,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.predictions = this.predictions.map((p) => (p.id === id ? updated : p));

    if (classification === 'critical') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL PREDICTION UPDATE',
        message: `${updated.title} now ${updated.score}% · model ${updated.modelId}`,
        forgeStatus: 'failed',
      });
    }

    return { prediction: updated, analytics: this.analytics(userId) };
  }

  analytics(userId: number | null): PredictiveAnalytics {
    const typeCounts = TYPES.reduce(
      (acc, t) => {
        acc[t] = 0;
        return acc;
      },
      {} as Record<PredictionType, number>,
    );
    for (const p of this.predictions) typeCounts[p.type] += 1;

    const criticalCount = this.predictions.filter(
      (p) => p.classification === 'critical',
    ).length;
    const averageScore =
      this.predictions.length === 0
        ? 0
        : clamp(
            this.predictions.reduce((s, p) => s + p.score, 0) /
              this.predictions.length,
          );
    const averageConfidence =
      this.predictions.length === 0
        ? 0
        : clamp(
            this.predictions.reduce((s, p) => s + p.confidence, 0) /
              this.predictions.length,
          );
    const highRiskZones = this.zones.filter((z) => z.score >= 70 || z.predicted)
      .length;
    const predictiveHealthScore = clamp(
      100 - criticalCount * 12 - highRiskZones * 4 + averageConfidence * 0.15,
    );

    return {
      totalPredictions: this.predictions.length,
      criticalCount,
      averageScore,
      averageConfidence,
      typeCounts,
      highRiskZones,
      modelCount: this.models.length,
      predictiveHealthScore,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}
