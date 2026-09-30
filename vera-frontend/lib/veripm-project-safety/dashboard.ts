/**
 * Assemble VeriPM Project Safety Dashboard payload.
 */

import {
  buildCorrectiveAging,
  buildFocusAuditTrends,
  buildIncidentTrends,
  buildIndustryComparison,
  buildIntelligentInspectionTrends,
  buildLagging,
  buildLeading,
  buildRiskProfile,
  periodOf,
  resolveProject,
} from "./analytics";
import { getRevision, listProjects } from "./store";
import { HOURS_DENOMINATOR } from "./types";
import type {
  ProjectSafetyDashboard,
  ProjectSafetySelectors,
} from "./types";

export function buildProjectSafetyDashboard(
  partial?: Partial<ProjectSafetySelectors>,
): ProjectSafetyDashboard {
  const { project, selectors } = resolveProject(partial ?? {});
  const counts = periodOf(project, selectors.period);
  if (!counts) {
    throw new Error("No period data for project");
  }

  const leading = buildLeading(counts);
  const lagging = buildLagging(counts);
  const correctiveActionAging = buildCorrectiveAging(counts);
  const riskProfile = buildRiskProfile(leading, lagging, correctiveActionAging);
  const industryComparison = buildIndustryComparison({
    project,
    period: selectors.period,
    leading,
    lagging,
    crossCategoryOptIn: selectors.crossCategoryOptIn,
  });

  return {
    generatedAt: new Date().toISOString(),
    revision: getRevision(),
    selectors: {
      ...selectors,
      projectToken: project.token,
      projectType: project.projectType,
      region: project.region,
      scale: project.scale,
    },
    catalog: listProjects().map((p) => ({
      token: p.token,
      label: p.label,
      projectType: p.projectType,
      region: p.region,
      scale: p.scale,
    })),
    leading,
    lagging,
    incidentTrends: buildIncidentTrends(project),
    focusAuditTrends: buildFocusAuditTrends(project),
    intelligentInspectionTrends: buildIntelligentInspectionTrends(project),
    correctiveActionAging,
    riskProfile,
    industryComparison,
    rules: {
      hoursDenominator: HOURS_DENOMINATOR,
      projectLevelOnly: !selectors.crossCategoryOptIn,
      crossCategoryOptIn: selectors.crossCategoryOptIn,
      projectIdsTokenized: true,
      metricsNormalizedPer200k: true,
    },
  };
}
