import { Injectable } from '@nestjs/common';
import { VsiCopilotEngineService } from './copilot/vsi-copilot-engine.service';
import type { InspectionCopilotOutput } from './copilot/vsi-copilot.types';
import { scoreToSeverity } from './copilot/vsi-copilot.mappers';

export type InvestigationPack = {
  generatedAt: string;
  engine: 'vase' | 'copilot';
  rootCauses: Array<{
    category: string;
    description: string;
    confidence: number;
  }>;
  capaSuggestions: Array<{
    title: string;
    description: string;
    actionType: 'corrective' | 'preventive';
    priority: 'low' | 'medium' | 'high';
  }>;
  similarPatterns: string[];
  summary: string;
  interventions?: Array<{ type: string; message: string }>;
};

export type PhotoClassificationResult = {
  engines: string[];
  suggestedPolarity: 'safe' | 'at_risk';
  suggestedSeverity: 'low' | 'medium' | 'high' | 'critical';
  suggestedCaption?: string;
  riskCategory?: string;
  hazardPatterns: string[];
  hazardSummary?: string;
  riskScore?: { level: string; score: number };
  vision?: unknown;
  llm?: unknown;
  copilot?: InspectionCopilotOutput;
  cailEnvelope?: unknown;
};

@Injectable()
export class SafetyIntelligenceAiService {
  constructor(private readonly copilot: VsiCopilotEngineService) {}

  async buildInvestigationPack(input: {
    title: string;
    description?: string | null;
    narrative?: string | null;
    severity?: string;
    relatedCailTitles?: string[];
    companyId?: number;
    projectId?: number;
    trainingGaps?: number;
    inspectionFailures?: number;
    openCailCount?: number;
  }): Promise<InvestigationPack> {
    const run = await this.copilot.investigateIncident({
      ...input,
      relatedCail: input.relatedCailTitles,
    });
    const incident = run.output as {
      root_cause_primary: string;
      root_cause_secondary: string;
      corrective_actions: string[];
      preventive_actions: string[];
      sif_potential: string;
      lessons_learned: string;
      predictive_risk_flags: string[];
    };

    return {
      generatedAt: run.generatedAt,
      engine: 'copilot',
      rootCauses: [
        {
          category: 'primary',
          description: incident.root_cause_primary,
          confidence: 0.85,
        },
        ...(incident.root_cause_secondary
          ? [
              {
                category: 'secondary',
                description: incident.root_cause_secondary,
                confidence: 0.65,
              },
            ]
          : []),
      ],
      capaSuggestions: [
        ...incident.corrective_actions.map((action) => ({
          title: action.slice(0, 120),
          description: action,
          actionType: 'corrective' as const,
          priority:
            incident.sif_potential === 'critical' ||
            incident.sif_potential === 'high'
              ? ('high' as const)
              : ('medium' as const),
        })),
        ...incident.preventive_actions.map((action) => ({
          title: action.slice(0, 120),
          description: action,
          actionType: 'preventive' as const,
          priority: 'medium' as const,
        })),
      ],
      similarPatterns: incident.predictive_risk_flags,
      summary: incident.lessons_learned,
      interventions: incident.preventive_actions.map((message) => ({
        type: 'preventive',
        message,
      })),
    };
  }

  async classifyInspectionPhoto(caption?: string) {
    return this.classifyInspectionPhotoFull({ caption });
  }

  /** Permanent Copilot engine: inspection module (vision + LLM + heuristic). */
  async classifyInspectionPhotoFull(input: {
    caption?: string;
    ocrText?: string;
    imageUrl?: string;
    imageBase64?: string;
    imageMimeType?: string;
    companyId?: number;
    projectId?: number;
  }): Promise<PhotoClassificationResult> {
    const run = await this.copilot.inspectPhoto(input);
    const out = run.output as InspectionCopilotOutput;
    return {
      engines: run.engine,
      suggestedPolarity: out.classification,
      suggestedSeverity: scoreToSeverity(out.severity_score),
      suggestedCaption:
        out.recommended_corrective_action ||
        out.positive_observation ||
        input.caption,
      riskCategory: out.risk_category,
      hazardPatterns: out.tags,
      hazardSummary: out.hazard_type,
      copilot: out,
      cailEnvelope: run.cailEnvelope,
    };
  }

