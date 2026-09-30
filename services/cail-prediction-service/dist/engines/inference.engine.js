"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferenceEngine = exports.InferenceEngine = void 0;
function prob(value) {
    return Math.min(0.95, Math.round(value * 1000) / 1000);
}
function riskFromProbability(p, thresholds = { medium: 0.25, high: 0.45, critical: 0.65 }) {
    if (p >= thresholds.critical)
        return 'critical';
    if (p >= thresholds.high)
        return 'high';
    if (p >= thresholds.medium)
        return 'medium';
    return 'low';
}
function confidenceFromSignals(signalCount, expected) {
    const ratio = Math.min(1, signalCount / expected);
    return Math.round((0.55 + ratio * 0.4) * 1000) / 1000;
}
class InferenceEngine {
    infer(predictionType, signals = {}) {
        switch (predictionType) {
            case 'incident_likelihood':
                return this.incidentLikelihood(signals);
            case 'equipment_failure':
                return this.equipmentFailure(signals);
            case 'hazard_emergence':
                return this.hazardEmergence(signals);
            case 'sif_heca_potential':
                return this.sifHecaPotential(signals);
            case 'training_lapse':
                return this.trainingLapse(signals);
            case 'capa_overdue':
                return this.capaOverdue(signals);
            case 'access_denial':
                return this.accessDenial(signals);
            case 'emergency_likelihood':
                return this.emergencyLikelihood(signals);
            default:
                return {
                    predictionType: String(predictionType),
                    probability: 0,
                    riskLevel: 'low',
                    factors: [],
                    confidence: 0.5,
                };
        }
    }
    incidentLikelihood(input) {
        let p = 0.05;
        const factors = [];
        let signalsUsed = 0;
        if (input.workerScore !== undefined) {
            signalsUsed += 1;
            if (input.workerScore < 50) {
                p += 0.22;
                factors.push('low_worker_safety_score');
            }
        }
        if ((input.openCapa ?? 0) > 2) {
            signalsUsed += 1;
            p += 0.15;
            factors.push('multiple_open_capa');
        }
        if ((input.sifExposures ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.2;
            factors.push('sif_exposure');
        }
        if ((input.incidents90d ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.12 * Math.min(3, input.incidents90d);
            factors.push('recent_incidents');
        }
        const probability = prob(p);
        return {
            predictionType: 'incident_likelihood',
            probability,
            riskLevel: riskFromProbability(probability),
            factors,
            confidence: confidenceFromSignals(signalsUsed, 4),
        };
    }
    equipmentFailure(input) {
        let p = 0.08;
        const factors = [];
        let signalsUsed = 0;
        if ((input.failures90d ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.2 * Math.min(2, input.failures90d);
            factors.push('failure_history');
        }
        if ((input.openCapa ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.18;
            factors.push('open_equipment_capa');
        }
        if ((input.inspectionFailures ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.15;
            factors.push('inspection_deficiencies');
        }
        const probability = prob(p);
        return {
            predictionType: 'equipment_failure',
            probability,
            riskLevel: riskFromProbability(probability, { medium: 0.2, high: 0.4, critical: 0.6 }),
            factors,
            confidence: confidenceFromSignals(signalsUsed, 3),
        };
    }
    hazardEmergence(input) {
        let p = 0.06;
        const factors = [];
        let signalsUsed = 0;
        if ((input.unpublishedHazards ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.18 * Math.min(2, input.unpublishedHazards);
            factors.push('unpublished_hazards');
        }
        if ((input.weakControls ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.15 * Math.min(3, input.weakControls);
            factors.push('weak_controls');
        }
        if ((input.criticalHazards ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.12;
            factors.push('critical_hazard_backlog');
        }
        const probability = prob(p);
        return {
            predictionType: 'hazard_emergence',
            probability,
            riskLevel: riskFromProbability(probability),
            factors,
            confidence: confidenceFromSignals(signalsUsed, 3),
        };
    }
    sifHecaPotential(input) {
        let p = 0.04;
        const factors = [];
        let signalsUsed = 0;
        if ((input.sifHazards ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.25 * Math.min(2, input.sifHazards);
            factors.push('sif_hazard_library');
        }
        if ((input.sifExposures ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.2;
            factors.push('worker_sif_exposure');
        }
        if ((input.hecaFlags ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.22;
            factors.push('heca_review_required');
        }
        const probability = prob(p);
        return {
            predictionType: 'sif_heca_potential',
            probability,
            riskLevel: riskFromProbability(probability, { medium: 0.2, high: 0.35, critical: 0.5 }),
            factors,
            confidence: confidenceFromSignals(signalsUsed, 3),
        };
    }
    trainingLapse(input) {
        let p = 0.05;
        const factors = [];
        let signalsUsed = 0;
        if ((input.expired ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.35;
            factors.push('training_expired');
        }
        if ((input.expiring7d ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.2;
            factors.push('training_expiring_soon');
        }
        if ((input.overdueTraining ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.15;
            factors.push('overdue_training_assignments');
        }
        const probability = prob(p);
        return {
            predictionType: 'training_lapse',
            probability,
            riskLevel: riskFromProbability(probability, { medium: 0.2, high: 0.4, critical: 0.6 }),
            factors,
            confidence: confidenceFromSignals(signalsUsed, 2),
        };
    }
    capaOverdue(input) {
        let p = 0.1;
        const factors = [];
        let signalsUsed = 0;
        if ((input.overdueCount ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.25 + input.overdueCount * 0.08;
            factors.push('already_overdue');
        }
        if (input.avgDaysToDue !== undefined && input.avgDaysToDue < 3) {
            signalsUsed += 1;
            p += 0.15;
            factors.push('due_soon');
        }
        if ((input.escalationMax ?? 0) >= 3) {
            signalsUsed += 1;
            p += 0.12;
            factors.push('high_escalation');
        }
        const probability = prob(p);
        return {
            predictionType: 'capa_overdue',
            probability,
            riskLevel: riskFromProbability(probability, { medium: 0.3, high: 0.5, critical: 0.7 }),
            factors,
            confidence: confidenceFromSignals(signalsUsed, 3),
        };
    }
    accessDenial(input) {
        let p = 0.07;
        const factors = [];
        let signalsUsed = 0;
        if ((input.denials30d ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.12 * Math.min(4, input.denials30d);
            factors.push('recent_denials');
        }
        if (input.grantRate !== undefined && input.grantRate < 85) {
            signalsUsed += 1;
            p += 0.18;
            factors.push('low_grant_rate');
        }
        if ((input.overdueTraining ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.15;
            factors.push('training_gap');
        }
        if ((input.openCapa ?? 0) > 0) {
            signalsUsed += 1;
            p += 0.1;
            factors.push('open_capa');
        }
        const probability = prob(p);
        return {
            predictionType: 'access_denial',
            probability,
            riskLevel: riskFromProbability(probability),
            factors,
            confidence: confidenceFromSignals(signalsUsed, 4),
        };
    }
    emergencyLikelihood(input) {
        let p = 0.03;
        const factors = [];
        let signalsUsed = 0;
        if (input.emergencyActive) {
            signalsUsed += 1;
            p += 0.35;
            factors.push('active_emergency');
        }
        if (input.drillRecencyDays !== undefined && input.drillRecencyDays > 120) {
            signalsUsed += 1;
            p += 0.15;
            factors.push('stale_drill');
        }
        if (input.planCompleteness !== undefined && input.planCompleteness < 70) {
            signalsUsed += 1;
            p += 0.12;
            factors.push('incomplete_emergency_plan');
        }
        if (input.projectScore !== undefined && input.projectScore < 60) {
            signalsUsed += 1;
            p += 0.1;
            factors.push('low_project_safety');
        }
        const probability = prob(p);
        return {
            predictionType: 'emergency_likelihood',
            probability,
            riskLevel: riskFromProbability(probability, { medium: 0.15, high: 0.3, critical: 0.5 }),
            factors,
            confidence: confidenceFromSignals(signalsUsed, 4),
        };
    }
}
exports.InferenceEngine = InferenceEngine;
exports.inferenceEngine = new InferenceEngine();
