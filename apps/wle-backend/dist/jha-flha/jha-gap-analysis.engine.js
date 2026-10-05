"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeJhaGaps = analyzeJhaGaps;
const jha_library_catalog_1 = require("./jha-library-catalog");
function taskText(input) {
    return [input.taskDescription, input.locationNote, input.weather]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}
function matchesProfile(text, tokens) {
    return tokens.some((t) => text.includes(t.toLowerCase()));
}
function analyzeJhaGaps(input) {
    var _a, _b;
    const text = taskText(input);
    const existingH = new Set(input.existingHazardDescriptions.map((d) => d.toLowerCase().trim()));
    const existingC = new Set(input.existingControlDescriptions.map((d) => d.toLowerCase().trim()));
    const existingCats = new Set(input.existingHazardCategories);
    const missedHazards = [];
    const missedControls = [];
    const requiredEnergy = new Set(input.existingEnergyTypes);
    const matchedProfiles = [];
    const gapWarnings = [];
    const hecaNotes = [];
    if (!text.trim()) {
        return {
            missedHazards: [],
            missedControls: [],
            requiredEnergyTypes: [],
            matchedProfiles: [],
            gapWarnings: [],
            hecaNotes: [],
        };
    }
    for (const profile of jha_library_catalog_1.TASK_HAZARD_PROFILES) {
        if (!matchesProfile(text, profile.tokens))
            continue;
        matchedProfiles.push(profile.id);
        for (const e of profile.energyTypes)
            requiredEnergy.add(e);
        const categoryCovered = profile.hazardCategories.some((c) => existingCats.has(c));
        const keywordCovered = profile.hazardKeywords.some((kw) => input.existingHazardDescriptions.some((d) => d.toLowerCase().includes(kw.toLowerCase())));
        if (!categoryCovered && !keywordCovered) {
            const candidates = input.hazardLibrary
                .filter((h) => !existingH.has(h.description.toLowerCase().trim()))
                .filter((h) => profile.hazardCategories.includes(h.category) ||
                profile.hazardKeywords.some((kw) => h.description.toLowerCase().includes(kw.toLowerCase())))
                .slice(0, 3);
            for (const h of candidates) {
                missedHazards.push(Object.assign(Object.assign({}, h), { score: 90, reason: `Task matches "${profile.label}" — this hazard is commonly required`, profileId: profile.id }));
            }
            if (candidates.length === 0) {
                gapWarnings.push(`Task scope suggests "${profile.label}" work — add hazards for: ${profile.hazardCategories.join(', ')}`);
            }
        }
        const hasRequiredControl = profile.requiredControlCategories.some((cat) => {
            var _a;
            return input.controlLibrary.some((c) => existingC.has(c.description.toLowerCase().trim()) &&
                (c.hazardCategories.includes(cat) ||
                    c.hazardCategories.length === 0)) ||
                ((_a = input.onFormControls) === null || _a === void 0 ? void 0 : _a.some((c) => existingC.has(c.description.toLowerCase().trim()) &&
                    input.existingHazardCategories.some((hc) => profile.requiredControlCategories.includes(hc))));
        });
        const controlCatOnForm = profile.requiredControlCategories.some((cat) => input.existingHazardCategories.includes(cat) &&
            input.existingControlDescriptions.length > 0);
        if (!hasRequiredControl && !controlCatOnForm) {
            const controlCandidates = input.controlLibrary
                .filter((c) => !existingC.has(c.description.toLowerCase().trim()))
                .filter((c) => profile.requiredControlCategories.some((cat) => c.hazardCategories.includes(cat)))
                .sort((a, b) => (a.controlClass === 'direct' ? -1 : 1))
                .slice(0, 3);
            for (const c of controlCandidates) {
                missedControls.push(Object.assign(Object.assign({}, c), { score: 85, reason: `Recommended for "${profile.label}" — ${c.controlClass === 'direct' ? 'direct' : 'alternative'} control`, profileId: profile.id }));
            }
        }
        if (profile.minDirectControls && profile.minDirectControls > 0) {
            const directOnForm = (_b = (_a = input.onFormControls) === null || _a === void 0 ? void 0 : _a.filter((c) => c.controlClass === 'direct' ||
                c.controlType === 'elimination' ||
                c.controlType === 'substitution' ||
                c.controlType === 'engineering').length) !== null && _b !== void 0 ? _b : 0;
            if (directOnForm < profile.minDirectControls &&
                profile.hazardCategories.some((c) => existingCats.has(c))) {
                hecaNotes.push(`CSRA/HECA: "${profile.label}" high-energy work should have a direct control (energy-targeted, error-tolerant) — consider engineering or elimination`);
            }
        }
    }
    for (const e of requiredEnergy) {
        if (!input.existingEnergyTypes.includes(e)) {
            gapWarnings.push(`Energy wheel: select "${e}" based on task scope and identified hazards`);
        }
    }
    const dedupe = (items) => {
        const seen = new Set();
        return items.filter((i) => {
            const k = i.description.toLowerCase();
            if (seen.has(k))
                return false;
            seen.add(k);
            return true;
        });
    };
    return {
        missedHazards: dedupe(missedHazards)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12),
        missedControls: dedupe(missedControls)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12),
        requiredEnergyTypes: Array.from(requiredEnergy),
        matchedProfiles,
        gapWarnings,
        hecaNotes,
    };
}
//# sourceMappingURL=jha-gap-analysis.engine.js.map