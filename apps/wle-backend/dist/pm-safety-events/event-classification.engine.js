"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventClassificationEngine = void 0;
const common_1 = require("@nestjs/common");
const pm_safety_events_constants_1 = require("./pm-safety-events.constants");
let EventClassificationEngine = class EventClassificationEngine {
    classifyType(description, hint) {
        if (hint && hint !== 'custom') {
            return {
                eventType: hint,
                confidence: 1,
                explainability: [`User-selected type: ${hint}`],
            };
        }
        const text = description.toLowerCase();
        let best = 'hazard_observation';
        let bestScore = 0;
        const explainability = [];
        for (const [type, keywords] of Object.entries(pm_safety_events_constants_1.EVENT_TYPE_KEYWORDS)) {
            if (type === 'custom')
                continue;
            let score = 0;
            for (const kw of keywords) {
                if (text.includes(kw))
                    score += 2;
            }
            if (score > bestScore) {
                bestScore = score;
                best = type;
            }
        }
        explainability.push(`Keyword match score ${bestScore} → ${best}`);
        return {
            eventType: best,
            confidence: Math.min(1, bestScore / 6),
            explainability,
        };
    }
    suggestHecaCategory(description, energyHint) {
        const text = description.toLowerCase();
        if (energyHint)
            return energyHint;
        if (text.includes('fall') || text.includes('height'))
            return 'gravitational';
        if (text.includes('electr'))
            return 'electrical';
        if (text.includes('chemical') || text.includes('spill'))
            return 'chemical';
        if (text.includes('crane') || text.includes('lift'))
            return 'mechanical';
        return 'general';
    }
};
exports.EventClassificationEngine = EventClassificationEngine;
exports.EventClassificationEngine = EventClassificationEngine = __decorate([
    (0, common_1.Injectable)()
], EventClassificationEngine);
//# sourceMappingURL=event-classification.engine.js.map