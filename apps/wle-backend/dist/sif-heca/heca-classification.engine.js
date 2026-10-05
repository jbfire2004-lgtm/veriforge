"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HecaClassificationEngine = void 0;
const common_1 = require("@nestjs/common");
const sif_heca_constants_1 = require("./sif-heca.constants");
let HecaClassificationEngine = class HecaClassificationEngine {
    classify(input) {
        var _a;
        const text = input.description.toLowerCase();
        const cats = input.categories.length > 0
            ? input.categories
            : sif_heca_constants_1.HECA_CATEGORIES.map((c) => ({
                code: c.code,
                label: c.label,
                keywordPatterns: [...c.keywords],
                energyTypes: [...c.energyTypes],
                severityDefault: 3,
            }));
        let best = cats[0];
        let bestScore = 0;
        const explainability = [];
        for (const cat of cats) {
            let score = 0;
            for (const kw of cat.keywordPatterns) {
                if (text.includes(String(kw).toLowerCase()))
                    score += 3;
            }
            for (const et of input.energyTypes) {
                if (cat.energyTypes.includes(et))
                    score += 4;
            }
            if (score > bestScore) {
                bestScore = score;
                best = cat;
            }
        }
        explainability.push({
            rule: 'keyword_energy_match',
            detail: `Matched ${best.label} (score ${bestScore})`,
        });
        const highEnergyFlag = input.energyTypes.some((e) => sif_heca_constants_1.HIGH_ENERGY_TYPES.has(e));
        const severity = Math.min(5, (_a = best.severityDefault) !== null && _a !== void 0 ? _a : 3);
        const likelihood = highEnergyFlag ? 4 : 3;
        const hecaRiskScore = severity * likelihood;
        const requiredControls = [];
        if (highEnergyFlag) {
            requiredControls.push(`Apply mandatory controls for ${input.energyTypes.join(', ')} energy`);
        }
        if (best.code === 'line_of_fire') {
            requiredControls.push('Establish exclusion zone and spotter');
        }
        const requiredCorrective = [];
        if (hecaRiskScore >= 15) {
            requiredCorrective.push(`Address ${best.label} observation before close-out`);
        }
        return {
            hecaCategoryCode: best.code,
            hecaCategoryLabel: best.label,
            severity,
            likelihood,
            hecaRiskScore,
            highEnergyFlag,
            requiredControls,
            requiredCorrective,
            explainability,
        };
    }
};
exports.HecaClassificationEngine = HecaClassificationEngine;
exports.HecaClassificationEngine = HecaClassificationEngine = __decorate([
    (0, common_1.Injectable)()
], HecaClassificationEngine);
//# sourceMappingURL=heca-classification.engine.js.map