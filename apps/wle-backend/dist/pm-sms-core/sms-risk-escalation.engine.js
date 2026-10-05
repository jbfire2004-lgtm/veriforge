"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsRiskEscalationEngine = void 0;
const common_1 = require("@nestjs/common");
const HIGH_ENERGY_TYPES = [
    'gravity',
    'electrical',
    'pressure',
    'chemical',
    'radiation',
    'mechanical',
];
let SmsRiskEscalationEngine = class SmsRiskEscalationEngine {
    evaluate(baseSeverity, tags) {
        var _a;
        let score = 0;
        const factors = [];
        const energyTypes = ((_a = tags.energyTypes) !== null && _a !== void 0 ? _a : []);
        const highEnergy = tags.highEnergyFlag ||
            energyTypes.some((e) => HIGH_ENERGY_TYPES.includes(e));
        if (tags.sclState === 'conditional') {
            score += 15;
            factors.push('scl_conditional');
        }
        if (tags.sclState === 'loss') {
            score += 35;
            factors.push('scl_loss');
        }
        if (tags.hecaInvolved) {
            score += 20;
            factors.push('heca_involved');
        }
        if (highEnergy) {
            score += 15;
            factors.push('high_energy');
        }
        if (tags.energyControlState === 'uncontrolled' ||
            tags.energyControlState === 'partially_controlled') {
            score += 10;
            factors.push(`energy_${tags.energyControlState}`);
        }
        const hecaHighEnergyScl = tags.hecaInvolved &&
            highEnergy &&
            (tags.sclState === 'conditional' || tags.sclState === 'loss');
        if (hecaHighEnergyScl) {
            score += 25;
            factors.push('heca_high_energy_scl_combo');
        }
        const severity = this.bumpSeverity(baseSeverity, score);
        const requiresInvestigation = hecaHighEnergyScl || tags.sclState === 'loss' || severity === 'critical';
        return {
            severity,
            escalated: severity !== baseSeverity || score >= 25,
            escalationScore: score,
            requiresInvestigation,
            dueDateMultiplier: score >= 35 ? 0.5 : score >= 20 ? 0.75 : 1,
            factors,
        };
    }
    bumpSeverity(base, score) {
        var _a;
        const order = ['low', 'medium', 'high', 'critical'];
        let idx = order.indexOf(base);
        if (score >= 50)
            idx = Math.min(3, idx + 2);
        else if (score >= 30)
            idx = Math.min(3, idx + 1);
        else if (score >= 15 && idx < 2)
            idx += 1;
        return (_a = order[idx]) !== null && _a !== void 0 ? _a : base;
    }
};
exports.SmsRiskEscalationEngine = SmsRiskEscalationEngine;
exports.SmsRiskEscalationEngine = SmsRiskEscalationEngine = __decorate([
    (0, common_1.Injectable)()
], SmsRiskEscalationEngine);
//# sourceMappingURL=sms-risk-escalation.engine.js.map