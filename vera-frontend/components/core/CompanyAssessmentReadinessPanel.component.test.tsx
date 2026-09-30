import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CompanyAssessmentReadinessPanel } from "@/components/core/CompanyAssessmentReadinessPanel";

describe("CompanyAssessmentReadinessPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("prompts for company selection when no company is set", () => {
    render(
      <CompanyAssessmentReadinessPanel companyId={null} spce={null} smartGap={null} />,
    );
    expect(screen.getByTestId("company-assessments-empty-company")).toBeInTheDocument();
    expect(screen.getByText(/Select a company above/)).toBeInTheDocument();
  });

  it("shows empty states when company has no assessments", () => {
    render(
      <CompanyAssessmentReadinessPanel companyId={1} spce={null} smartGap={null} />,
    );
    expect(screen.getByTestId("company-assessments-panel")).toBeInTheDocument();
    expect(screen.getByTestId("spce-empty")).toBeInTheDocument();
    expect(screen.getByTestId("sga-empty")).toBeInTheDocument();
  });
});
