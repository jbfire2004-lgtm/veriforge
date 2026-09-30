import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadinessStateBadge } from "./CoreReadinessDashboard";
import type { CoreReadinessSummary } from "@/lib/core/vera-core-platform";

const fixture: CoreReadinessSummary = {
  generatedAt: "2026-06-01T12:00:00.000Z",
  companyId: 1,
  dimensions: [
    {
      key: "tae",
      label: "Training Assessment (TAE)",
      score: 88,
      state: "OK",
      metrics: { evaluated: 10, passing: 8, missing: 2 },
      evaluatedAt: "2026-06-01T10:00:00.000Z",
    },
    {
      key: "ske",
      label: "Safety Knowledge (SKE)",
      score: 72,
      state: "AT_RISK",
      metrics: { evaluated: 9, atRisk: 3 },
    },
    {
      key: "fit_test",
      label: "Fit test",
      score: 80,
      state: "AT_RISK",
      metrics: {},
    },
    {
      key: "spce",
      label: "SPCE",
      score: 77,
      state: "AT_RISK",
      metrics: {},
    },
    {
      key: "worker_competency",
      label: "Worker competency",
      score: 90,
      state: "OK",
      metrics: {},
    },
    {
      key: "predictive_safety",
      label: "Predictive safety",
      score: 65,
      state: "AT_RISK",
      metrics: { highRiskWorkers: 2 },
    },
  ],
  workers: {
    totalWorkers: 12,
    compliant: 9,
    nonCompliant: 3,
    expiringSoon: 2,
    complianceRate: 75,
    topIssues: [],
    score: 75,
    state: "AT_RISK",
  },
  equipment: {
    total: 8,
    compliant: 6,
    nonCompliant: 2,
    overdueInspection: 1,
    complianceRate: 75,
    score: 75,
    state: "AT_RISK",
  },
  training: {
    expired: 1,
    expiring30: 2,
    expiring60: 0,
    expiring90: 0,
    highRisk: 1,
    gaps: 0,
    score: 84,
    state: "NON_COMPLIANT",
  },
  projects: null,
  companyAssessments: {
    spce: {
      overallScore: 77,
      overallStatus: "ConditionallyAccepted",
      evaluatedAt: "2026-06-01T09:00:00.000Z",
      state: "AT_RISK",
    },
    smartGap: null,
  },
  workerAssessments: null,
  competency: null,
  predictiveSafety: {
    tierAllowed: true,
    overallRiskIndex: 35,
    overallRiskLevel: "medium",
    highRiskWorkers: 2,
    highRiskTasks: 1,
    weekStart: "2026-06-01T00:00:00.000Z",
    state: "AT_RISK",
  },
  fitTests: {
    totalWorkers: 12,
    current: 8,
    expired: 1,
    expiring30: 1,
    missing: 2,
    failed: 0,
    complianceRate: 67,
    state: "AT_RISK",
  },
};

describe("ReadinessStateBadge", () => {
  it("renders OK, At risk, and Non-compliant labels", () => {
    const { rerender } = render(<ReadinessStateBadge state="OK" />);
    expect(screen.getByTestId("readiness-state-OK").textContent).toContain("OK");

    rerender(<ReadinessStateBadge state="AT_RISK" />);
    expect(screen.getByTestId("readiness-state-AT_RISK").textContent).toContain("At risk");

    rerender(<ReadinessStateBadge state="NON_COMPLIANT" />);
    expect(screen.getByTestId("readiness-state-NON_COMPLIANT").textContent).toContain(
      "Non-compliant",
    );
  });
});

describe("CoreReadinessDashboard dimension cards", () => {
  it("exposes dimension test ids for TAE, SKE, fit test, SPCE, competency, predictive", () => {
    render(
      <div>
        {fixture.dimensions!.map((dim) => (
          <article key={dim.key} data-testid={`readiness-dimension-${dim.key}`}>
            <ReadinessStateBadge state={dim.state} />
            <span>{dim.label}</span>
            <span>{dim.score}%</span>
          </article>
        ))}
      </div>,
    );

    expect(screen.getByTestId("readiness-dimension-tae")).toBeTruthy();
    expect(screen.getByTestId("readiness-dimension-ske")).toBeTruthy();
    expect(screen.getByTestId("readiness-dimension-fit_test")).toBeTruthy();
    expect(screen.getByTestId("readiness-dimension-spce")).toBeTruthy();
    expect(screen.getByTestId("readiness-dimension-worker_competency")).toBeTruthy();
    expect(screen.getByTestId("readiness-dimension-predictive_safety")).toBeTruthy();
  });
});

