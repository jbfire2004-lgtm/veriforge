"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.round = round;
exports.finiteOrNull = finiteOrNull;
exports.ratePer200k = ratePer200k;
exports.severityIndex = severityIndex;
exports.standardizeHecaCategory = standardizeHecaCategory;
exports.standardizeHecaDistribution = standardizeHecaDistribution;
exports.standardizeProjectType = standardizeProjectType;
exports.standardizeCompanyType = standardizeCompanyType;
exports.standardizeIndustry = standardizeIndustry;
exports.standardizeScale = standardizeScale;
exports.normalizeMetrics = normalizeMetrics;
const types_1 = require("./types");
function clamp(n, min = 0, max = 1) {
    return Math.max(min, Math.min(max, n));
}
function round(n, digits = 4) {
    const p = 10 ** digits;
    return Math.round(n * p) / p;
}
function finiteOrNull(n) {
    if (n == null || !Number.isFinite(n))
        return null;
    return n;
}
/**
 * Incidents (or counts) per 200,000 hours.
 */
function ratePer200k(count, hoursWorked) {
    if (count == null || hoursWorked == null || hoursWorked <= 0)
        return null;
    if (!Number.isFinite(count) || !Number.isFinite(hoursWorked))
        return null;
    return round((count / hoursWorked) * types_1.HOURS_DENOMINATOR, 4);
}
/**
 * Severity index 0–100 from weighted severities or sum/count.
 */
