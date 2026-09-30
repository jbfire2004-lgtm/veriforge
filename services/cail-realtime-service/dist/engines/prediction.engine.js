"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictionEngine = exports.PredictionEngine = void 0;
class PredictionEngine {
    incidentLikelihood(s, workerScore) {
        let p = 0.05;
        const factors = [];
        if (workerScore < 50) {
            p += 0.22;
            factors.push('low_worker_safety_score');
        }
        if ((s.openCapa ?? 0) > 2) {
            p += 0.15;
            factors.push('multiple_open_capa');
        }
        if ((s.sifExposures ?? 0) > 0) {
            p += 0.2;
            factors.push('sif_exposure');
        }
        if ((s.openIncidents ?? 0) > 0) {
            p += 0.12;
            factors.push('recent_incidents');
        }
        const probability = Math.min(0.95, Math.round(p * 1000) / 1000);
        return {
            predictionType: 'incident_likelihood',
            probability,
            riskLevel: probability > 0.45 ? 'high' : probability > 0.25 ? 'medium' : 'low',
            factors,
            confidence: Math.min(0.98, 0.65 + factors.length * 0.05),
        };
    }
    equipmentFailure(s) {
        let p = 0.08;
        const factors = [];
        if ((s.failures90d ?? 0) > 0) {
            p += 0.2;
            factors.push('failure_history');
        }
        if ((s.openCapa ?? 0) > 0) {
            p += 0.18;
            factors.push('open_equipment_capa');
        }
        if ((s.inspectionFailures ?? 0) > 0) {
            p += 0.15;
            factors.push('inspection_deficiencies');
        }
        const probability = Math.min(0.9, Math.round(p * 1000) / 1000);
        return {
            predictionType: 'equipment_failure',
            probability,
            riskLevel: probability > 0.4 ? 'high' : probability > 0.2 ? 'medium' : 'low',
            factors,
            confidence: 0.85,
        };
    }
    accessDenial(s) {
        let p = 0.07;
        const factors = [];
        const denials = s.denials30d ?? s.accessDenials30d ?? 0;
        if (denials > 0) {
            p += 0.12 * Math.min(4, denials);
            factors.push('recent_denials');
        }
        if ((s.expiredTraining ?? 0) > 0) {
            p += 0.2;
            factors.push('training_expired');
        }
        const probability = Math.min(0.9, Math.round(p * 1000) / 1000);
        return {
            predictionType: 'access_denial',
            probability,
            riskLevel: probability > 0.35 ? 'high' : 'medium',
            factors,
            confidence: 0.82,
        };
    }
    trainingLapse(s) {
        let p = 0.05;
        const factors = [];
        if ((s.expiredTraining ?? 0) > 0) {
            p += 0.35;
            factors.push('training_expired');
        }
        const probability = Math.min(0.9, Math.round(p * 1000) / 1000);
        return {
            predictionType: 'training_lapse',
            probability,
            riskLevel: probability > 0.4 ? 'high' : 'low',
            factors,
            confidence: 0.8,
        };
    }
}
exports.PredictionEngine = PredictionEngine;
exports.predictionEngine = new PredictionEngine();