  async buildLessonInsights(input: {
    title: string;
    description?: string | null;
    sourceType: string;
    rootCauseNotes?: string | null;
    rootCauseCategory?: string | null;
    severity?: string;
    companyId?: number;
    projectId?: number;
    correctiveAction?: string | null;
  }) {
    const run = await this.copilot.generateLesson({
      ...input,
      companyId: input.companyId,
      projectId: input.projectId,
    });
    const lesson = run.output as {
      summary: string;
      what_went_wrong: string;
      what_fixed_it: string;
      how_to_prevent_recurrence: string;
      recommended_training_topics: string[];
      recommended_toolbox_talk: string;
    };

    return {
      engine: run.engine.join('+') as 'copilot',
      summary: lesson.summary,
      rootCause: lesson.what_went_wrong,
      correctiveAction: lesson.what_fixed_it,
      keyTakeaways: [
        lesson.how_to_prevent_recurrence,
        lesson.recommended_toolbox_talk,
        ...lesson.recommended_training_topics,
      ].filter(Boolean),
      riskLevel: input.severity ?? 'medium',
      copilot: lesson,
      cailEnvelope: run.cailEnvelope,
    };
  }

  async analyzeCailEntry(input: {
    title: string;
    description?: string | null;
    sourceType: string;
    severity?: string;
    riskCategory?: string | null;
    rootCauseNotes?: string | null;
    projectId: number;
    companyId: number;
    openCailCount?: number;
  }) {
    const run = await this.copilot.analyzeCail({
      ...input,
      openCailCount: input.openCailCount,
    });
    const envelope = run.cailEnvelope;

    return {
      generatedAt: run.generatedAt,
      engine: run.engine.join('+'),
      summary: envelope.root_cause_explanation || envelope.lessons_learned,
      rootCauseSuggestions: [
        {
          category: envelope.root_cause_category,
          description: envelope.root_cause_explanation,
          confidence: 0.8,
        },
      ],
      correctiveActionSuggestions: envelope.recommended_corrective_actions.map(
        (description) => ({
          title: description.slice(0, 120),
          description,
          actionType: 'corrective' as const,
          priority: 'medium' as const,
        }),
      ),
      similarPatterns: envelope.predictive_risk_flags,
      interventions: envelope.recommended_preventive_actions.map((message) => ({
        type: 'preventive',
        message,
      })),
      cailEnvelope: envelope,
      copilot: run.output,
      copilotRun: run,
    };
  }

  async buildPredictiveRisk(input: {
    projectId: number;
    openCailCount: number;
    overdueCailCount: number;
    atRiskBboCount: number;
    inspectionAtRiskCount: number;
    incidentCount: number;
    companyHotspots: Array<{
      companyId: number;
      count: number;
      topCategory: string | null;
    }>;
  }) {
    const run = await this.copilot.predictRisk({
      ...input,
      companyHotspots: input.companyHotspots.map(
        (c) =>
          `Company ${c.companyId}: ${c.count} items (${
            c.topCategory ?? 'mixed'
          })`,
      ),
    });
    const out = run.output as {
      emerging_risks: string[];
      recommended_preventive_actions: string[];
      early_warning_flags: string[];
    };

    const score = Math.min(
      100,
      40 +
        input.overdueCailCount * 3 +
        input.incidentCount * 8 +
        input.atRiskBboCount * 2,
    );
    const predictedLevel =
      score >= 80
        ? 'critical'
        : score >= 65
        ? 'high'
        : score >= 45
        ? 'elevated'
        : 'low';

    return {
      engine: run.engine.join('+'),
      predictedLevel,
      score,
      precursors: [...out.emerging_risks, ...out.early_warning_flags],
      interventions: out.recommended_preventive_actions.map((message) => ({
        type: 'preventive',
        message,
        urgency: predictedLevel === 'critical' ? 'immediate' : 'this_week',
      })),
      copilot: out,
      cailEnvelope: run.cailEnvelope,
    };
  }
}