function severityIndex(input) {
    if (input.severityWeights && input.severityWeights.length > 0) {
        const vals = input.severityWeights.filter((v) => Number.isFinite(v));
        if (vals.length === 0)
            return null;
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return round(clamp(avg, 0, 100), 2);
    }
    if (input.severitySum != null &&
        input.severityCount != null &&
        input.severityCount > 0) {
        return round(clamp(input.severitySum / input.severityCount, 0, 100), 2);
    }
    return null;
}
const HECA_ALIASES = {
    gravity: "gravity",
    fall: "gravity",
    falls: "gravity",
    height: "gravity",
    electrical: "electrical",
    electric: "electrical",
    electrocution: "electrical",
    mechanical: "mechanical",
    machine: "mechanical",
    equipment: "mechanical",
    pressure: "pressure",
    pneumatic: "pressure",
    hydraulic: "pressure",
    chemical: "chemical",
    hazmat: "chemical",
    thermal: "thermal",
    heat: "thermal",
    burn: "thermal",
    radiation: "radiation",
    biological: "biological",
    bio: "biological",
    other: "other",
};
function standardizeHecaCategory(raw) {
    const key = raw.trim().toLowerCase();
    return HECA_ALIASES[key] ?? "other";
}
function standardizeHecaDistribution(counts) {
    if (!counts)
        return {};
    const totals = {
        gravity: 0,
        electrical: 0,
        mechanical: 0,
        pressure: 0,
        chemical: 0,
        thermal: 0,
        radiation: 0,
        biological: 0,
        other: 0,
    };
    let sum = 0;
    for (const [k, v] of Object.entries(counts)) {
        if (!Number.isFinite(v) || v < 0)
            continue;
        const cat = standardizeHecaCategory(k);
        totals[cat] += v;
        sum += v;
    }
    if (sum <= 0)
        return {};
    const out = {};
    for (const cat of types_1.HECA_CATEGORIES) {
        if (totals[cat] > 0)
            out[cat] = round(totals[cat] / sum, 4);
    }
    return out;
}
const PROJECT_TYPE_ALIASES = {
    transmission: "transmission",
    tx: "transmission",
    distribution: "distribution",
    dx: "distribution",
    substation: "substation",
    sub: "substation",
    civil: "civil",
    industrial: "industrial",
    renewable: "renewable",
    renewables: "renewable",
    solar: "renewable",
    wind: "renewable",
};
const COMPANY_TYPE_ALIASES = {
    utility: "utility",
    utilities: "utility",
    epc: "epc",
    "e.p.c.": "epc",
    contractor: "contractor",
    "trade contractor": "contractor",
    "engineering firm": "engineering_firm",
    engineering_firm: "engineering_firm",
    engineering: "engineering_firm",
    "maintenance provider": "maintenance_provider",
    maintenance_provider: "maintenance_provider",
    maintenance: "maintenance_provider",
};
function standardizeProjectType(raw) {
    if (!raw)
        return null;
    const key = raw.trim().toLowerCase();
    const mapped = PROJECT_TYPE_ALIASES[key];
    if (mapped)
        return mapped;
    if (types_1.PROJECT_SUBTYPES.includes(key)) {
        return key;
    }
    return null;
}
function standardizeCompanyType(raw) {
    if (!raw)
        return null;
    const key = raw.trim().toLowerCase();
    const mapped = COMPANY_TYPE_ALIASES[key];
    if (mapped)
        return mapped;
    if (types_1.COMPANY_SUBTYPES.includes(key)) {
        return key;
    }
    return null;
}
function standardizeIndustry(raw) {
    if (!raw)
        return null;
    const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
    const aliases = {
        construction: "construction",
        energy: "energy",
        oil_gas: "energy",
        power: "energy",
        manufacturing: "manufacturing",
        transportation: "transportation",
        transport: "transportation",
        mining: "mining",
        utilities: "utilities",
        utility: "utilities",
        other: "other",
    };
    if (aliases[key])
        return aliases[key];
    if (types_1.INDUSTRIES.includes(key))
        return key;
    return null;
}
function standardizeScale(raw, cues) {
    if (raw) {
        const key = raw.trim().toLowerCase();
        if (key === "small" || key === "medium" || key === "large" || key === "mega") {
            return key;
        }
    }
    if (!cues)
        return null;
    const workers = cues.peakWorkers ?? cues.workerCount;
    if (cues.entityType === "company" && workers != null) {
        if (workers < 200)
            return "small";
        if (workers < 1000)
            return "medium";
        if (workers < 5000)
            return "large";
        return "mega";
    }
    if (cues.entityType === "project") {
        const value = cues.contractValueUsd;
        if (value != null) {
            if (value < 5000000)
                return "small";
            if (value < 50000000)
                return "medium";
            if (value < 250000000)
                return "large";
            return "mega";
        }
        if (workers != null) {
            if (workers < 50)
                return "small";
            if (workers < 250)
                return "medium";
            if (workers < 1000)
                return "large";
            return "mega";
        }
    }
    return null;
}
function normalizeMetrics(stripped) {
    const hours = stripped.hoursWorked;
    return {
        incidentRatePer200k: ratePer200k(stripped.totalIncidents, hours),
        recordableRatePer200k: ratePer200k(stripped.recordableIncidents, hours),
        lostTimeRatePer200k: ratePer200k(stripped.lostTimeIncidents, hours),
        nearMissRatePer200k: ratePer200k(stripped.nearMisses, hours),
        severityIndex: severityIndex({
            severityWeights: stripped.severityWeights,
            severitySum: stripped.severitySum,
            severityCount: stripped.severityCount,
        }),
        hecaHighEnergyRate: stripped.hecaTotalAssessments && stripped.hecaTotalAssessments > 0
            ? round(clamp((stripped.hecaHighEnergyEvents ?? 0) /
                stripped.hecaTotalAssessments, 0, 1), 4)
            : null,
        hecaControlsVerifiedRate: stripped.hecaTotalAssessments && stripped.hecaTotalAssessments > 0
            ? round(clamp((stripped.hecaControlsVerified ?? 0) /
                stripped.hecaTotalAssessments, 0, 1), 4)
            : null,
        hecaDistribution: standardizeHecaDistribution(stripped.hecaCategoryCounts),
        hoursBasis: types_1.HOURS_DENOMINATOR,
    };
}
