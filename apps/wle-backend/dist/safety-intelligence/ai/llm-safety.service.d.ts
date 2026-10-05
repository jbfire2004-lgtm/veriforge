import type { VsiCopilotModule } from './copilot/vsi-copilot.types';
import { type EquipmentDefectSeverity, type EquipmentDefectType, type EquipmentInspectionSectionId, type EquipmentRecommendedAction } from '../../veri-agent/equipment-inspection-engine';
import { VeriAgentService } from '../../veri-agent/veri-agent.service';
export type LlmClassificationResult = {
    suggestedPolarity: 'safe' | 'at_risk';
    suggestedSeverity: 'low' | 'medium' | 'high' | 'critical';
    hazardSummary: string;
    suggestedCaption?: string;
    riskCategory?: string;
};
export type LlmInspectionFinding = {
    category: 'unsafe_condition' | 'missing_ppe' | 'equipment_defect' | 'housekeeping' | 'environmental' | 'other';
    title: string;
    description?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    responsibleParty: 'contractor' | 'supervisor' | 'company' | 'worker';
    confidence?: number;
};
export type LlmInspectionPhotoAnalysis = {
    findings: LlmInspectionFinding[];
    hazardSummary?: string;
    suggestedCaption?: string;
};
export type LlmEquipmentDefectFinding = {
    defectType: EquipmentDefectType;
    title: string;
    description?: string;
    severity: EquipmentDefectSeverity;
    confidence: number;
    recommendedAction: EquipmentRecommendedAction;
    justification?: string;
    workOrderHint?: string | null;
};
export type LlmEquipmentInspectionPhotoAnalysis = {
    sectionId?: EquipmentInspectionSectionId | 'unknown';
    overallStatus?: 'pass' | 'fail' | 'attention';
    defects: LlmEquipmentDefectFinding[];
    operatorNotesSuggested?: string;
    summary?: string;
};
export declare class LlmSafetyService {
    private readonly veriAgent;
    private readonly logger;
    constructor(veriAgent: VeriAgentService);
    isConfigured(): boolean;
    runCopilotModule<T = Record<string, unknown>>(module: VsiCopilotModule, context: Record<string, unknown>, pm?: {
        projectId?: number;
        companyId?: number;
        sourceType?: import('./copilot/vsi-copilot.types').VsiCailSourceType;
        actor?: {
            userId?: number;
            role?: string;
            companyId?: number;
        };
    }): Promise<T | null>;
    classifySafetyPhoto(input: {
        caption?: string;
        ocrText?: string;
        imageUrl?: string;
        imageBase64?: string;
        imageMimeType?: string;
        companyId?: number;
        projectId?: number;
    }): Promise<LlmClassificationResult | null>;
    analyzeInspectionPhotoFindings(input: {
        caption?: string;
        ocrText?: string;
        imageBase64?: string;
        imageMimeType?: string;
        visionSummary?: string;
        visionHazards?: string[];
        companyId?: number;
        projectId?: number;
    }): Promise<LlmInspectionPhotoAnalysis | null>;
    analyzeEquipmentInspectionPhoto(input: {
        sectionId?: string;
        caption?: string;
        operatorNotes?: string;
        assetId?: string;
        assetType?: string;
        imageBase64?: string;
        imageMimeType?: string;
        companyId?: number;
        projectId?: number;
    }): Promise<LlmEquipmentInspectionPhotoAnalysis | null>;
}
