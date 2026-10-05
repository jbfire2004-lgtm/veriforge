"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestJhaLibrary = suggestJhaLibrary;
const jha_flha_constants_1 = require("./jha-flha.constants");
const jha_gap_analysis_engine_1 = require("./jha-gap-analysis.engine");
const jha_library_seed_1 = require("./jha-library-seed");
const HIERARCHY = {
    elimination: 5,
    substitution: 4,
    engineering: 3,
    administrative: 2,
    ppe: 1,
};
function tokenize(text) {
    return text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 2);
}
function keywordScore(text, keywords) {
    if (!(keywords === null || keywords === void 0 ? void 0 : keywords.length) || !text.trim())
        return 0;
    const tokens = new Set(tokenize(text));
    let score = 0;
    for (const kw of keywords) {
        const parts = tokenize(kw);
        if (parts.some((p) => tokens.has(p)))
            score += 2;
        if (text.toLowerCase().includes(kw.toLowerCase()))
            score += 3;
    }
    return score;
}
function weatherHazardBoost(weather, category) {
    if (!(weather === null || weather === void 0 ? void 0 : weather.trim()))
        return 0;
    const w = weather.toLowerCase();
    if (category === 'Weather') {
        if (w.includes('ice') || w.includes('snow') || w.includes('wet'))
            return 8;
        if (w.includes('heat') || w.includes('hot'))
            return 8;
        if (w.includes('wind'))
            return 8;
    }
    if (w.includes('wind') && category === 'Lifting')
        return 5;
    return 0;
}
function projectLearningBoost(description, learnings, kind) {
    if (!(learnings === null || learnings === void 0 ? void 0 : learnings.approvedFormCount))
        return { score: 0 };
    const key = description.toLowerCase().trim();
    const pool = kind === 'hazard' ? learnings.hazards : learnings.controls;
    const hit = pool.find((p) => p.description.toLowerCase().trim() === key);
    if (!hit)
        return { score: 0 };
    const score = Math.min(20, 6 + hit.count * 2);
    return {
        score,
        reason: `Your crew often adds this (${hit.count} approved form${hit.count === 1 ? '' : 's'})`,
    };
}
function suggestJhaLibrary(input) {
    var _a;
    const taskText = [input.taskDescription, input.locationNote]
        .filter(Boolean)
        .join(' ');
    const existingH = new Set(input.existingHazardDescriptions.map((d) => d.toLowerCase().trim()));
    const existingC = new Set(input.existingControlDescriptions.map((d) => d.toLowerCase().trim()));
    const warnings = [];
    const hazardPool = input.hazardLibrary.length
        ? input.hazardLibrary
        : jha_library_seed_1.FULL_HAZARD_SEED;
    const controlPool = input.controlLibrary.length
        ? input.controlLibrary
        : jha_library_seed_1.FULL_CONTROL_SEED;
    const suggestedHazards = hazardPool
        .filter((h) => !existingH.has(h.description.toLowerCase().trim()))
        .map((h) => {
        var _a;
        let score = keywordScore(taskText, h.keywords) +
            weatherHazardBoost(input.weather, h.category);
        if (input.selectedEnergyTypes.some((e) => h.defaultEnergyTypes.includes(e)))
            score += 4;
        const learned = projectLearningBoost(h.description, input.projectLearnings, 'hazard');
        score += learned.score;
        const reason = (_a = learned.reason) !== null && _a !== void 0 ? _a : (score >= 6
            ? 'Matches task description or site conditions'
            : score >= 4
                ? 'Related to selected energy sources'
                : 'Common industry hazard');
        return Object.assign(Object.assign({}, h), { score, reason });
    })
        .filter((h) => h.score > 0 || input.selectedHazardCategories.length === 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    const categories = new Set([
        ...input.selectedHazardCategories,
        ...suggestedHazards.slice(0, 5).map((h) => h.category),
    ]);
    if (input.focusedHazardCategory)
        categories.add(input.focusedHazardCategory);
    for (const es of input.selectedEnergyTypes) {
        const def = jha_flha_constants_1.ENERGY_WHEEL.find((e) => e.type === es);
        if (def) {
            const hasRequired = controlPool.some((c) => def.requiredControlTypes.includes(c.controlType) &&
                categories.size > 0 &&
                (c.hazardCategories.length === 0 ||
                    c.hazardCategories.some((cat) => categories.has(cat))));
            if (!hasRequired && input.selectedHazardCategories.length > 0) {
                warnings.push(`Add ${def.requiredControlTypes.join(' or ')} controls for ${def.label} energy`);
            }
        }
    }
    const focusedEnergies = new Set((_a = input.focusedHazardEnergyTypes) !== null && _a !== void 0 ? _a : []);
    const focusedCategory = input.focusedHazardCategory;
    const suggestedControls = controlPool
        .filter((c) => !existingC.has(c.description.toLowerCase().trim()))
        .map((c) => {
        var _a, _b, _c, _d;
        let score = ((_a = HIERARCHY[c.controlType]) !== null && _a !== void 0 ? _a : 0) * 2;
        const catMatch = c.hazardCategories.filter((cat) => categories.has(cat)).length;
        score += catMatch * 5;
        if ((_b = c.energyTypes) === null || _b === void 0 ? void 0 : _b.some((e) => input.selectedEnergyTypes.includes(e)))
            score += 3;
        if (focusedCategory) {
            if (c.hazardCategories.includes(focusedCategory))
                score += 15;
            else if (c.hazardCategories.length === 0)
                score += 2;
            else
                score -= 3;
        }
        if (focusedEnergies.size > 0 &&
            ((_c = c.energyTypes) === null || _c === void 0 ? void 0 : _c.some((e) => focusedEnergies.has(e)))) {
            score += 8;
        }
        if (input.focusedHazardDescription && c.hazardCategories.length === 0) {
            score +=
                keywordScore(input.focusedHazardDescription, [c.description]) > 0
                    ? 4
                    : 0;
        }
        const learned = projectLearningBoost(c.description, input.projectLearnings, 'control');
        score += learned.score;
        if (catMatch === 0 &&
            c.hazardCategories.length > 0 &&
            categories.size > 0 &&
            !focusedCategory) {
            score -= 2;
        }
        const matchedCats = c.hazardCategories.filter((cat) => categories.has(cat));
        const reason = (_d = learned.reason) !== null && _d !== void 0 ? _d : (focusedCategory && c.hazardCategories.includes(focusedCategory)
            ? `Recommended for selected hazard (${focusedCategory})`
            : catMatch > 0
                ? `Recommended for ${matchedCats.join(', ')}`
                : score >= 6
                    ? 'Higher-order control (Hierarchy of Controls)'
                    : 'General site control');
        return Object.assign(Object.assign({}, c), { score, reason });
    })
        .sort((a, b) => b.score - a.score)
        .slice(0, 25);
    if (input.selectedHazardCategories.length > 0 &&
        suggestedControls.filter((c) => c.score >= 8).length === 0) {
        warnings.push('Selected hazards may need additional engineering or administrative controls');
    }
    if (focusedCategory) {
        const hasNonPpe = suggestedControls.some((c) => c.hazardCategories.includes(focusedCategory) &&
            c.controlType !== 'ppe' &&
            c.score >= 10);
        if (!hasNonPpe) {
            warnings.push(`Selected hazard (${focusedCategory}) typically needs engineering or administrative controls — not PPE alone`);
        }
    }
    const crewOftenAdds = input.projectLearnings && input.projectLearnings.approvedFormCount > 0
        ? {
            hazards: input.projectLearnings.hazards
                .filter((h) => !existingH.has(h.description.toLowerCase().trim()))
                .slice(0, 6)
                .map((h) => (Object.assign(Object.assign({}, h), { reason: `Used on ${h.count} approved form${h.count === 1 ? '' : 's'} for this project` }))),
            controls: input.projectLearnings.controls
                .filter((c) => !existingC.has(c.description.toLowerCase().trim()))
                .slice(0, 6)
                .map((c) => (Object.assign(Object.assign({}, c), { reason: `Used on ${c.count} approved form${c.count === 1 ? '' : 's'} for this project` }))),
        }
        : undefined;
    return Object.assign({ suggestedHazards,
        suggestedControls,
        warnings,
        crewOftenAdds }, (() => {
        var _a, _b;
        const gaps = (0, jha_gap_analysis_engine_1.analyzeJhaGaps)({
            taskDescription: input.taskDescription,
            locationNote: input.locationNote,
            weather: input.weather,
            existingHazardDescriptions: input.existingHazardDescriptions,
            existingHazardCategories: input.selectedHazardCategories,
            existingControlDescriptions: input.existingControlDescriptions,
            existingControlTypes: (_b = (_a = input.onFormControls) === null || _a === void 0 ? void 0 : _a.map((c) => c.controlType)) !== null && _b !== void 0 ? _b : [],
            existingEnergyTypes: input.selectedEnergyTypes,
            hazardLibrary: hazardPool,
            controlLibrary: controlPool,
            onFormControls: input.onFormControls,
        });
        for (const w of gaps.gapWarnings) {
            if (!warnings.includes(w))
                warnings.push(w);
        }
        for (const n of gaps.hecaNotes) {
            if (!warnings.includes(n))
                warnings.push(n);
        }
        return {
            missedHazards: gaps.missedHazards,
            missedControls: gaps.missedControls,
            requiredEnergyTypes: gaps.requiredEnergyTypes,
            matchedTaskProfiles: gaps.matchedProfiles,
            gapWarnings: gaps.gapWarnings,
            hecaNotes: gaps.hecaNotes,
        };
    })());
}
//# sourceMappingURL=jha-suggestion.engine.js.map