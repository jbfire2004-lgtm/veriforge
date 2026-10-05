"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.severityToScore = severityToScore;
exports.scoreToSeverity = scoreToSeverity;
exports.toCailEnvelope = toCailEnvelope;
function severityToScore(severity) {
    const s = (severity !== null && severity !== void 0 ? severity : 'medium').toLowerCase();
    if (s === 'critical')
        return 5;
    if (s === 'high')
        return 4;
    if (s === 'medium')
        return 3;
    if (s === 'low')
        return 2;
    return 3;
}
function scoreToSeverity(score) {
    if (score >= 5)
        return 'critical';
    if (score >= 4)
        return 'high';
    if (score >= 3)
        return 'medium';
    return 'low';
}
function normalizeRiskCategory(value) {
    const v = (value !== null && value !== void 0 ? value : 'other').toLowerCase();
    if (v.includes('behav'))
        return 'behavior';
    if (v.includes('equip'))
        return 'equipment';
    if (v.includes('env'))
        return 'environment';
    if (v.includes('proc'))
        return 'process';
    if (v.includes('ppe'))
        return 'ppe';
    if (v.includes('ergo'))
        return 'ergonomic';
    return 'other';
}
function toCailEnvelope(module, output) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    const base = {
        hazard_type: '',
        risk_category: 'other',
        severity_score: 3,
        root_cause_category: '',
        root_cause_explanation: '',
        recommended_corrective_actions: [],
        recommended_preventive_actions: [],
        tags: [],
        lessons_learned: '',
        predictive_risk_flags: [],
    };
    if (module === 'inspection') {
        const o = output;
        return Object.assign(Object.assign({}, base), { hazard_type: (_a = o.hazard_type) !== null && _a !== void 0 ? _a : '', risk_category: normalizeRiskCategory(o.risk_category), severity_score: (_b = o.severity_score) !== null && _b !== void 0 ? _b : 3, recommended_corrective_actions: o.recommended_corrective_action
                ? [o.recommended_corrective_action]
                : [], tags: (_c = o.tags) !== null && _c !== void 0 ? _c : [] });
    }
    if (module === 'bbo') {
        const o = output;
        return Object.assign(Object.assign({}, base), { hazard_type: (_d = o.behavior_type) !== null && _d !== void 0 ? _d : '', risk_category: normalizeRiskCategory(o.root_cause_category), root_cause_category: (_e = o.root_cause_category) !== null && _e !== void 0 ? _e : '', root_cause_explanation: (_f = o.root_cause_explanation) !== null && _f !== void 0 ? _f : '', recommended_corrective_actions: (_g = o.recommended_actions) !== null && _g !== void 0 ? _g : [], tags: (_h = o.tags) !== null && _h !== void 0 ? _h : [] });
    }
    if (module === 'incident') {
        const o = output;
        return Object.assign(Object.assign({}, base), { hazard_type: 'incident', severity_score: severityToScore(o.sif_potential), root_cause_category: 'incident', root_cause_explanation: (_j = o.root_cause_primary) !== null && _j !== void 0 ? _j : '', recommended_corrective_actions: (_k = o.corrective_actions) !== null && _k !== void 0 ? _k : [], recommended_preventive_actions: (_l = o.preventive_actions) !== null && _l !== void 0 ? _l : [], lessons_learned: (_m = o.lessons_learned) !== null && _m !== void 0 ? _m : '', predictive_risk_flags: (_o = o.predictive_risk_flags) !== null && _o !== void 0 ? _o : [], tags: ['incident', o.sif_potential] });
    }
    if (module === 'equipment') {
        const o = output;
        return Object.assign(Object.assign({}, base), { hazard_type: (_p = o.failure_mode) !== null && _p !== void 0 ? _p : '', risk_category: normalizeRiskCategory(o.risk_category), severity_score: (_q = o.severity_score) !== null && _q !== void 0 ? _q : 3, recommended_corrective_actions: (_r = o.recommended_corrective_actions) !== null && _r !== void 0 ? _r : [], recommended_preventive_actions: (_s = o.recommended_preventive_actions) !== null && _s !== void 0 ? _s : [], tags: (_t = o.tags) !== null && _t !== void 0 ? _t : [] });
    }
    if (module === 'form_hazard') {
        const o = output;
        return Object.assign(Object.assign({}, base), { hazard_type: (_u = o.hazard_type) !== null && _u !== void 0 ? _u : '', risk_category: normalizeRiskCategory(o.root_cause_category), severity_score: (_v = o.severity_score) !== null && _v !== void 0 ? _v : 3, root_cause_category: (_w = o.root_cause_category) !== null && _w !== void 0 ? _w : '', recommended_corrective_actions: (_x = o.recommended_corrective_actions) !== null && _x !== void 0 ? _x : [], recommended_preventive_actions: (_y = o.recommended_preventive_actions) !== null && _y !== void 0 ? _y : [], tags: (_z = o.tags) !== null && _z !== void 0 ? _z : [] });
    }
    if (module === 'lessons_learned') {
        const o = output;
        return Object.assign(Object.assign({}, base), { lessons_learned: (_0 = o.summary) !== null && _0 !== void 0 ? _0 : '', root_cause_explanation: (_1 = o.what_went_wrong) !== null && _1 !== void 0 ? _1 : '', recommended_corrective_actions: o.what_fixed_it ? [o.what_fixed_it] : [], recommended_preventive_actions: o.how_to_prevent_recurrence
                ? [o.how_to_prevent_recurrence]
                : [], tags: (_2 = o.applicable_to) !== null && _2 !== void 0 ? _2 : [] });
    }
    if (module === 'presentation') {
        const o = output;
        return Object.assign(Object.assign({}, base), { lessons_learned: (_3 = o.executive_summary) !== null && _3 !== void 0 ? _3 : '', predictive_risk_flags: (_4 = o.top_risks) !== null && _4 !== void 0 ? _4 : [], recommended_preventive_actions: (_5 = o.recommended_actions_next_30_days) !== null && _5 !== void 0 ? _5 : [], tags: (_6 = o.key_trends) !== null && _6 !== void 0 ? _6 : [] });
    }
    if (module === 'predictive_risk') {
        const o = output;
        return Object.assign(Object.assign({}, base), { predictive_risk_flags: [
                ...((_7 = o.emerging_risks) !== null && _7 !== void 0 ? _7 : []),
                ...((_8 = o.early_warning_flags) !== null && _8 !== void 0 ? _8 : []),
            ], recommended_preventive_actions: (_9 = o.recommended_preventive_actions) !== null && _9 !== void 0 ? _9 : [], tags: (_10 = o.high_risk_tasks) !== null && _10 !== void 0 ? _10 : [] });
    }
    if (module === 'cail_analyze') {
        return Object.assign(Object.assign({}, base), output);
    }
    return base;
}
//# sourceMappingURL=vsi-copilot.mappers.js.map