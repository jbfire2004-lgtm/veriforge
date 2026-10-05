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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsiVisionBridgeService = void 0;
const common_1 = require("@nestjs/common");
const vision_service_1 = require("../../modules/vision/vision.service");
let VsiVisionBridgeService = class VsiVisionBridgeService {
    constructor(vision) {
        this.vision = vision;
    }
    async analyzeSafetyPhoto(input) {
        var _a;
        const combinedText = [input.caption, input.ocrText]
            .filter(Boolean)
            .join('\n');
        const vision = await this.vision.analyzeInspection({
            ocrText: combinedText || 'safety site photo',
            companyId: input.companyId,
            projectId: input.projectId,
            imageHints: {
                hazards: input.caption ? [input.caption] : undefined,
                damageTypes: visionDamageHints(combinedText),
            },
        });
        const hazards = [
            ...vision.visual.hazards,
            ...vision.classification.tags,
            ...vision.fields
                .filter((f) => /hazard|risk|violation|unsafe/i.test(f.key))
                .map((f) => `${f.key}: ${f.value}`),
        ];
        const atRisk = hazards.length > 0 ||
            vision.reviewRequired ||
            vision.fraud.score > 60 ||
            /unsafe|hazard|violation|damage|fail/i.test(combinedText);
        return {
            engine: 'vera-vision',
            vision,
            hazards: [...new Set(hazards)].slice(0, 10),
            suggestedPolarity: atRisk ? 'at_risk' : 'safe',
            suggestedSeverity: severityFromVision(vision, combinedText),
            ocrFullText: vision.ocr.fullText,
            suggestedCaption: input.caption ||
                vision.summary.bullets[0] ||
                ((_a = vision.fields.find((f) => f.key === 'finding')) === null || _a === void 0 ? void 0 : _a.value),
            riskCategory: mapRiskCategory(vision.classification.category),
        };
    }
};
exports.VsiVisionBridgeService = VsiVisionBridgeService;
exports.VsiVisionBridgeService = VsiVisionBridgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vision_service_1.VisionService])
], VsiVisionBridgeService);
function visionDamageHints(text) {
    const hints = [];
    if (/crack|damage|broken|leak/i.test(text))
        hints.push('structural_damage');
    if (/ppe|helmet|harness|glasses/i.test(text))
        hints.push('ppe');
    if (/housekeeping|clutter|trip/i.test(text))
        hints.push('housekeeping');
    return hints;
}
function severityFromVision(vision, text) {
    if (/critical|sif|fatality|death/i.test(text))
        return 'critical';
    if (vision.fraud.score > 70 || /serious|major|stop work/i.test(text)) {
        return 'high';
    }
    if (vision.reviewRequired || vision.visual.hazards.length > 0)
        return 'medium';
    return 'low';
}
function mapRiskCategory(category) {
    const c = category.toLowerCase();
    if (c.includes('ppe'))
        return 'ppe';
    if (c.includes('equip'))
        return 'equipment';
    if (c.includes('behavior'))
        return 'behavior';
    if (c.includes('env'))
        return 'environment';
    return 'other';
}
//# sourceMappingURL=vsi-vision-bridge.service.js.map