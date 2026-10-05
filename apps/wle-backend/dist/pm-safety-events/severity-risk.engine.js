"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeverityRiskEngine = void 0;
const common_1 = require("@nestjs/common");
let SeverityRiskEngine = class SeverityRiskEngine {
    score(input) {
        var _a, _b;
        const explainability = [];
        let severityScore = (_a = input.severityHint) !== null && _a !== void 0 ? _a : 2;
        let likelihood = (_b = input.likelihoodHint) !== null && _b !== void 0 ? _b : 2;
        if (input.eventType === 'incident_injury') {
            severityScore = 5;
            explainability.push({
                rule: 'event_type',
                detail: 'Injury incident → severity 5',
            });
        }
        else if (input.eventType === 'near_miss') {
            severityScore = 3;
            likelihood = 4;
        }
        else if (input.eventType === 'positive_observation') {
            return {
                severity: 'low',
                likelihood: 1,
                riskScore: 5,
                requiresSupervisorReview: false,
                explainability: [
                    { rule: 'positive', detail: 'Positive observation — low risk' },
                ],
            };
        }
        else if (input.eventType === 'equipment_failure') {
            severityScore = 4;
            explainability.push({ rule: 'equipment', detail: 'Equipment failure' });
        }
        if (input.medicalAid) {
            severityScore = 5;
            explainability.push({ rule: 'medical_aid', detail: '+medical aid' });
        }
        if (input.lostTime) {
            severityScore = 5;
            likelihood = 5;
            explainability.push({ rule: 'lost_time', detail: '+lost time' });
        }
        if (input.hasInjury && !input.medicalAid) {
            severityScore = Math.max(severityScore, 4);
        }
        const riskScore = Math.min(100, severityScore * 12 + likelihood * 8);
        const severity = this.toSeverity(severityScore);
        const requiresSupervisorReview = severity === 'high' ||
            severity === 'critical' ||
            input.medicalAid ||
            input.lostTime ||
            input.equipmentFailure ||
            input.eventType === 'incident_injury';
        if (requiresSupervisorReview) {
            explainability.push({
                rule: 'supervisor_review',
                detail: 'High/critical severity or medical/lost time',
            });
        }
        return {
            severity,
            likelihood,
            riskScore,
            requiresSupervisorReview,
            explainability,
        };
    }
    toSeverity(score) {
        if (score >= 5)
            return 'critical';
        if (score >= 4)
            return 'high';
        if (score >= 3)
            return 'medium';
        return 'low';
    }
};
exports.SeverityRiskEngine = SeverityRiskEngine;
exports.SeverityRiskEngine = SeverityRiskEngine = __decorate([
    (0, common_1.Injectable)()
], SeverityRiskEngine);
//# sourceMappingURL=severity-risk.engine.js.map