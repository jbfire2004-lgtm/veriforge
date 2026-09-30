import { describe, expect, it, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SafetyKnowledgeHistoryList } from "@/components/safety-knowledge/SafetyKnowledgeHistoryList";

describe("SafetyKnowledgeHistoryList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state", () => {
    render(<SafetyKnowledgeHistoryList entries={[]} />);
    expect(screen.getByTestId("ske-history-empty")).toBeInTheDocument();
  });

  it("renders history entries with scores and statuses", () => {
    const onSelect = vi.fn();
    render(
      <SafetyKnowledgeHistoryList
        entries={[
          {
            id: "run-2",
            overallScore: 85,
            overallStatus: "Developing",
            evaluatedAt: "2026-06-02T10:00:00.000Z",
          },
          {
            id: "run-1",
            overallScore: 90,
            overallStatus: "Proficient",
            evaluatedAt: "2026-06-01T10:00:00.000Z",
          },
        ]}
        selectedId="run-2"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByTestId("ske-history-list")).toBeInTheDocument();
    expect(screen.getByTestId("ske-history-run-2")).toBeInTheDocument();
    expect(screen.getByText("85/100")).toBeInTheDocument();
    expect(screen.getByText("Developing")).toBeInTheDocument();
    screen.getByTestId("ske-history-run-1").click();
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "run-1", overallScore: 90 }),
    );
  });
});
