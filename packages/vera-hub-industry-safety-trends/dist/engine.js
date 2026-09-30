"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriHubIndustryTrendEngine = void 0;
const hub_industry_safety_1 = require("@vera/hub-industry-safety");
const correlation_1 = require("./correlation");
const forecast_1 = require("./forecast");
const heca_1 = require("./heca");
const root_cause_1 = require("./root-cause");
const seasonal_1 = require("./seasonal");
const series_1 = require("./series");
const trif_ltif_1 = require("./trif-ltif");
const workforce_1 = require("./workforce");
const DEFAULT_SEASONAL = [
    "trif",
    "ltif",
    "heca_high_energy",
    "leading_composite",
    "incident_per_200k",
];
/**
 * VeriHub Industry Trend Engine
 *
 * Operates only on normalized, anonymized series (no tokens / PII).
 * Project and company planes stay isolated unless explicit cross-compare.
 */
class VeriHubIndustryTrendEngine {
    constructor() {
        this.minSample = hub_industry_safety_1.MIN_SAMPLE;
    }
    fromBlindAggregates(aggregates) {
        return (0, series_1.fromBlindAggregates)(aggregates);
    }
    /**
     * Full trend report for a single plane cohort scope.
     */
    analyze(input) {
        const { scope, series } = input;
        (0, series_1.assertSeriesPlane)(series, scope, {
            explicitCrossCompare: input.explicitCrossCompare,
        });
        const plane = scope.entityType;
        const seasonalMetrics = input.seasonalMetrics ?? DEFAULT_SEASONAL;
        const horizon = input.forecastHorizon ?? "3m";
        return {
            plane,
            scope,
            minSample: hub_industry_safety_1.MIN_SAMPLE,
            heca: (0, heca_1.analyzeHecaTrend)(plane, scope, series),
            trifLtif: (0, trif_ltif_1.analyzeTrifLtifTrend)(plane, scope, series),
            leadingCorrelation: (0, correlation_1.analyzeLeadingCorrelation)(plane, scope, series),
            seasonal: seasonalMetrics.map((m) => (0, seasonal_1.modelSeasonalRisk)(plane, scope, series, m)),
            rootCause: (0, root_cause_1.clusterRootCauses)(plane, scope, series),
            workforce: (0, workforce_1.scoreWorkforceStability)(plane, scope, series),
            predictive: (0, forecast_1.forecastPredictiveRisk)(plane, scope, series, horizon),
        };
    }
    analyzeHeca(input) {
        (0, series_1.assertSeriesPlane)(input.series, input.scope);
        return (0, heca_1.analyzeHecaTrend)(input.scope.entityType, input.scope, input.series);
    }
    analyzeTrifLtif(input) {
        (0, series_1.assertSeriesPlane)(input.series, input.scope);
        return (0, trif_ltif_1.analyzeTrifLtifTrend)(input.scope.entityType, input.scope, input.series);
    }
    correlateLeading(input) {
        (0, series_1.assertSeriesPlane)(input.series, input.scope);
        return (0, correlation_1.analyzeLeadingCorrelation)(input.scope.entityType, input.scope, input.series);
    }
    modelSeasonal(input, metric) {
        (0, series_1.assertSeriesPlane)(input.series, input.scope);
        const metrics = metric
            ? [metric]
            : input.seasonalMetrics ?? DEFAULT_SEASONAL;
        return metrics.map((m) => (0, seasonal_1.modelSeasonalRisk)(input.scope.entityType, input.scope, input.series, m));
    }
    clusterRootCauses(input) {
        (0, series_1.assertSeriesPlane)(input.series, input.scope);
        return (0, root_cause_1.clusterRootCauses)(input.scope.entityType, input.scope, input.series);
    }
    scoreWorkforce(input) {
        (0, series_1.assertSeriesPlane)(input.series, input.scope);
        return (0, workforce_1.scoreWorkforceStability)(input.scope.entityType, input.scope, input.series);
    }
    forecastRisk(input) {
        (0, series_1.assertSeriesPlane)(input.series, input.scope);
        return (0, forecast_1.forecastPredictiveRisk)(input.scope.entityType, input.scope, input.series, input.forecastHorizon ?? "3m");
    }
    /**
     * Dual-plane report. Requires explicit consent; never blends metrics.
     */
    crossCompare(args) {
        (0, hub_industry_safety_1.assertCrossCompareConsent)({
            explicitConsent: args.explicitConsent,
            hasPermission: args.permissionGranted,
        });
        if (args.project.scope.entityType !== "project") {
            throw new hub_industry_safety_1.PlaneIsolationError("VISI_PLANE_MISMATCH", "crossCompare.project.scope.entityType must be project");
        }
        if (args.company.scope.entityType !== "company") {
            throw new hub_industry_safety_1.PlaneIsolationError("VISI_PLANE_MISMATCH", "crossCompare.company.scope.entityType must be company");
        }
        return {
            project: this.analyze({
                ...args.project,
                explicitCrossCompare: true,
            }),
            company: this.analyze({
                ...args.company,
                explicitCrossCompare: true,
            }),
        };
    }
    /** Public payload helper — strip any accidental token-like keys */
    toPublicReport(report) {
        const json = JSON.stringify(report);
        if (/\b(proj_|co_)[a-f0-9]{8,}/i.test(json)) {
            throw new hub_industry_safety_1.PlaneIsolationError("VISI_CROSS_DENIED", "Trend report must not contain entity tokens");
        }
        return report;
    }
    partitionByPlane(seriesByPlane) {
        return {
            project: seriesByPlane.project ?? [],
            company: seriesByPlane.company ?? [],
        };
    }
}
exports.VeriHubIndustryTrendEngine = VeriHubIndustryTrendEngine;
