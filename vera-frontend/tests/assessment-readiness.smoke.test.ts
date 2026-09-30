import { describe, expect, it } from "vitest";
import {
  assessmentHistoryToTrend,
  assessmentStatusTone,
  buildAssessmentScoreTrend,
  formatAssessmentEvaluatedAt,
  isSpceRequirementGap,
  parseSmartGapAssessmentResult,
  parseSpceAssessmentResult,
  smartGapGapsFromResult,
  smartGapRecommendationsFromResult,
  spceCategoryScores,
  spceGapSummary,
  spceGapsFromResult,
  spceRecommendationsFromResult,
} from "@/lib/assessment-readiness-display";
import type {
  SgaeAssessmentResult,
  SpceAssessmentResult,
} from "@/lib/assessment-engines-types";

const spceFixture: SpceAssessmentResult = {
  companyId: "C-100",
  overallScore: 77,
  overallStatus: "ConditionallyAccepted",
  requirementResults: [
    {
      requirementId: "SP-REQ-1",
      category: "Fall Protection",
      type: "Policy",
      score: 77,
      status: "ConditionallyAccepted",
      existenceStatus: "Present",
      currencyStatus: "Current",
      structureStatus: "Partial",
      legislationStatus: "NotReferenced",
      trainingAlignmentStatus: "Aligned",
      fieldAlignmentStatus: "Aligned",
      submissionIds: ["SUB-1"],
    },
    {
      requirementId: "SP-REQ-2",
      category: "WHMIS",
      type: "Procedure",
      score: 100,
      status: "Accepted",
      existenceStatus: "Present",
      currencyStatus: "Current",
      structureStatus: "Complete",
      legislationStatus: "Referenced",
      trainingAlignmentStatus: "Aligned",
      fieldAlignmentStatus: "Aligned",
      submissionIds: ["SUB-2"],
    },
  ],
  correctiveActions: [
    {
      id: "CAR-1",
      requirementId: "SP-REQ-1",
      companyId: "C-100",
      category: "Policy",
      description: "Add missing policy sections and legislative references.",
      priority: "Medium",
      recommendedDueDays: 30,
      blockingForPrequalification: false,
    },
  ],
};

const sgaFixture: SgaeAssessmentResult = {
  companyId: "C-100",
  hiringClientId: "HC-1",
  overallGapScore: 62,
  overallStatus: "NotAcceptable",
  categoryScores: {
    Policy: 77,
    Procedure: 60,
    Training: 33,
    FieldPractice: 80,
    Records: 55,
  },
  categoryNotes: {
    Training: "Worker training average below hiring client threshold.",
  },
  legislativeCompliance: {
    assessment: "Weak",
    notes: "Legislative references incomplete in submitted policies.",
  },
  hiringClientCompliance: {
    assessment: "Moderate",
    notes: "Most program elements present; training gaps remain.",
  },
  correctiveActionRoadmap: [
    {
      id: "ROAD-1",
      sourceEngine: "SPCE",
      category: "Policy",
      description: "Close SPCE policy gaps before onboarding.",
      priority: "High",
      recommendedDueDays: 14,
      blockingForOnboarding: true,
    },
    {
      id: "ROAD-2",
      sourceEngine: "TAE",
      category: "Training",
      description: "Refresh expired worker certifications.",
      priority: "Medium",
      recommendedDueDays: 30,
      blockingForOnboarding: false,
    },
  ],
};

describe("assessment readiness display helpers", () => {
  it("maps assessment statuses to UI tones", () => {
    expect(assessmentStatusTone("Accepted")).toBe("success");
    expect(assessmentStatusTone("ConditionallyAccepted")).toBe("warning");
    expect(assessmentStatusTone("NotAcceptable")).toBe("danger");
    expect(assessmentStatusTone("Weak")).toBe("danger");
  });

  it("formats evaluated timestamps", () => {
    expect(formatAssessmentEvaluatedAt("2026-06-01T18:30:00.000Z")).toBeTruthy();
    expect(formatAssessmentEvaluatedAt("invalid")).toBeNull();
  });

  it("extracts SPCE gaps, category scores, and recommendations", () => {
    expect(isSpceRequirementGap(spceFixture.requirementResults[0])).toBe(true);
    expect(isSpceRequirementGap(spceFixture.requirementResults[1])).toBe(false);

    const gaps = spceGapsFromResult(spceFixture);
    expect(gaps).toHaveLength(1);
    expect(spceGapSummary(gaps[0])).toContain("legislation");

    const categories = spceCategoryScores(spceFixture);
    expect(categories).toHaveLength(2);
    expect(categories[0].category).toBe("Fall Protection");

    const recs = spceRecommendationsFromResult(spceFixture);
    expect(recs[0].description).toContain("policy sections");
  });

  it("extracts Smart Gap category gaps and roadmap recommendations", () => {
    const gaps = smartGapGapsFromResult(sgaFixture);
    expect(gaps.some((g) => g.label === "Training")).toBe(true);
    expect(gaps.some((g) => g.label === "Legislative compliance")).toBe(true);

    const recs = smartGapRecommendationsFromResult(sgaFixture);
    expect(recs[0].priority).toBe("High");
    expect(recs[0].blockingForOnboarding).toBe(true);
  });

  it("parses assessment result payloads safely", () => {
    expect(parseSpceAssessmentResult(spceFixture)?.overallScore).toBe(77);
    expect(parseSpceAssessmentResult(null)).toBeNull();
    expect(parseSmartGapAssessmentResult(sgaFixture)?.overallGapScore).toBe(62);
    expect(parseSmartGapAssessmentResult({ overallStatus: "x" })).toBeNull();
  });

  it("builds SPCE score trend from assessment history", () => {
    const points = assessmentHistoryToTrend([
      { evaluatedAt: "2026-05-01T10:00:00.000Z", overallScore: 70 },
      { evaluatedAt: "2026-06-01T10:00:00.000Z", overallScore: 77 },
    ]);
    const trend = buildAssessmentScoreTrend(points);
    expect(trend.points).toHaveLength(2);
    expect(trend.delta).toBe(7);
    expect(trend.direction).toBe("up");
  });
});
