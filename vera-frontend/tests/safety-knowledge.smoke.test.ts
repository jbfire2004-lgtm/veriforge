import { describe, expect, it } from "vitest";
import {
  formatSafetyKnowledgeEvaluatedAt,
  safetyKnowledgeStatusTone,
} from "@/components/safety-knowledge/SafetyKnowledgeResultSummary";
import { safetyKnowledgeWorkerPath } from "@/lib/safety-knowledge";

describe("safety-knowledge integration helpers", () => {
  it("formats evaluated timestamps", () => {
    const formatted = formatSafetyKnowledgeEvaluatedAt("2026-06-01T18:30:00.000Z");
    expect(formatted).toBeTruthy();
    expect(formatSafetyKnowledgeEvaluatedAt("invalid")).toBeNull();
  });

  it("maps SKE status labels to UI tones", () => {
    expect(safetyKnowledgeStatusTone("Proficient")).toBe("success");
    expect(safetyKnowledgeStatusTone("Developing")).toBe("warning");
    expect(safetyKnowledgeStatusTone("Deficient")).toBe("danger");
  });

  it("builds worker API paths for latest, history, and evaluate", () => {
    expect(safetyKnowledgeWorkerPath(12, "/latest")).toContain(
      "/api/v1/safety-knowledge/worker/12/latest",
    );
    expect(safetyKnowledgeWorkerPath(12, "/history")).toContain(
      "/api/v1/safety-knowledge/worker/12/history",
    );
  });
});