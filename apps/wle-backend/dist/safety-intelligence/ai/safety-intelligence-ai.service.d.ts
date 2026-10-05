import { VsiCopilotEngineService } from './copilot/vsi-copilot-engine.service';
import type { InspectionCopilotOutput } from './copilot/vsi-copilot.types';
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
    interventions?: Array<{
        type: string;
        message: string;
    }>;
};
export type PhotoClassificationResult = {
    engines: string[];
    suggestedPolarity: 'safe' | 'at_risk';
    suggestedSeverity: 'low' | 'medium' | 'high' | 'critical';
    suggestedCaption?: string;
    riskCategory?: string;
    hazardPatterns: string[];
    hazardSummary?: string;
    riskScore?: {
        level: string;
        score: number;
    };
    vision?: unknown;
    llm?: unknown;
    copilot?: InspectionCopilotOutput;
    cailEnvelope?: unknown;
};
export declare class SafetyIntelligenceAiService {
    private readonly copilot;
    constructor(copilot: VsiCopilotEngineService);
    buildInvestigationPack(input: {
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
    }): Promise<InvestigationPack>;
    classifyInspectionPhoto(caption?: string): Promise<PhotoClassificationResult>;
    classifyInspectionPhotoFull(input: {
        caption?: string;
        ocrText?: string;
        imageUrl?: string;
        imageBase64?: string;
        imageMimeType?: string;
        companyId?: number;
        projectId?: number;
    }): Promise<PhotoClassificationResult>;
    buildLessonInsights(input: {
        title: string;
        description?: string | null;
        sourceType: string;
        rootCauseNotes?: string | null;
        rootCauseCategory?: string | null;
        severity?: string;
        companyId?: number;
        projectId?: number;
        correctiveAction?: string | null;
    }): Promise<{
        engine: "copilot";
        summary: string;
        rootCause: string;
        correctiveAction: string;
        keyTakeaways: string[];
        riskLevel: string;
        copilot: {
            summary: string;
            what_went_wrong: string;
            what_fixed_it: string;
            how_to_prevent_recurrence: string;
            recommended_training_topics: string[];
            recommended_toolbox_talk: string;
        };
        cailEnvelope: import("./copilot/vsi-copilot.types").CailIntelligenceEnvelope;
    }>;
    analyzeCailEntry(input: {
        title: string;
        description?: string | null;
        sourceType: string;
        severity?: string;
        riskCategory?: string | null;
        rootCauseNotes?: string | null;
        projectId: number;
        companyId: number;
        openCailCount?: number;
    }): Promise<{
        generatedAt: string;
        engine: string;
        summary: string;
        rootCauseSuggestions: {
            category: string;
            description: string;
            confidence: number;
        }[];
        correctiveActionSuggestions: {
            title: string;
            description: string;
            actionType: "corrective";
            priority: "medium";
        }[];
        similarPatterns: string[];
        interventions: {
            type: string;
            message: string;
        }[];
        cailEnvelope: import("./copilot/vsi-copilot.types").CailIntelligenceEnvelope;
        copilot: unknown;
        copilotRun: import("./copilot/vsi-copilot.types").CopilotRunResponse;
    }>;
    buildPredictiveRisk(input: {
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
    }): Promise<{
        engine: string;
        predictedLevel: string;
        score: number;
        precursors: string[];
        interventions: {
            type: string;
            message: string;
            urgency: string;
        }[];
        copilot: {
            emerging_risks: string[];
            recommended_preventive_actions: string[];
            early_warning_flags: string[];
        };
        cailEnvelope: import("./copilot/vsi-copilot.types").CailIntelligenceEnvelope;
    }>;
}
