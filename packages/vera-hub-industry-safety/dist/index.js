"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriHubAnonymizationNormalizationEngine = exports.isCompanySubtype = exports.isProjectSubtype = exports.partitionByPlane = exports.assertSameScaleUnlessConsent = exports.assertSameCompanyTypeUnlessConsent = exports.assertCrossCompareConsent = exports.assertNoCrossPlaneTokenJoin = exports.assertSubtypeMatchesPlane = exports.assertSinglePlane = exports.PlaneIsolationError = exports.groupFactsByCohort = exports.shouldSuppress = exports.blindAggregate = exports.finiteOrNull = exports.round = exports.clamp = exports.normalizeMetrics = exports.standardizeScale = exports.standardizeIndustry = exports.standardizeCompanyType = exports.standardizeProjectType = exports.standardizeHecaDistribution = exports.standardizeHecaCategory = exports.severityIndex = exports.ratePer200k = exports.STRIPPED_FIELD_NAMES = exports.aggregateHazardKeywords = exports.stripIdentifiers = exports.assertTokenNotInPublicPayload = exports.isCompanyToken = exports.isProjectToken = exports.tokenizeEntityId = exports.tokenizeCompanyId = exports.tokenizeProjectId = void 0;
__exportStar(require("./types"), exports);
var tokenize_1 = require("./tokenize");
Object.defineProperty(exports, "tokenizeProjectId", { enumerable: true, get: function () { return tokenize_1.tokenizeProjectId; } });
Object.defineProperty(exports, "tokenizeCompanyId", { enumerable: true, get: function () { return tokenize_1.tokenizeCompanyId; } });
Object.defineProperty(exports, "tokenizeEntityId", { enumerable: true, get: function () { return tokenize_1.tokenizeEntityId; } });
Object.defineProperty(exports, "isProjectToken", { enumerable: true, get: function () { return tokenize_1.isProjectToken; } });
Object.defineProperty(exports, "isCompanyToken", { enumerable: true, get: function () { return tokenize_1.isCompanyToken; } });
Object.defineProperty(exports, "assertTokenNotInPublicPayload", { enumerable: true, get: function () { return tokenize_1.assertTokenNotInPublicPayload; } });
var strip_1 = require("./strip");
Object.defineProperty(exports, "stripIdentifiers", { enumerable: true, get: function () { return strip_1.stripIdentifiers; } });
Object.defineProperty(exports, "aggregateHazardKeywords", { enumerable: true, get: function () { return strip_1.aggregateHazardKeywords; } });
Object.defineProperty(exports, "STRIPPED_FIELD_NAMES", { enumerable: true, get: function () { return strip_1.STRIPPED_FIELD_NAMES; } });
var normalize_1 = require("./normalize");
Object.defineProperty(exports, "ratePer200k", { enumerable: true, get: function () { return normalize_1.ratePer200k; } });
Object.defineProperty(exports, "severityIndex", { enumerable: true, get: function () { return normalize_1.severityIndex; } });
Object.defineProperty(exports, "standardizeHecaCategory", { enumerable: true, get: function () { return normalize_1.standardizeHecaCategory; } });
Object.defineProperty(exports, "standardizeHecaDistribution", { enumerable: true, get: function () { return normalize_1.standardizeHecaDistribution; } });
Object.defineProperty(exports, "standardizeProjectType", { enumerable: true, get: function () { return normalize_1.standardizeProjectType; } });
Object.defineProperty(exports, "standardizeCompanyType", { enumerable: true, get: function () { return normalize_1.standardizeCompanyType; } });
Object.defineProperty(exports, "standardizeIndustry", { enumerable: true, get: function () { return normalize_1.standardizeIndustry; } });
Object.defineProperty(exports, "standardizeScale", { enumerable: true, get: function () { return normalize_1.standardizeScale; } });
Object.defineProperty(exports, "normalizeMetrics", { enumerable: true, get: function () { return normalize_1.normalizeMetrics; } });
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return normalize_1.clamp; } });
Object.defineProperty(exports, "round", { enumerable: true, get: function () { return normalize_1.round; } });
Object.defineProperty(exports, "finiteOrNull", { enumerable: true, get: function () { return normalize_1.finiteOrNull; } });
var aggregate_1 = require("./aggregate");
Object.defineProperty(exports, "blindAggregate", { enumerable: true, get: function () { return aggregate_1.blindAggregate; } });
Object.defineProperty(exports, "shouldSuppress", { enumerable: true, get: function () { return aggregate_1.shouldSuppress; } });
Object.defineProperty(exports, "groupFactsByCohort", { enumerable: true, get: function () { return aggregate_1.groupFactsByCohort; } });
var isolation_1 = require("./isolation");
Object.defineProperty(exports, "PlaneIsolationError", { enumerable: true, get: function () { return isolation_1.PlaneIsolationError; } });
Object.defineProperty(exports, "assertSinglePlane", { enumerable: true, get: function () { return isolation_1.assertSinglePlane; } });
Object.defineProperty(exports, "assertSubtypeMatchesPlane", { enumerable: true, get: function () { return isolation_1.assertSubtypeMatchesPlane; } });
Object.defineProperty(exports, "assertNoCrossPlaneTokenJoin", { enumerable: true, get: function () { return isolation_1.assertNoCrossPlaneTokenJoin; } });
Object.defineProperty(exports, "assertCrossCompareConsent", { enumerable: true, get: function () { return isolation_1.assertCrossCompareConsent; } });
Object.defineProperty(exports, "assertSameCompanyTypeUnlessConsent", { enumerable: true, get: function () { return isolation_1.assertSameCompanyTypeUnlessConsent; } });
Object.defineProperty(exports, "assertSameScaleUnlessConsent", { enumerable: true, get: function () { return isolation_1.assertSameScaleUnlessConsent; } });
Object.defineProperty(exports, "partitionByPlane", { enumerable: true, get: function () { return isolation_1.partitionByPlane; } });
Object.defineProperty(exports, "isProjectSubtype", { enumerable: true, get: function () { return isolation_1.isProjectSubtype; } });
Object.defineProperty(exports, "isCompanySubtype", { enumerable: true, get: function () { return isolation_1.isCompanySubtype; } });
var engine_1 = require("./engine");
Object.defineProperty(exports, "VeriHubAnonymizationNormalizationEngine", { enumerable: true, get: function () { return engine_1.VeriHubAnonymizationNormalizationEngine; } });
