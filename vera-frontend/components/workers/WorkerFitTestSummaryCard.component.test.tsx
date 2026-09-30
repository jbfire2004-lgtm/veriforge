import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkerFitTestSummaryCard } from "./WorkerFitTestSummaryCard";

describe("WorkerFitTestSummaryCard", () => {
  it("shows empty state when no fit test", () => {
    render(<WorkerFitTestSummaryCard workerId={12} fitTest={null} />);
    expect(screen.getByTestId("worker-fit-test-summary")).toBeTruthy();
    expect(screen.getByText(/No fit test on file/i)).toBeTruthy();
  });

  it("shows status, result, and expiry from readiness payload", () => {
    render(
      <WorkerFitTestSummaryCard
        workerId={12}
        fitTest={{
          pass: true,
          statusLabel: "PASS",
          result: "PASS",
          performedAt: "2026-06-01T00:00:00.000Z",
          expiresAt: "2027-06-01T00:00:00.000Z",
          expiringSoon: false,
        }}
      />,
    );
    expect(screen.getByText(/Status:/i)).toBeTruthy();
    expect(screen.getByText("PASS")).toBeTruthy();
    expect(screen.getByText(/Expires/i)).toBeTruthy();
  });
});

