"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaneIsolationError = exports.VeriHubAnonymizationNormalizationEngine = void 0;
const aggregate_1 = require("./aggregate");
const isolation_1 = require("./isolation");
Object.defineProperty(exports, "PlaneIsolationError", { enumerable: true, get: function () { return isolation_1.PlaneIsolationError; } });
const normalize_1 = require("./normalize");
const strip_1 = require("./strip");
const tokenize_1 = require("./tokenize");
const types_1 = require("./types");
/**
 * VeriHub Anonymization & Normalization Engine
 *
 * Pipeline: Strip → Tokenize → Normalize → (Blind Aggregate)
 * Enforces min sample, plane isolation, and token non-leakage.
 */
class VeriHubAnonymizationNormalizationEngine {
    constructor() {
        this.minSample = types_1.MIN_SAMPLE;
    }
    /** Full privacy pipeline for a single raw record */
    ingest(raw) {
        try {
            if (raw.entityType !== "project" && raw.entityType !== "company") {
                return { ok: false, error: "entityType must be project or company" };
            }
            const stripped = (0, strip_1.stripIdentifiers)(raw);
            const fact = this.normalizeStripped(stripped);
            if (!fact.ok)
                return fact;
            (0, tokenize_1.assertTokenNotInPublicPayload)({
                industry: fact.fact.industry,
                subtype: fact.fact.subtype,
                scale: fact.fact.scale,
                metrics: fact.fact.metrics,
            });
            return fact;
        }
        catch (e) {
            return {
                ok: false,
                error: e instanceof Error ? e.message : "ingest failed",
            };
        }
    }
    ingestMany(raws) {
        const facts = [];
        const errors = [];
        raws.forEach((raw, index) => {
            const result = this.ingest(raw);
            if (result.ok)
                facts.push(result.fact);
            else
                errors.push({ index, error: result.error });
        });
        return { facts, errors };
    }
    normalizeStripped(stripped) {
        const plane = stripped.entityType;
        const id = plane === "project" ? stripped.projectId : stripped.companyId;
        if (id == null) {
            return {
                ok: false,
                error: `${plane}Id is required for tokenization`,
            };
        }
        const industry = (0, normalize_1.standardizeIndustry)(stripped.industry);
        if (!industry) {
            return { ok: false, error: "Unable to standardize industry" };
        }
        const subtype = plane === "project"
            ? (0, normalize_1.standardizeProjectType)(stripped.projectType ?? stripped.subtype)
            : (0, normalize_1.standardizeCompanyType)(stripped.companyType ?? stripped.subtype);
        if (!subtype) {
            return {
                ok: false,
                error: `Unable to standardize ${plane} type/subtype`,
            };
        }
        try {
            (0, isolation_1.assertSubtypeMatchesPlane)(plane, subtype);
        }
        catch (e) {
            return {
                ok: false,
                error: e instanceof Error ? e.message : "plane mismatch",
            };
        }
        const scale = (0, normalize_1.standardizeScale)(stripped.scale, {
            workerCount: stripped.workerCount,
            peakWorkers: stripped.peakWorkers,
            contractValueUsd: stripped.contractValueUsd,
            entityType: plane,
        });
        if (!scale) {
            return { ok: false, error: "Unable to standardize scale" };
        }
        if (!stripped.period) {
            return { ok: false, error: "period is required" };
        }
        const token = (0, tokenize_1.tokenizeEntityId)(plane, id);
        const metrics = (0, normalize_1.normalizeMetrics)(stripped);
        return {
            ok: true,
            fact: {
                plane,
                token,
                industry,
                subtype,
                scale,
                period: stripped.period,
                regionBand: stripped.regionCode,
                metrics,
            },
        };
    }
    /** Strip stage only */
    strip(raw) {
        return (0, strip_1.stripIdentifiers)(raw);
    }
    tokenizeProject(id) {
        return (0, tokenize_1.tokenizeProjectId)(id);
    }
    tokenizeCompany(id) {
        return (0, tokenize_1.tokenizeCompanyId)(id);
    }
    aggregateCohort(facts, key) {
        // Enforce isolation: only same-plane facts
        const { project, company } = (0, isolation_1.partitionByPlane)(facts);
        const planeFacts = key.entityType === "project" ? project : company;
        (0, isolation_1.assertNoCrossPlaneTokenJoin)(project.map((f) => f.token), company.map((f) => f.token));
        return (0, aggregate_1.blindAggregate)(planeFacts, key, {
            minSample: this.minSample,
            hideExactCountWhenSuppressed: true,
        });
    }
    aggregateAll(facts) {
        const groups = (0, aggregate_1.groupFactsByCohort)(facts);
        const results = [];
        for (const [keyStr, group] of groups) {
            const [entityType, industry, subtype, scale, period] = keyStr.split("|");
            results.push(this.aggregateCohort(group, {
                entityType: entityType,
                industry: industry,
                subtype: subtype,
                scale: scale,
                period,
            }));
        }
        return results;
    }
    enforcePlaneFilters(plane, filters) {
        (0, isolation_1.assertSinglePlane)(plane, filters);
    }
    enforceCrossCompare(input) {
        (0, isolation_1.assertCrossCompareConsent)(input);
    }
    isSuppressed(entityCount) {
        return (0, aggregate_1.shouldSuppress)(entityCount, this.minSample);
    }
    /** Public response sanitizer — strips tokens if somehow present */
    toPublicAggregate(result) {
        const publicPayload = {
            cohort: result.key,
            suppressed: result.suppressed,
            entityCount: result.entityCount,
            metrics: result.metrics,
        };
        (0, tokenize_1.assertTokenNotInPublicPayload)(publicPayload);
        return publicPayload;
    }
}
exports.VeriHubAnonymizationNormalizationEngine = VeriHubAnonymizationNormalizationEngine;
