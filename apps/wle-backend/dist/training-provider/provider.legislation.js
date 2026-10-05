"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingLegislationEngine = void 0;
class TrainingLegislationEngine {
    constructor() {
        this.requiredKeywords = [
            'safety',
            'hazard',
            'ppe',
            'emergency',
            'procedure',
            'workplace',
            'certification',
        ];
    }
    assessProgram(content) {
        const lower = content.toLowerCase();
        const matched = this.requiredKeywords.filter((k) => lower.includes(k));
        const missing = this.requiredKeywords.filter((k) => !lower.includes(k));
        const score = Math.round((matched.length / this.requiredKeywords.length) * 100);
        return {
            score,
            passed: score >= 70,
            matched,
            missing,
        };
    }
}
exports.TrainingLegislationEngine = TrainingLegislationEngine;
//# sourceMappingURL=provider.legislation.js.map