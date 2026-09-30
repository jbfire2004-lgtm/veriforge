"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyGateEngine = exports.riskLevelEngine = exports.SafetyGateEngine = exports.RiskLevelEngine = void 0;
const client_1 = require("@prisma/client");
const RISK_ORDER = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
};
class RiskLevelEngine {
    isHigherRisk(current, proposed) {
        return RISK_ORDER[proposed] > RISK_ORDER[current];
    }
    requiresEnhancedGating(riskLevel) {
        return riskLevel === client_1.RiskLevel.high || riskLevel === client_1.RiskLevel.critical;
    }
}
exports.RiskLevelEngine = RiskLevelEngine;
class SafetyGateEngine {
    evaluate(projectRiskLevel, metadata, input, upstreamScore) {
        const checks = [];
        if (metadata.safetyGateEnabled === false) {
            return {
                passed: true,
                reason: 'Safety gating disabled for project',
                gates: [],
                projectRiskLevel,
            };
        }
        if (projectRiskLevel === client_1.RiskLevel.critical) {
            checks.push({
                passed: Boolean(input.hasActiveJha),
                reason: input.hasActiveJha ? 'Active JHA present' : 'Critical project requires active JHA',
                gate: 'jha_required',
            });
        }
        if (exports.riskLevelEngine.requiresEnhancedGating(projectRiskLevel)) {
            checks.push({
                passed: Boolean(input.hasPermits),
                reason: input.hasPermits ? 'Permits verified' : 'High/critical project requires permits',
                gate: 'permits_required',
            });
        }
        const requiredTraining = [
            ...(metadata.requiredTraining ?? []),
            ...(input.requiredTraining ?? []),
        ];
        const completed = new Set(input.completedTraining ?? []);
        for (const courseId of requiredTraining) {
            checks.push({
                passed: completed.has(courseId),
                reason: completed.has(courseId)
                    ? `Training ${courseId} complete`
                    : `Missing training ${courseId}`,
                gate: 'required_training',
            });
        }
        if (upstreamScore != null && upstreamScore < 60) {
            checks.push({
                passed: false,
                reason: `Project safety score ${upstreamScore} below threshold`,
                gate: 'project_safety_score',
            });
        }
        const failed = checks.filter((c) => !c.passed);
        return {
            passed: failed.length === 0,
            reason: failed.length === 0
                ? 'All safety gates passed'
                : failed.map((f) => f.reason).join('; '),
            gates: failed.map((f) => f.gate),
            projectRiskLevel,
        };
    }
}
exports.SafetyGateEngine = SafetyGateEngine;
exports.riskLevelEngine = new RiskLevelEngine();
exports.safetyGateEngine = new SafetyGateEngine();
