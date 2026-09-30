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
exports.VeriHubIndustryTrendEngine = exports.forecastPredictiveRisk = exports.scoreWorkforceStability = exports.clusterRootCauses = exports.modelSeasonalRisk = exports.analyzeLeadingCorrelation = exports.analyzeTrifLtifTrend = exports.analyzeHecaTrend = exports.filterUsable = exports.assertSeriesPlane = exports.assertSinglePlaneFacts = exports.fromBlindAggregates = exports.correlationStrength = exports.directionFromSlope = exports.finiteNumbers = exports.round = exports.clamp = exports.pearson = exports.linearSlope = exports.stddev = exports.mean = exports.horizonSteps = exports.nextPeriod = exports.expandTrailingPeriods = exports.monthBucket = exports.sortPeriods = exports.periodSortKey = exports.parsePeriod = void 0;
__exportStar(require("./types"), exports);
var periods_1 = require("./periods");
Object.defineProperty(exports, "parsePeriod", { enumerable: true, get: function () { return periods_1.parsePeriod; } });
Object.defineProperty(exports, "periodSortKey", { enumerable: true, get: function () { return periods_1.periodSortKey; } });
Object.defineProperty(exports, "sortPeriods", { enumerable: true, get: function () { return periods_1.sortPeriods; } });
Object.defineProperty(exports, "monthBucket", { enumerable: true, get: function () { return periods_1.monthBucket; } });
Object.defineProperty(exports, "expandTrailingPeriods", { enumerable: true, get: function () { return periods_1.expandTrailingPeriods; } });
Object.defineProperty(exports, "nextPeriod", { enumerable: true, get: function () { return periods_1.nextPeriod; } });
Object.defineProperty(exports, "horizonSteps", { enumerable: true, get: function () { return periods_1.horizonSteps; } });
var stats_1 = require("./stats");
Object.defineProperty(exports, "mean", { enumerable: true, get: function () { return stats_1.mean; } });
Object.defineProperty(exports, "stddev", { enumerable: true, get: function () { return stats_1.stddev; } });
Object.defineProperty(exports, "linearSlope", { enumerable: true, get: function () { return stats_1.linearSlope; } });
Object.defineProperty(exports, "pearson", { enumerable: true, get: function () { return stats_1.pearson; } });
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return stats_1.clamp; } });
Object.defineProperty(exports, "round", { enumerable: true, get: function () { return stats_1.round; } });
Object.defineProperty(exports, "finiteNumbers", { enumerable: true, get: function () { return stats_1.finiteNumbers; } });
Object.defineProperty(exports, "directionFromSlope", { enumerable: true, get: function () { return stats_1.directionFromSlope; } });
Object.defineProperty(exports, "correlationStrength", { enumerable: true, get: function () { return stats_1.correlationStrength; } });
var series_1 = require("./series");
Object.defineProperty(exports, "fromBlindAggregates", { enumerable: true, get: function () { return series_1.fromBlindAggregates; } });
Object.defineProperty(exports, "assertSinglePlaneFacts", { enumerable: true, get: function () { return series_1.assertSinglePlaneFacts; } });
Object.defineProperty(exports, "assertSeriesPlane", { enumerable: true, get: function () { return series_1.assertSeriesPlane; } });
Object.defineProperty(exports, "filterUsable", { enumerable: true, get: function () { return series_1.filterUsable; } });
var heca_1 = require("./heca");
Object.defineProperty(exports, "analyzeHecaTrend", { enumerable: true, get: function () { return heca_1.analyzeHecaTrend; } });
var trif_ltif_1 = require("./trif-ltif");
Object.defineProperty(exports, "analyzeTrifLtifTrend", { enumerable: true, get: function () { return trif_ltif_1.analyzeTrifLtifTrend; } });
var correlation_1 = require("./correlation");
Object.defineProperty(exports, "analyzeLeadingCorrelation", { enumerable: true, get: function () { return correlation_1.analyzeLeadingCorrelation; } });
var seasonal_1 = require("./seasonal");
Object.defineProperty(exports, "modelSeasonalRisk", { enumerable: true, get: function () { return seasonal_1.modelSeasonalRisk; } });
var root_cause_1 = require("./root-cause");
Object.defineProperty(exports, "clusterRootCauses", { enumerable: true, get: function () { return root_cause_1.clusterRootCauses; } });
var workforce_1 = require("./workforce");
Object.defineProperty(exports, "scoreWorkforceStability", { enumerable: true, get: function () { return workforce_1.scoreWorkforceStability; } });
var forecast_1 = require("./forecast");
Object.defineProperty(exports, "forecastPredictiveRisk", { enumerable: true, get: function () { return forecast_1.forecastPredictiveRisk; } });
var engine_1 = require("./engine");
Object.defineProperty(exports, "VeriHubIndustryTrendEngine", { enumerable: true, get: function () { return engine_1.VeriHubIndustryTrendEngine; } });
