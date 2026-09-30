"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoringEngine = exports.ScoringEngine = void 0;
function clamp(score, max = 100) {
    return Math.max(0, Math.min(max, Math.round(score)));
}
class ScoringEngine {
    compute(scoreType, signals = {}) {
        switch (scoreType) {
            case 'worker_safety':
                return this.workerSafetyScore(signals);
            case 'equipment_safety':
                return this.equipmentSafetyScore(signals);
            case 'project_safety':
                return this.projectSafetyScore(signals);
            case 'company_safety':
                return this.companySafetyScore(signals);
            case 'hazard_severity':
                return this.hazardSeverityScore(signals);
            case 'control_strength':
                return this.controlStrengthScore(signals);
            case 'jha_quality':
                return this.jhaQualityScore(signals);
            case 'inspection_quality':
                return this.inspectionQualityScore(signals);
            case 'corrective_action_priority':
                return this.correctiveActionPriorityScore(signals);
            case 'emergency_readiness':
                return this.emergencyReadinessScore(signals);
            case 'access_compliance':
                return this.accessComplianceScore(signals);
            default:
                return { score: 0, maxScore: 100, components: [] };
        }
    }
    workerSafetyScore(input) {
        const components = [];
        let score = input.profileScore ?? 75;
        if ((input.overdueCapa ?? 0) > 0) {
            const d = Math.min(30, input.overdueCapa * 10);
            score -= d;
            components.push({ key: 'overdue_capa', weight: 0.35, value: input.overdueCapa, deduction: d });
        }
        if ((input.denials30d ?? 0) > 0) {
            const d = Math.min(20, input.denials30d * 4);
            score -= d;
            components.push({ key: 'access_denials', weight: 0.25, value: input.denials30d, deduction: d });
        }
        if ((input.sifExposures ?? 0) > 0) {
            const d = Math.min(25, input.sifExposures * 8);
            score -= d;
            components.push({ key: 'sif_exposure', weight: 0.3, value: input.sifExposures, deduction: d });
        }
        return { score: clamp(score), maxScore: 100, components };
    }
    equipmentSafetyScore(input) {
        let score = 100;
        const components = [];
        const safetyStatus = input.safetyStatus ?? 'OK';
        const lockoutStatus = input.lockoutStatus ?? 'CLEAR';
        if (safetyStatus !== 'OK') {
            score -= 40;
            components.push({ key: 'safety_status', weight: 0.4, value: 1, deduction: 40 });
        }
        if (lockoutStatus !== 'CLEAR') {
            score -= 35;
            components.push({ key: 'lockout', weight: 0.35, value: 1, deduction: 35 });
        }
        if ((input.openCapa ?? 0) > 0) {
            const d = Math.min(25, input.openCapa * 12);
            score -= d;
            components.push({ key: 'open_capa', weight: 0.25, value: input.openCapa, deduction: d });
        }
        if ((input.failures90d ?? 0) > 0) {
            const d = Math.min(15, input.failures90d * 5);
            score -= d;
            components.push({ key: 'failures', weight: 0.15, value: input.failures90d, deduction: d });
        }
        return { score: clamp(score), maxScore: 100, components };
    }
    projectSafetyScore(input) {
        let score = 100;
        const components = [];
        const overdueCapa = input.overdueCapa ?? 0;
        const criticalHazards = input.criticalHazards ?? 0;
        const openIncidents = input.openIncidents ?? 0;
        const closureRate = input.closureRate ?? 100;
        const overdueDed = Math.min(25, overdueCapa * 8);
        score -= overdueDed;
        if (overdueCapa > 0) {
            components.push({ key: 'overdue_capa', weight: 0.3, value: overdueCapa, deduction: overdueDed });
        }
        const hazardDed = Math.min(20, criticalHazards * 10);
        score -= hazardDed;
        if (criticalHazards > 0) {
            components.push({ key: 'critical_hazards', weight: 0.25, value: criticalHazards, deduction: hazardDed });
        }
        const incidentDed = Math.min(15, openIncidents * 7);
        score -= incidentDed;
        if (openIncidents > 0) {
            components.push({ key: 'incidents', weight: 0.2, value: openIncidents, deduction: incidentDed });
        }
        const closureDed = Math.max(0, 50 - closureRate) * 0.3;
        score -= closureDed;
        components.push({ key: 'closure_rate', weight: 0.25, value: closureRate, deduction: closureDed });
        return { score: clamp(score), maxScore: 100, components };
    }
    companySafetyScore(input) {
        const projectScores = input.projectScores ?? [];
        if (projectScores.length === 0) {
            return { score: 100, maxScore: 100, components: [{ key: 'no_projects', weight: 1, value: 0, deduction: 0 }] };
        }
        const avg = projectScores.reduce((a, b) => a + b, 0) / projectScores.length;
        const min = Math.min(...projectScores);
        const score = clamp(avg * 0.7 + min * 0.3);
        return {
            score,
            maxScore: 100,
            components: [
                { key: 'avg_project', weight: 0.7, value: avg, deduction: 100 - avg },
                { key: 'worst_project', weight: 0.3, value: min, deduction: 100 - min },
            ],
        };
    }
    hazardSeverityScore(input) {
        const severity = input.severity ?? 0;
        const sifPotential = input.sifPotential ?? false;
        const controlCount = input.controlCount ?? 0;
        let score = Math.min(100, severity * 20);
        if (sifPotential)
            score = Math.min(100, score + 25);
        if (controlCount === 0)
            score = Math.min(100, score + 20);
        return {
            score: clamp(score),
            maxScore: 100,
            components: [
                { key: 'severity', weight: 0.5, value: severity, deduction: 0 },
                { key: 'sif', weight: 0.3, value: sifPotential ? 1 : 0, deduction: 0 },
                { key: 'controls', weight: 0.2, value: controlCount, deduction: 0 },
            ],
        };
    }
    controlStrengthScore(input) {
        const effectiveness = input.effectiveness ?? 3;
        const mapped = input.mapped ?? true;
        const verified = input.verified ?? false;
        let score = effectiveness * 20;
        if (!mapped)
            score *= 0.5;
        if (!verified)
            score *= 0.8;
        return {
            score: clamp(score),
            maxScore: 100,
            components: [
                { key: 'effectiveness', weight: 0.6, value: effectiveness, deduction: 0 },
                { key: 'mapped', weight: 0.2, value: mapped ? 1 : 0, deduction: 0 },
                { key: 'verified', weight: 0.2, value: verified ? 1 : 0, deduction: 0 },
            ],
        };
    }
    jhaQualityScore(input) {
        let score = 100;
        const components = [];
        const sig = input.signatureCompleteness ?? 100;
        const coverage = input.hazardCoverage ?? 100;
        const sigDed = Math.max(0, 100 - sig) * 0.4;
        score -= sigDed;
        components.push({ key: 'signatures', weight: 0.4, value: sig, deduction: sigDed });
        const covDed = Math.max(0, 100 - coverage) * 0.35;
        score -= covDed;
        components.push({ key: 'hazard_coverage', weight: 0.35, value: coverage, deduction: covDed });
        if (!input.supervisorReview) {
            score -= 20;
            components.push({ key: 'supervisor_review', weight: 0.25, value: 0, deduction: 20 });
        }
        return { score: clamp(score), maxScore: 100, components };
    }
    inspectionQualityScore(input) {
        let score = 100;
        const components = [];
        const deficiencies = input.deficiencyCount ?? 0;
        const repeats = input.repeatFindings ?? 0;
        const defDed = Math.min(50, deficiencies * 8);
        score -= defDed;
        if (deficiencies > 0) {
            components.push({ key: 'deficiencies', weight: 0.5, value: deficiencies, deduction: defDed });
        }
        const repDed = Math.min(30, repeats * 10);
        score -= repDed;
        if (repeats > 0) {
            components.push({ key: 'repeat_findings', weight: 0.3, value: repeats, deduction: repDed });
        }
        return { score: clamp(score), maxScore: 100, components };
    }
    correctiveActionPriorityScore(input) {
        const severity = input.capaSeverity ?? 3;
        const daysOpen = input.daysOpen ?? 0;
        const escalation = input.escalationLevel ?? 0;
        let score = severity * 15 + Math.min(40, daysOpen * 2) + escalation * 10;
        return {
            score: clamp(score),
            maxScore: 100,
            components: [
                { key: 'severity', weight: 0.45, value: severity, deduction: 0 },
                { key: 'days_open', weight: 0.35, value: daysOpen, deduction: 0 },
                { key: 'escalation', weight: 0.2, value: escalation, deduction: 0 },
            ],
        };
    }
    emergencyReadinessScore(input) {
        let score = 100;
        const components = [];
        const plan = input.planCompleteness ?? 80;
        const drillDays = input.drillRecencyDays ?? 180;
        const active = input.activeEmergencies ?? 0;
        const planDed = Math.max(0, 100 - plan) * 0.35;
        score -= planDed;
        components.push({ key: 'plan_completeness', weight: 0.35, value: plan, deduction: planDed });
        if (drillDays > 90) {
            const d = Math.min(25, (drillDays - 90) / 6);
            score -= d;
            components.push({ key: 'drill_recency', weight: 0.3, value: drillDays, deduction: d });
        }
        if (active > 0) {
            const d = Math.min(40, active * 20);
            score -= d;
            components.push({ key: 'active_emergencies', weight: 0.35, value: active, deduction: d });
        }
        return { score: clamp(score), maxScore: 100, components };
    }
    accessComplianceScore(input) {
        let score = 100;
        const components = [];
        const grantRate = input.grantRate ?? 95;
        const denialRate = input.denialRate ?? 5;
        const overdueTraining = input.overdueTraining ?? 0;
        const grantDed = Math.max(0, 95 - grantRate) * 0.8;
        score -= grantDed;
        components.push({ key: 'grant_rate', weight: 0.35, value: grantRate, deduction: grantDed });
        const denialDed = Math.min(30, denialRate * 3);
        score -= denialDed;
        if (denialRate > 0) {
            components.push({ key: 'denial_rate', weight: 0.3, value: denialRate, deduction: denialDed });
        }
        const trainDed = Math.min(25, overdueTraining * 5);
        score -= trainDed;
        if (overdueTraining > 0) {
            components.push({ key: 'overdue_training', weight: 0.35, value: overdueTraining, deduction: trainDed });
        }
        return { score: clamp(score), maxScore: 100, components };
    }
}
exports.ScoringEngine = ScoringEngine;
exports.scoringEngine = new ScoringEngine();
