"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicSuggestEngine = void 0;
class TopicSuggestEngine {
    suggest(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const out = [];
        for (const inc of input.recentIncidents.slice(0, 5)) {
            out.push({
                title: `Review: ${inc.title}`,
                categoryCode: 'behavioral_safety',
                reason: `Recent incident (${(_a = inc.severity) !== null && _a !== void 0 ? _a : 'unknown'} severity)`,
                sourceModule: 'incident',
                sourceId: inc.id,
                priority: inc.severity === 'critical' ? 95 : 70,
                isHighRisk: inc.severity === 'critical' || inc.severity === 'high',
            });
        }
        for (const d of input.recentDeficiencies.slice(0, 5)) {
            out.push({
                title: `Close the loop: ${d.title}`,
                categoryCode: 'general',
                reason: `Open inspection deficiency (score ${(_b = d.score) !== null && _b !== void 0 ? _b : 50})`,
                sourceModule: 'inspection',
                sourceId: d.id,
                priority: Math.min(100, ((_c = d.score) !== null && _c !== void 0 ? _c : 50) + 20),
                isHighRisk: ((_d = d.score) !== null && _d !== void 0 ? _d : 0) >= 75,
            });
        }
        for (const j of input.highRiskJhas.slice(0, 5)) {
            out.push({
                title: `JHA controls: ${j.title}`,
                categoryCode: 'sif_heca',
                reason: `High-risk JHA (SIF score ${(_e = j.sifScore) !== null && _e !== void 0 ? _e : 'n/a'})`,
                sourceModule: 'jha_flha',
                sourceId: j.id,
                priority: Math.min(100, ((_f = j.sifScore) !== null && _f !== void 0 ? _f : 60) + 15),
                isHighRisk: ((_g = j.sifScore) !== null && _g !== void 0 ? _g : 0) >= 70,
            });
        }
        for (const eq of input.equipmentFailures.slice(0, 3)) {
            out.push({
                title: `Equipment safety: ${eq.title}`,
                categoryCode: 'equipment_operation',
                reason: 'Recent equipment failure or lockout',
                sourceModule: 'equipment',
                sourceId: eq.id,
                priority: 80,
                isHighRisk: true,
            });
        }
        for (const tag of input.sifTrendTags.slice(0, 3)) {
            out.push({
                title: `SIF/HECA focus: ${tag}`,
                categoryCode: 'sif_heca',
                reason: 'Elevated SIF/HECA trend on project',
                sourceModule: 'sif_heca',
                sourceId: tag,
                priority: 85,
                isHighRisk: true,
            });
        }
        if (((_h = input.projectRiskScore) !== null && _h !== void 0 ? _h : 0) >= 70) {
            out.push({
                title: 'Project risk profile — leading indicators',
                categoryCode: 'behavioral_safety',
                reason: `Project risk score ${input.projectRiskScore}`,
                sourceModule: 'project',
                sourceId: 'risk_profile',
                priority: 75,
                isHighRisk: true,
            });
        }
        return out.sort((a, b) => b.priority - a.priority).slice(0, 15);
    }
}
exports.TopicSuggestEngine = TopicSuggestEngine;
//# sourceMappingURL=topic-suggest.engine.js.map