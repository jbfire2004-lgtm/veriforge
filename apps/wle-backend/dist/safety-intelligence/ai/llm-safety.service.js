"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LlmSafetyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmSafetyService = void 0;
const common_1 = require("@nestjs/common");
const vsi_copilot_prompts_1 = require("./copilot/vsi-copilot.prompts");
const equipment_inspection_engine_1 = require("../../veri-agent/equipment-inspection-engine");
const veri_agent_service_1 = require("../../veri-agent/veri-agent.service");
const EQUIPMENT_DEFECT_TYPES = new Set([
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
const EQUIPMENT_SEVERITIES = new Set(['critical', 'major', 'minor']);
const EQUIPMENT_ACTIONS = new Set([
    'lockout',
    'repair_schedule',
    'monitor',
    'none',
]);
let LlmSafetyService = LlmSafetyService_1 = class LlmSafetyService {
    constructor(veriAgent) {
        this.veriAgent = veriAgent;
        this.logger = new common_1.Logger(LlmSafetyService_1.name);
    }
    isConfigured() {
        return this.veriAgent.isConfigured();
    }
    async runCopilotModule(module, context, pm) {
        if (!this.isConfigured())
            return null;
        const companyId = pm === null || pm === void 0 ? void 0 : pm.companyId;
        if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
            this.logger.warn('Copilot LLM blocked: companyId required (VeriAgent tenant isolation)');
            return null;
        }
        const safeContext = this.veriAgent.prepareContext(context);
        const { system, user } = (0, vsi_copilot_prompts_1.buildCopilotMessages)(module, safeContext, pm);
        const result = await this.veriAgent.completeJson({
            purpose: 'vsi_copilot',
            tenant: { companyId, projectId: pm === null || pm === void 0 ? void 0 : pm.projectId },
            actor: pm === null || pm === void 0 ? void 0 : pm.actor,
            messages: [
                { role: 'system', content: system || vsi_copilot_prompts_1.VSI_COPILOT_SYSTEM_IDENTITY },
                { role: 'user', content: user },
            ],
            temperature: 0.1,
        });
        if (result.ok === false) {
            this.logger.warn(`Copilot via VeriAgent denied/failed: ${result.reason}`);
            return null;
        }
        return result.data;
    }
    async classifySafetyPhoto(input) {
        if (!this.isConfigured())
            return null;
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
        const userText = textParts.join('\n\n') || 'Analyze this construction safety photo.';
        const system = 'You are a construction safety analyst. Respond with JSON only: {"suggestedPolarity":"safe"|"at_risk","suggestedSeverity":"low"|"medium"|"high"|"critical","hazardSummary":"string","suggestedCaption":"string","riskCategory":"behavior"|"equipment"|"environment"|"process"|"ppe"|"ergonomic"|"other"}';
        const result = await this.veriAgent.completeMultimodalJson({
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
        const parsed = result.data;
        if (parsed.suggestedPolarity !== 'safe' &&
            parsed.suggestedPolarity !== 'at_risk') {
            return null;
        }
        return parsed;
    }
    async analyzeInspectionPhotoFindings(input) {
        var _a;
        if (!this.isConfigured())
            return null;
        const companyId = input.companyId;
        if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
            this.logger.warn('Inspection photo LLM blocked: companyId required');
            return null;
        }
        const context = [
            input.caption ? `Inspector caption: ${input.caption}` : null,
            input.ocrText ? `OCR:\n${input.ocrText.slice(0, 3000)}` : null,
            input.visionSummary ? `Vision summary: ${input.visionSummary}` : null,
            ((_a = input.visionHazards) === null || _a === void 0 ? void 0 : _a.length)
                ? `Vision hazards: ${input.visionHazards.join('; ')}`
                : null,
        ]
            .filter(Boolean)
            .join('\n\n');
        const userText = context ||
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
        const result = await this.veriAgent.completeMultimodalJson({
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
        const parsed = result.data;
        if (!Array.isArray(parsed.findings))
            return null;
        parsed.findings = parsed.findings.filter((f) => f.title && f.category && f.severity && f.responsibleParty);
        return parsed;
    }
    async analyzeEquipmentInspectionPhoto(input) {
        if (!this.isConfigured())
            return null;
        const companyId = input.companyId;
        if (companyId == null || !Number.isFinite(companyId) || companyId <= 0) {
            this.logger.warn('Equipment inspection photo LLM blocked: companyId required');
            return null;
        }
        const sectionId = (0, equipment_inspection_engine_1.isEquipmentInspectionSectionId)(input.sectionId)
            ? input.sectionId
            : undefined;
        const userText = (0, equipment_inspection_engine_1.buildEquipmentSectionUserPrompt)(sectionId, {
            caption: input.caption,
            operatorNotes: input.operatorNotes,
            assetId: input.assetId,
            assetType: input.assetType,
        });
        const result = await this.veriAgent.completeMultimodalJson({
            purpose: 'equipment_inspection_photo_findings',
            tenant: { companyId, projectId: input.projectId },
            system: equipment_inspection_engine_1.EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT,
            userText,
            imageBase64: input.imageBase64,
            imageMimeType: input.imageMimeType,
            temperature: 0.15,
        });
        if (result.ok === false) {
            this.logger.warn(`Equipment inspection findings via VeriAgent: ${result.reason}`);
            return null;
        }
        const parsed = result.data;
        if (!Array.isArray(parsed.defects))
            return null;
        parsed.defects = parsed.defects.filter((d) => {
            if (!(d === null || d === void 0 ? void 0 : d.title))
                return false;
            if (!EQUIPMENT_DEFECT_TYPES.has(d.defectType))
                return false;
            if (!EQUIPMENT_SEVERITIES.has(d.severity))
                return false;
            if (!EQUIPMENT_ACTIONS.has(d.recommendedAction))
                return false;
            if (typeof d.confidence !== 'number' || Number.isNaN(d.confidence)) {
                return false;
            }
            d.confidence = Math.max(0, Math.min(1, d.confidence));
            return true;
        });
        if (parsed.sectionId &&
            parsed.sectionId !== 'unknown' &&
            !(0, equipment_inspection_engine_1.isEquipmentInspectionSectionId)(parsed.sectionId)) {
            parsed.sectionId = sectionId !== null && sectionId !== void 0 ? sectionId : 'unknown';
        }
        else if (!parsed.sectionId) {
            parsed.sectionId = sectionId !== null && sectionId !== void 0 ? sectionId : 'unknown';
        }
        return parsed;
    }
};
exports.LlmSafetyService = LlmSafetyService;
exports.LlmSafetyService = LlmSafetyService = LlmSafetyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [veri_agent_service_1.VeriAgentService])
], LlmSafetyService);
//# sourceMappingURL=llm-safety.service.js.map