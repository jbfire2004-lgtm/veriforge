import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { WorkerSafetyKnowledgeSummaryCard } from "@/components/workers/WorkerSafetyKnowledgeSummaryCard";

describe("WorkerSafetyKnowledgeSummaryCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state with link to core SKE", () => {
    render(<WorkerSafetyKnowledgeSummaryCard workerId={12} summary={undefined} />);
    expect(screen.getByTestId("worker-ske-summary-empty")).toBeInTheDocument();
    expect(screen.getByText(/Run evaluation in Core/)).toHaveAttribute(
      "href",
      "/core/safety-knowledge?workerId=12",
    );
  });

  it("renders SKE score and status from readiness payload", () => {
    render(
      <WorkerSafetyKnowledgeSummaryCard
        workerId={12}
        summary={{
          overallScore: 91,
          overallStatus: "Proficient",
          evaluatedAt: "2026-06-01T18:30:00.000Z",
        }}
      />,
    );
    expect(screen.getByTestId("worker-ske-summary")).toBeInTheDocument();
    expect(screen.getByText("91/100")).toBeInTheDocument();
    expect(screen.getByText("Proficient")).toBeInTheDocument();
    expect(screen.getByText("Open SKE")).toHaveAttribute(
      "href",
      "/core/safety-knowledge?workerId=12",
    );
  });
});
