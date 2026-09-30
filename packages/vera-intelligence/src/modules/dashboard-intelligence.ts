import type { CompanyIntelInput, ProjectIntelInput } from "../types";
import { AutoSummarizationEngine } from "../engines/auto-engines";
import { analyzeCompany } from "./company-intelligence";
import { analyzeProject } from "./project-intelligence";
import { RiskEngine } from "../engines/risk-engine";
import { PredictiveEngine } from "../engines/predictive-engine";
import { RecommendationEngine } from "../engines/recommendation-engine";
import type { Anomaly } from "../types";

export type DashboardIntelInput = {
  company?: CompanyIntelInput;
  projects?: ProjectIntelInput[];
  expiring30?: number;
  expiring60?: number;
  anomalies?: Anomaly[];
};

export function buildDashboardIntel(
  input: DashboardIntelInput,
  engines: {
    risk: RiskEngine;
    predictive: PredictiveEngine;
    summarize: AutoSummarizationEngine;
    recommend: RecommendationEngine;
  }
) {
  const company = input.company
    ? analyzeCompany(input.company, {
        predictive: engines.predictive,
        risk: engines.risk,
        summarize: engines.summarize,
        recommend: engines.recommend,
      })
    : undefined;

  const projects = (input.projects ?? []).map((p) =>
    analyzeProject(p, {
      predictive: engines.predictive,
      risk: engines.risk,
      summarize: engines.summarize,
      recommend: engines.recommend,
    })
  );

  const predictiveCompliance = engines.predictive.forecastFailure(
    "dashboard",
    "Org-wide compliance slip",
    company ? (100 - (input.company!.complianceRate ?? 100)) / 100 : 0.2
  );

  const widgets = {
    predictiveCompliance: {
      probability: predictiveCompliance.probability,
      label: predictiveCompliance.label,
    },
    predictiveExpiry: {
      expired30: input.expiring30 ?? 0,
      expired60: input.expiring60 ?? 0,
    },
    predictiveReadiness: {
      average: projects.length
        ? projects.reduce((s, p) => s + p.readiness.score, 0) / projects.length
        : company?.complianceScore.score ?? 0,
    },
    predictiveRisk: {
      level: company?.complianceScore.level ?? "medium",
      score: company ? 100 - company.complianceScore.score : 50,
    },
    anomalies: input.anomalies ?? [],
    recommendations: engines.recommend.getAll().slice(0, 8),
    workforceForecast: projects.map((p) => p.predictions.workerShortage),
    equipmentForecast: projects.map((p) => p.staffingGaps.equipment),
  };

  return {
    widgets,
    summary: engines.summarize.summarize("Dashboard intelligence", [
      `Compliance forecast ${(predictiveCompliance.probability * 100).toFixed(0)}% risk`,
      `${widgets.anomalies.length} anomalies`,
      `${widgets.recommendations.length} recommendations`,
    ]),
  };
}
