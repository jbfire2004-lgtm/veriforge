"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoringEngine = exports.ScoringEngine = void 0;
class ScoringEngine {
    workerSafety(s) {
        let score = s.profileScore ?? 75;
        const components = [];
        if ((s.overdueCapa ?? 0) > 0) {
            const d = Math.min(30, s.overdueCapa * 10);
            score -= d;
            components.push({ key: 'overdue_capa', deduction: d });
        }
        if ((s.denials30d ?? s.accessDenials30d ?? 0) > 0) {
            const d = Math.min(20, (s.denials30d ?? s.accessDenials30d ?? 0) * 4);
            score -= d;
            components.push({ key: 'access_denials', deduction: d });
        }
        if ((s.sifExposures ?? 0) > 0) {
            const d = Math.min(25, s.sifExposures * 8);
            score -= d;
            components.push({ key: 'sif_exposure', deduction: d });
        }
        return { score: Math.max(0, Math.min(100, Math.round(score))), maxScore: 100, components };
    }
    equipmentSafety(s) {
        let score = 100;
        const components = [];
        if ((s.safetyStatus ?? 'OK') !== 'OK') {
            score -= 40;
            components.push({ key: 'safety_status', deduction: 40 });
        }
        if ((s.lockoutStatus ?? 'CLEAR') !== 'CLEAR') {
            score -= 35;
            components.push({ key: 'lockout', deduction: 35 });
        }
        if ((s.openCapa ?? 0) > 0) {
            const d = Math.min(25, s.openCapa * 12);
            score -= d;
            components.push({ key: 'open_capa', deduction: d });
        }
        if ((s.failures90d ?? 0) > 0) {
            const d = Math.min(15, s.failures90d * 5);
            score -= d;
            components.push({ key: 'failures', deduction: d });
        }
        return { score: Math.max(0, Math.round(score)), maxScore: 100, components };
    }
    projectSafety(s) {
        let score = 100;
        const components = [];
        const overdue = s.projectCriticalCapa ?? s.overdueCapa ?? 0;
        if (overdue > 0) {
            const d = Math.min(25, overdue * 8);
            score -= d;
            components.push({ key: 'overdue_capa', deduction: d });
        }
        if ((s.criticalHazards ?? 0) > 0) {
            const d = Math.min(20, s.criticalHazards * 10);
            score -= d;
            components.push({ key: 'critical_hazards', deduction: d });
        }
        if ((s.openIncidents ?? 0) > 0) {
            const d = Math.min(15, s.openIncidents * 7);
            score -= d;
            components.push({ key: 'incidents', deduction: d });
        }
        return { score: Math.max(0, Math.round(score)), maxScore: 100, components };
    }
}
exports.ScoringEngine = ScoringEngine;
exports.scoringEngine = new ScoringEngine();
