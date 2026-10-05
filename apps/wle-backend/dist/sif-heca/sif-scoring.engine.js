"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SifScoringEngine = void 0;
const common_1 = require("@nestjs/common");
const sif_heca_constants_1 = require("./sif-heca.constants");
let SifScoringEngine = class SifScoringEngine {
    score(input) {
        const explainability = [];
        const severityComponent = Math.min(25, Math.round((input.hazardSeverity / 5) * 25));
        explainability.push({
            rule: 'hazard_severity',
            points: severityComponent,
            detail: `Severity ${input.hazardSeverity}/5`,
        });
        const likelihoodComponent = Math.min(20, Math.round((input.hazardLikelihood / 5) * 20));
        explainability.push({
            rule: 'hazard_likelihood',
            points: likelihoodComponent,
            detail: `Likelihood ${input.hazardLikelihood}/5`,
        });
        const highEnergy = input.energyTypes.some((e) => sif_heca_constants_1.HIGH_ENERGY_TYPES.has(e));
        const energyComponent = highEnergy
            ? 20
            : input.energyTypes.length > 0
                ? 8
                : 0;
        if (energyComponent) {
            explainability.push({
                rule: 'energy_exposure',
                points: energyComponent,
                detail: `Energy types: ${input.energyTypes.join(', ') || 'none'}`,
            });
        }
        let controlComponent = 0;
        const requiredControls = [];
        if (input.missingControls > 0) {
            controlComponent += 15;
            requiredControls.push('Add engineering or administrative controls before work');
            explainability.push({
                rule: 'missing_controls',
                points: 15,
                detail: `${input.missingControls} missing control(s)`,
            });
        }
        if (input.weakControls > 0) {
            controlComponent += 10;
            requiredControls.push('Strengthen weak controls and re-verify');
            explainability.push({
                rule: 'weak_controls',
                points: 10,
                detail: `${input.weakControls} weak control(s)`,
            });
        }
        controlComponent += Math.max(0, 10 - Math.round(input.controlStrength * 2));
        controlComponent = Math.min(25, controlComponent);
        const competencyComponent = input.workerCompetencyGap ? 10 : 0;
        if (competencyComponent) {
            explainability.push({
                rule: 'competency_gap',
                points: competencyComponent,
                detail: 'Worker training/competency gap detected',
            });
        }
        const equipmentComponent = input.equipmentConditionPoor ? 10 : 0;
        if (equipmentComponent) {
            explainability.push({
                rule: 'equipment_condition',
                points: equipmentComponent,
                detail: 'Equipment not fit for use or unauthorized',
            });
        }
        const environmentComponent = input.environmentRisk ? 8 : 0;
        if (environmentComponent) {
            explainability.push({
                rule: 'environment',
                points: environmentComponent,
                detail: 'Adverse weather or site conditions',
            });
        }
        const historyComponent = Math.min(12, input.historicalIncidents12mo * 4);
        if (historyComponent) {
            explainability.push({
                rule: 'incident_history',
                points: historyComponent,
                detail: `${input.historicalIncidents12mo} related incident(s) in 12mo`,
            });
        }
        const sifScore = Math.min(100, severityComponent +
            likelihoodComponent +
            energyComponent +
            controlComponent +
            competencyComponent +
            equipmentComponent +
            environmentComponent +
            historyComponent);
        const sifCategory = (0, sif_heca_constants_1.categoryFromScore)(sifScore);
        const requiresSupervisorReview = sifCategory === 'high' ||
            sifCategory === 'critical' ||
            highEnergy ||
            input.missingControls > 0;
        const requiredActions = [];
        if (requiresSupervisorReview) {
            requiredActions.push('Supervisor review required before work proceeds');
        }
        if (sifCategory === 'critical') {
            requiredActions.push('Stop work and escalate to company safety manager');
        }
        return {
            sifScore,
            sifCategory,
            severityComponent,
            likelihoodComponent,
            energyComponent,
            controlComponent,
            competencyComponent,
            equipmentComponent,
            environmentComponent,
            historyComponent,
            requiresSupervisorReview,
            requiredControls,
            requiredActions,
            explainability,
        };
    }
};
exports.SifScoringEngine = SifScoringEngine;
exports.SifScoringEngine = SifScoringEngine = __decorate([
    (0, common_1.Injectable)()
], SifScoringEngine);
//# sourceMappingURL=sif-scoring.engine.js.map