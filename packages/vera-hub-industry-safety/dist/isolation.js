"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaneIsolationError = void 0;
exports.assertSinglePlane = assertSinglePlane;
exports.assertSubtypeMatchesPlane = assertSubtypeMatchesPlane;
exports.assertNoCrossPlaneTokenJoin = assertNoCrossPlaneTokenJoin;
exports.assertCrossCompareConsent = assertCrossCompareConsent;
exports.assertSameCompanyTypeUnlessConsent = assertSameCompanyTypeUnlessConsent;
exports.assertSameScaleUnlessConsent = assertSameScaleUnlessConsent;
exports.isProjectSubtype = isProjectSubtype;
exports.isCompanySubtype = isCompanySubtype;
exports.partitionByPlane = partitionByPlane;
const types_1 = require("./types");
class PlaneIsolationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "PlaneIsolationError";
        this.code = code;
    }
}
exports.PlaneIsolationError = PlaneIsolationError;
/**
 * Cross-category isolation: project and company planes never mix
 * unless an explicit cross-compare consent path is used.
 */
function assertSinglePlane(entityType, filters) {
    if (filters.entityType && filters.entityType !== entityType) {
        throw new PlaneIsolationError("VISI_MIXED_PLANE", `Endpoint plane is ${entityType}; received entityType=${filters.entityType}`);
    }
    if (entityType === "project") {
        if (filters.companyType || filters.companyId) {
            throw new PlaneIsolationError("VISI_MIXED_PLANE", "Company-level filters are not allowed on Project-Scale APIs");
        }
    }
    if (entityType === "company") {
        if (filters.projectType || filters.projectId) {
            throw new PlaneIsolationError("VISI_MIXED_PLANE", "Project-level filters are not allowed on Company-Scale APIs");
        }
    }
}
function assertSubtypeMatchesPlane(entityType, subtype) {
    if (entityType === "project") {
        if (!types_1.PROJECT_SUBTYPES.includes(subtype)) {
            throw new PlaneIsolationError("VISI_PLANE_MISMATCH", `Subtype "${subtype}" is not a valid project type`);
        }
        return;
    }
    if (!types_1.COMPANY_SUBTYPES.includes(subtype)) {
        throw new PlaneIsolationError("VISI_PLANE_MISMATCH", `Subtype "${subtype}" is not a valid company type`);
    }
}
function assertNoCrossPlaneTokenJoin(projectTokens, companyTokens) {
    // Tokens use different prefixes/salts; still forbid any shared string equality checks as joins
    const companySet = new Set(companyTokens);
    for (const t of projectTokens) {
        if (companySet.has(t)) {
            throw new PlaneIsolationError("VISI_MIXED_PLANE", "Cross-plane token join is forbidden");
        }
    }
}
function assertCrossCompareConsent(input) {
    if (!input.explicitConsent) {
        throw new PlaneIsolationError("VISI_CROSS_DENIED", "Cross-category comparison requires explicitConsent=true");
    }
    if (input.hasPermission === false) {
        throw new PlaneIsolationError("VISI_CROSS_DENIED", "Missing HUB_INDUSTRY_SAFETY_CROSS_COMPARE permission");
    }
}
/**
 * Within the company plane: do not mix company types (e.g. utility vs contractor)
 * unless the user explicitly opts into cross-category comparison.
 */
function assertSameCompanyTypeUnlessConsent(input) {
    if (input.homeType === input.benchmarkType)
        return;
    if (input.explicitCrossCategory)
        return;
    throw new PlaneIsolationError("VISI_CROSS_TYPE", `Company type "${input.homeType}" cannot benchmark against "${input.benchmarkType}" without explicit cross-category comparison`);
}
/**
 * Do not mix mega with small (etc.) unless the user explicitly opts into cross-scale.
 */
function assertSameScaleUnlessConsent(input) {
    if (input.homeScale === input.benchmarkScale)
        return;
    if (input.explicitCrossScale)
        return;
    throw new PlaneIsolationError("VISI_CROSS_SCALE", `Scale "${input.homeScale}" cannot benchmark against "${input.benchmarkScale}" without explicit cross-scale comparison`);
}
function isProjectSubtype(value) {
    return types_1.PROJECT_SUBTYPES.includes(value);
}
function isCompanySubtype(value) {
    return types_1.COMPANY_SUBTYPES.includes(value);
}
/**
 * Partition facts so aggregators cannot accidentally union planes.
 */
function partitionByPlane(rows) {
    return {
        project: rows.filter((r) => r.plane === "project"),
        company: rows.filter((r) => r.plane === "company"),
    };
}
