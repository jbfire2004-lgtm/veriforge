import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SpceAssessmentDetail } from "@/components/core/SpceAssessmentDetail";
import type { SpceAssessmentResult } from "@/lib/assessment-engines-types";

const spceFixture: SpceAssessmentResult = {
  companyId: "C-1",
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
  ],
  correctiveActions: [
    {
      id: "CA-1",
      requirementId: "SP-REQ-1",
      priority: "High",
      description: "Update fall protection policy references.",
      recommendedDueDays: 14,
      blockingForPrequalification: true,
    },
  ],
};

describe("SpceAssessmentDetail", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders score, dimensions, gaps, and recommendations", () => {
    render(
      <SpceAssessmentDetail
        result={spceFixture}
        evaluatedAt="2026-06-01T12:00:00.000Z"
        trend={[
          { evaluatedAt: "2026-05-01T12:00:00.000Z", score: 70 },
          { evaluatedAt: "2026-06-01T12:00:00.000Z", score: 77 },
        ]}
      />,
    );
    expect(screen.getByTestId("spce-assessment-detail")).toBeInTheDocument();
    expect(screen.getByText("77/100")).toBeInTheDocument();
    expect(screen.getByText("Key dimensions")).toBeInTheDocument();
    expect(screen.getByText("Fall Protection")).toBeInTheDocument();
    expect(screen.getByText(/Update fall protection policy/)).toBeInTheDocument();
    expect(screen.getByTestId("assessment-score-trend")).toBeInTheDocument();
  });
});
