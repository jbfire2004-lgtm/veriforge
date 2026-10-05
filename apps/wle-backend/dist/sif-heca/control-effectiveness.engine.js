"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlEffectivenessEngine = void 0;
const common_1 = require("@nestjs/common");
const HIERARCHY = {
    elimination: 5,
    substitution: 4,
    engineering: 4,
    administrative: 3,
    ppe: 1,
};
let ControlEffectivenessEngine = class ControlEffectivenessEngine {
    evaluate(hazardRiskScore, controls) {
        var _a, _b;
        const findings = [];
        let missingControls = 0;
        let weakControls = 0;
        const ineffectiveControls = 0;
        if (hazardRiskScore >= 12 && controls.length === 0) {
            missingControls++;
            findings.push('High-risk hazard has no controls');
        }
        let strengthSum = 0;
        let nonPpeCount = 0;
        for (const c of controls) {
            const base = (_a = HIERARCHY[c.controlType]) !== null && _a !== void 0 ? _a : 2;
            const eff = (_b = c.effectivenessScore) !== null && _b !== void 0 ? _b : (c.adequate === false ? 1 : 4);
            strengthSum += base * (eff / 5);
            if (c.controlType !== 'ppe')
                nonPpeCount++;
            if (c.adequate === false || eff < 3) {
                weakControls++;
                findings.push(`Weak ${c.controlType} control`);
            }
            if (!c.verified && hazardRiskScore >= 12) {
                findings.push(`Unverified control: ${c.controlType}`);
            }
        }
        if (hazardRiskScore >= 12 && nonPpeCount === 0 && controls.length > 0) {
            weakControls++;
            findings.push('Only PPE controls for high-risk hazard');
        }
        if (controls.length === 0 && hazardRiskScore < 12) {
            strengthSum = 3;
        }
        const controlStrength = Math.min(5, controls.length ? strengthSum / controls.length : 0);
        return {
            controlStrength,
            missingControls,
            weakControls,
            ineffectiveControls,
            findings,
        };
    }
};
exports.ControlEffectivenessEngine = ControlEffectivenessEngine;
exports.ControlEffectivenessEngine = ControlEffectivenessEngine = __decorate([
    (0, common_1.Injectable)()
], ControlEffectivenessEngine);
//# sourceMappingURL=control-effectiveness.engine.js.map