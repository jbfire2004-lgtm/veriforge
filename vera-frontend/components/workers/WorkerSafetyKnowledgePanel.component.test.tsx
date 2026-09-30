import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { WorkerSafetyKnowledgePanel } from "@/components/workers/WorkerSafetyKnowledgePanel";

vi.mock("@/lib/safety-knowledge", () => ({
  evaluateSafetyKnowledge: vi.fn(),
  getLatestSafetyKnowledge: vi.fn(),
  listSafetyKnowledgeHistory: vi.fn(),
  downloadSafetyKnowledgePdf: vi.fn(),
}));

import {
  evaluateSafetyKnowledge,
  getLatestSafetyKnowledge,
  listSafetyKnowledgeHistory,
} from "@/lib/safety-knowledge";

const mockLatest = vi.mocked(getLatestSafetyKnowledge);
const mockHistory = vi.mocked(listSafetyKnowledgeHistory);
const mockEvaluate = vi.mocked(evaluateSafetyKnowledge);

const sampleResult = {
  workerId: "12",
  overallScore: 90,
  overallStatus: "Proficient",
  domains: [],
  recommendations: [],
};

describe("WorkerSafetyKnowledgePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLatest.mockResolvedValue({
      id: "run-1",
      overallScore: 90,
      overallStatus: "Proficient",
      resultJson: sampleResult,
      evaluatedAt: "2026-06-01T12:00:00.000Z",
    });
    mockHistory.mockResolvedValue([
      {
        id: "run-1",
        overallScore: 90,
        overallStatus: "Proficient",
        evaluatedAt: "2026-06-01T12:00:00.000Z",
      },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it("loads latest SKE result and history on mount", async () => {
    render(<WorkerSafetyKnowledgePanel workerId={12} workerName="Alex Rivera" />);
    await waitFor(() => {
      expect(mockLatest).toHaveBeenCalledWith(12);
      expect(mockHistory).toHaveBeenCalledWith(12);
    });
    expect(screen.getByTestId("worker-ske-panel")).toBeInTheDocument();
    expect(screen.getByText("Proficient")).toBeInTheDocument();
    expect(screen.getByTestId("ske-history-run-1")).toBeInTheDocument();
  });

  it("runs evaluation via API", async () => {
    mockEvaluate.mockResolvedValue({ runId: "run-2", result: sampleResult });
    render(<WorkerSafetyKnowledgePanel workerId={12} workerName="Alex Rivera" />);
    await waitFor(() => expect(mockLatest).toHaveBeenCalled());
    screen.getByRole("button", { name: "Run evaluation" }).click();
    await waitFor(() => {
      expect(mockEvaluate).toHaveBeenCalledWith(12);
    });
  });
});
