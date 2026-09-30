"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainabilityEngine = exports.ExplainabilityEngine = void 0;
class ExplainabilityEngine {
    explain(input) {
        switch (input.targetType) {
            case 'prediction':
                return this.build(this.forPrediction(input));
            case 'score':
                return this.build(this.forScore(input));
            case 'recommendation':
                return this.build(this.forRecommendation(input));
            default:
                return this.build(this.forPrediction(input));
        }
    }
    forPrediction(input) {
        const predictionType = input.predictionType ?? 'unknown';
        const probability = input.probability ?? 0;
        const factors = input.factors ?? [];
        const dataSources = input.dataSources ?? ['cail_prediction_service'];
        const confidence = input.confidence ?? Math.min(0.98, 0.65 + factors.length * 0.05);
        return {
            targetType: 'prediction',
            targetId: input.predictionId ?? predictionType,
            summary: `${predictionType.replace(/_/g, ' ')} probability ${Math.round(probability * 100)}%`,
            why: { factors, probability, riskLevel: input.riskLevel },
            confidence,
            evidence: input.evidence ?? factors,
            contributingFactors: this.bucketFactors(factors),
            recommendedActions: input.requiredActions ?? this.defaultActions(predictionType),
            dataSources,
            scoreId: input.scoreId,
            recommendationId: input.recommendationId,
            entityType: input.entityType,
            entityId: input.entityId,
            projectId: input.projectId,
        };
    }
    forScore(input) {
        const scoreType = input.scoreType ?? 'unknown';
        const scoreValue = input.scoreValue ?? 0;
        const components = input.components ?? [];
        const factorKeys = components.map((c) => `${c.key}=${c.value} (deduction ${c.deduction})`);
        const confidence = input.confidence ?? Math.min(0.95, 0.7 + components.length * 0.04);
        return {
            targetType: 'score',
            targetId: input.scoreId ?? scoreType,
            summary: `${scoreType.replace(/_/g, ' ')} score ${Math.round(scoreValue)} / 100`,
            why: { components, scoreValue, riskLevel: input.riskLevel },
            confidence,
            evidence: input.evidence ?? factorKeys,
            contributingFactors: this.bucketFactors(factorKeys),
            recommendedActions: input.requiredActions ?? this.scoreActions(scoreType, scoreValue),
            dataSources: input.dataSources ?? ['cail_scoring_service'],
            scoreId: input.scoreId,
            entityType: input.entityType,
            entityId: input.entityId,
            projectId: input.projectId,
        };
    }
    forRecommendation(input) {
        const title = input.recommendationTitle ?? 'Safety recommendation';
        const reason = input.recommendationReason ?? '';
        const factors = input.factors ?? input.evidence ?? [];
        const confidence = input.confidence ?? 0.85;
        return {
            targetType: 'recommendation',
            targetId: input.recommendationId ?? input.recommendationType ?? 'recommendation',
            summary: `${title}${reason ? `. ${reason}` : ''}`,
            why: {
                recommendationType: input.recommendationType,
                factors,
                reason,
            },
            confidence,
            evidence: input.evidence ?? factors,
            contributingFactors: this.bucketFactors(factors),
            recommendedActions: input.requiredActions ?? [],
            dataSources: input.dataSources ?? ['cail_recommendation_service'],
            recommendationId: input.recommendationId,
            entityType: input.entityType,
            entityId: input.entityId,
            projectId: input.projectId,
        };
    }
    build(data) {
        const sections = [data.summary, ''];
        const cf = data.contributingFactors;
        if (cf.hazard.length)
            sections.push(`Hazards: ${cf.hazard.join('; ')}`);
        if (cf.control.length)
            sections.push(`Controls: ${cf.control.join('; ')}`);
        if (cf.worker.length)
            sections.push(`Workers: ${cf.worker.join('; ')}`);
        if (cf.equipment.length)
            sections.push(`Equipment: ${cf.equipment.join('; ')}`);
        if (cf.project.length)
            sections.push(`Project: ${cf.project.join('; ')}`);
        if (data.evidence.length) {
            sections.push(`Evidence: ${data.evidence.join(', ')}`);
        }
        if (data.dataSources.length) {
            sections.push(`Data sources: ${data.dataSources.join(', ')}`);
        }
        sections.push(`Confidence: ${Math.round(data.confidence * 100)}%`);
        if (data.recommendedActions.length) {
            sections.push(`Recommended: ${data.recommendedActions.join(' → ')}`);
        }
        return {
            ...data,
            humanReadable: sections.join('\n'),
        };
    }
    bucketFactors(factors) {
        return {
            hazard: factors.filter((f) => /hazard|sif/i.test(f)),
            control: factors.filter((f) => /control/i.test(f)),
            worker: factors.filter((f) => /worker|training|access/i.test(f)),
            equipment: factors.filter((f) => /equipment|lockout|failure/i.test(f)),
            project: factors.filter((f) => /project|capa|incident|schedule/i.test(f)),
        };
    }
    defaultActions(predictionType) {
        const map = {
            incident_likelihood: ['Supervisor review', 'Increase field presence'],
            equipment_failure: ['Pre-use inspection', 'Maintenance work order'],
            capa_overdue: ['Escalation sweep', 'Reassign primary owner'],
            project_risk: ['Project safety meeting', 'Critical CAPA blitz'],
            training_lapse: ['Schedule training', 'Restrict zone access'],
            hazard_emergence: ['Publish hazard controls', 'Engineering review'],
            sif_heca_potential: ['SIF review board', 'HECA assessment'],
            access_denial: ['Review training status', 'Supervisor escort'],
            emergency_likelihood: ['Verify ERP', 'Conduct drill'],
        };
        return map[predictionType] ?? ['Review with safety officer'];
    }
    scoreActions(scoreType, scoreValue) {
        if (scoreValue >= 80)
            return ['Maintain current controls', 'Continue monitoring'];
        if (scoreType.includes('worker'))
            return ['Coaching', 'Close open CAPA', 'Refresh training'];
        if (scoreType.includes('equipment'))
            return ['Inspection', 'Clear lockout', 'Maintenance'];
        if (scoreType.includes('project'))
            return ['CAPA blitz', 'Supervisor walkdown'];
        return ['Review contributing factors', 'Assign corrective owner'];
    }
}
exports.ExplainabilityEngine = ExplainabilityEngine;
exports.explainabilityEngine = new ExplainabilityEngine();
