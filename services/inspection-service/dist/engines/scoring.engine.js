"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoringEngine = exports.ScoringEngine = void 0;
const env_1 = require("../config/env");
function clamp(score, max = 100) {
    return Math.max(0, Math.min(max, Math.round(score)));
}
class ScoringEngine {
    compute(checklistItems, findings, passThreshold) {
        const threshold = passThreshold ?? env_1.env.defaultPassThreshold;
        const components = [];
        const findingByKey = new Map(findings.map((f) => [f.itemKey, f]));
        let earned = 0;
        let maxScore = 0;
        for (const item of checklistItems) {
            const weight = item.weight ?? 1;
            const finding = findingByKey.get(item.key);
            const findingType = finding?.findingType ?? 'na';
            if (findingType === 'na') {
                continue;
            }
            maxScore += weight * 100;
            let points = 0;
            if (findingType === 'pass') {
                points = weight * 100;
            }
            else if (findingType === 'observation') {
                points = weight * 70;
            }
            else if (findingType === 'fail') {
                points = 0;
            }
            earned += points;
            components.push({
                key: item.key,
                weight,
                value: points,
                points,
            });
        }
        const score = maxScore > 0 ? clamp((earned / maxScore) * 100) : 0;
        const passed = score >= threshold;
        return {
            score,
            maxScore: 100,
            passThreshold: threshold,
            passed,
            components,
        };
    }
    countCriticalFailures(checklistItems, findings) {
        const criticalKeys = new Set(checklistItems.filter((item) => item.critical).map((item) => item.key));
        return findings.filter((f) => criticalKeys.has(f.itemKey) && f.findingType === 'fail').length;
    }
}
exports.ScoringEngine = ScoringEngine;
exports.scoringEngine = new ScoringEngine();
