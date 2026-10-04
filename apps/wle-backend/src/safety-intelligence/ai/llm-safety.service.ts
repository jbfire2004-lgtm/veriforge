import { Injectable, Logger } from '@nestjs/common';
import {
  buildCopilotMessages,
  VSI_COPILOT_SYSTEM_IDENTITY,
} from './copilot/vsi-copilot.prompts';
import type { VsiCopilotModule } from './copilot/vsi-copilot.types';
import {
  EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT,
  buildEquipmentSectionUserPrompt,
  isEquipmentInspectionSectionId,
  type EquipmentDefectSeverity,
  type EquipmentDefectType,
  type EquipmentInspectionSectionId,
  type EquipmentRecommendedAction,
} from '../../veri-agent/equipment-inspection-engine';
import { VeriAgentService } from '../../veri-agent/veri-agent.service';

export type LlmClassificationResult = {
  suggestedPolarity: 'safe' | 'at_risk';
  suggestedSeverity: 'low' | 'medium' | 'high' | 'critical';
  hazardSummary: string;
  suggestedCaption?: string;
  riskCategory?: string;
};

/** Structured findings for inspection photo pipeline (v2). */
export type LlmInspectionFinding = {
  category:
    | 'unsafe_condition'
    | 'missing_ppe'
    | 'equipment_defect'
    | 'housekeeping'
    | 'environmental'
    | 'other';
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

/** Equipment walk-around defect finding (Equipment Inspection Engine). */
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

const EQUIPMENT_DEFECT_TYPES = new Set<string>([
  'leak',
  'crack',
  'guard_missing',
  'tire_track_damage',
  'light_failure',
  'structural_damage',
  'loose_component',
  'wear',
  'missing_decal',
  'warning_indicator',
  'other',
]);

const EQUIPMENT_SEVERITIES = new Set<string>(['critical', 'major', 'minor']);

const EQUIPMENT_ACTIONS = new Set<string>([
  'lockout',
  'repair_schedule',
  'monitor',
  'none',
]);

/**
 * Domain LLM helpers for VSI / inspections.
 * All provider egress goes through VeriAgent (privacy firewall).
 */
@Injectable()
export class LlmSafetyService {
  private readonly logger = new Logger(LlmSafetyService.name);

  constructor(private readonly veriAgent: VeriAgentService) {}

  isConfigured(): boolean {
    return this.veriAgent.isConfigured();
  }

  /** Permanent Copilot engine — module JSON output for database ingestion */
  async runCopilotModule<T = Record<string, unknown>>(
    module: VsiCopilotModule,
    context: Record<string, unknown>,
    pm?: {
      projectId?: number;
      companyId?: number;
      sourceType?: import('./copilot/vsi-copilot.types').VsiCailSourceType;
      actor?: {
        userId?: number;
        role?: string;
        companyId?: number;
      };
    },
  ): Promise<T | null> {
    if (!this.isConfigured()) return null;
    const companyId = pm?.companyId;
    if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
      this.logger.warn('Copilot LLM blocked: companyId required (VeriAgent tenant isolation)');
      return null;
    }

    const safeContext = this.veriAgent.prepareContext(context);
    const { system, user } = buildCopilotMessages(module, safeContext, pm);
    const result = await this.veriAgent.completeJson<Record<string, unknown>>({
      purpose: 'vsi_copilot',
      tenant: { companyId, projectId: pm?.projectId },
      actor: pm?.actor,
      messages: [
        { role: 'system', content: system || VSI_COPILOT_SYSTEM_IDENTITY },
        { role: 'user', content: user },
      ],
      temperature: 0.1,
    });
    if (result.ok === false) {
      this.logger.warn(`Copilot via VeriAgent denied/failed: ${result.reason}`);
      return null;
    }
    return result.data as T;
  }

  async classifySafetyPhoto(input: {
    caption?: string;
    ocrText?: string;
    imageUrl?: string;
    imageBase64?: string;
    imageMimeType?: string;
    companyId?: number;
    projectId?: number;
  }): Promise<LlmClassificationResult | null> {
    if (!this.isConfigured()) return null;
    const companyId = input.companyId;
    if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
      this.logger.warn('Photo classify blocked: companyId required');
      return null;
    }

    const textParts = [
      input.caption ? `Caption: ${input.caption}` : null,
      input.ocrText ? `OCR text:\n${input.ocrText.slice(0, 4000)}` : null,
      !input.imageBase64 && input.imageUrl
        ? `Image URL: ${input.imageUrl}`
        : null,
    ].filter(Boolean);

    const userText =
      textParts.join('\n\n') || 'Analyze this construction safety photo.';

    const system =
      'You are a construction safety analyst. Respond with JSON only: {"suggestedPolarity":"safe"|"at_risk","suggestedSeverity":"low"|"medium"|"high"|"critical","hazardSummary":"string","suggestedCaption":"string","riskCategory":"behavior"|"equipment"|"environment"|"process"|"ppe"|"ergonomic"|"other"}';

    const result = await this.veriAgent.completeMultimodalJson<
      Record<string, unknown>
    >({
      purpose: 'safety_photo_classify',
      tenant: { companyId, projectId: input.projectId },
      system,
      userText,
      imageBase64: input.imageBase64,
      imageMimeType: input.imageMimeType,
      temperature: 0.2,
    });
    if (result.ok === false) {
      this.logger.warn(`Photo classify via VeriAgent: ${result.reason}`);
      return null;
    }

    const parsed = result.data as unknown as LlmClassificationResult;
    if (
      parsed.suggestedPolarity !== 'safe' &&
      parsed.suggestedPolarity !== 'at_risk'
    ) {
      return null;
    }
    return parsed;
  }

  /**
   * Multi-finding hazard analysis for PM inspection photo capture.
   * Returns structured objects for CAPA auto-generation when LLM is configured.
   */
  async analyzeInspectionPhotoFindings(input: {
    caption?: string;
    ocrText?: string;
    imageBase64?: string;
    imageMimeType?: string;
    visionSummary?: string;
    visionHazards?: string[];
    companyId?: number;
    projectId?: number;
  }): Promise<LlmInspectionPhotoAnalysis | null> {
    if (!this.isConfigured()) return null;
    const companyId = input.companyId;
    if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
      this.logger.warn('Inspection photo LLM blocked: companyId required');
      return null;
    }

    const context = [
      input.caption ? `Inspector caption: ${input.caption}` : null,
      input.ocrText ? `OCR:\n${input.ocrText.slice(0, 3000)}` : null,
      input.visionSummary ? `Vision summary: ${input.visionSummary}` : null,
      input.visionHazards?.length
        ? `Vision hazards: ${input.visionHazards.join('; ')}`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const userText =
      context ||
      'Analyze this construction site inspection photo for safety deficiencies.';

    const systemPrompt = `You are a construction safety inspector AI. Analyze the photo and return JSON only:
{
  "findings": [
    {
      "category": "unsafe_condition"|"missing_ppe"|"equipment_defect"|"housekeeping"|"environmental"|"other",
      "title": "short title",
      "description": "detail",
      "severity": "low"|"medium"|"high"|"critical",
      "responsibleParty": "contractor"|"supervisor"|"company"|"worker",
      "confidence": 0.0-1.0
    }
  ],
  "hazardSummary": "one paragraph",
  "suggestedCaption": "optional"
}
Identify: unsafe conditions, missing PPE, equipment defects, housekeeping issues. Use empty findings array if site appears safe.`;

    const result = await this.veriAgent.completeMultimodalJson<
      Record<string, unknown>
    >({
      purpose: 'inspection_photo_findings',
      tenant: { companyId, projectId: input.projectId },
      system: systemPrompt,
      userText,
      imageBase64: input.imageBase64,
      imageMimeType: input.imageMimeType,
      temperature: 0.15,
    });
    if (result.ok === false) {
      this.logger.warn(`Inspection findings via VeriAgent: ${result.reason}`);
      return null;
    }

    const parsed = result.data as unknown as LlmInspectionPhotoAnalysis;
    if (!Array.isArray(parsed.findings)) return null;

    parsed.findings = parsed.findings.filter(
      (f) => f.title && f.category && f.severity && f.responsibleParty,
    );
    return parsed;
  }

  /**
   * Equipment Inspection Engine — walk-around photo defect analysis.
   * Distinct from Smart Safety / site inspection photo findings.
   */
  async analyzeEquipmentInspectionPhoto(input: {
    sectionId?: string;
    caption?: string;
    operatorNotes?: string;
    assetId?: string;
    assetType?: string;
    imageBase64?: string;
    imageMimeType?: string;
    companyId?: number;
    projectId?: number;
  }): Promise<LlmEquipmentInspectionPhotoAnalysis | null> {
    if (!this.isConfigured()) return null;
    const companyId = input.companyId;
    if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
      this.logger.warn(
        'Equipment inspection photo LLM blocked: companyId required',
      );
      return null;
    }

    const sectionId = isEquipmentInspectionSectionId(input.sectionId)
      ? input.sectionId
      : undefined;

    const userText = buildEquipmentSectionUserPrompt(sectionId, {
      caption: input.caption,
      operatorNotes: input.operatorNotes,
      assetId: input.assetId,
      assetType: input.assetType,
    });

    const result = await this.veriAgent.completeMultimodalJson<
      Record<string, unknown>
    >({
      purpose: 'equipment_inspection_photo_findings',
      tenant: { companyId, projectId: input.projectId },
      system: EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT,
      userText,
      imageBase64: input.imageBase64,
      imageMimeType: input.imageMimeType,
      temperature: 0.15,
    });
    if (result.ok === false) {
      this.logger.warn(
        `Equipment inspection findings via VeriAgent: ${result.reason}`,
      );
      return null;
    }

    const parsed = result.data as unknown as LlmEquipmentInspectionPhotoAnalysis;
    if (!Array.isArray(parsed.defects)) return null;

    parsed.defects = parsed.defects.filter((d) => {
      if (!d?.title) return false;
      if (!EQUIPMENT_DEFECT_TYPES.has(d.defectType)) return false;
      if (!EQUIPMENT_SEVERITIES.has(d.severity)) return false;
      if (!EQUIPMENT_ACTIONS.has(d.recommendedAction)) return false;
      if (typeof d.confidence !== 'number' || Number.isNaN(d.confidence)) {
        return false;
      }
      d.confidence = Math.max(0, Math.min(1, d.confidence));
      return true;
    });

    if (
      parsed.sectionId &&
      parsed.sectionId !== 'unknown' &&
      !isEquipmentInspectionSectionId(parsed.sectionId)
    ) {
      parsed.sectionId = sectionId ?? 'unknown';
    } else if (!parsed.sectionId) {
      parsed.sectionId = sectionId ?? 'unknown';
    }

    return parsed;
  }
}
