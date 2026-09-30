import { describe, expect, it } from "vitest";
import { WorkflowSimulationEngine, ALL_WORKFLOWS, ALL_SCENARIOS } from "@vera/workflow-sim";

describe("Vera workflow simulation engine", () => {
  it("defines all 12 lifecycle workflows", () => {
    expect(ALL_WORKFLOWS).toHaveLength(12);
    const categories = new Set(ALL_WORKFLOWS.map((w) => w.category));
    expect(categories.size).toBe(12);
  });

  it("runs full scenario suite successfully", () => {
    const engine = new WorkflowSimulationEngine();
    const { report } = engine.run();
    expect(ALL_SCENARIOS.length).toBeGreaterThanOrEqual(18);
    expect(report.summary.total).toBe(ALL_SCENARIOS.length);
    expect(report.summary.failed).toBe(0);
    expect(report.mermaidDiagrams["worker.lifecycle"]).toContain("stateDiagram-v2");
  });

  it("detects permission errors in negative scenarios", () => {
    const engine = new WorkflowSimulationEngine();
    const { runs } = engine.run();
    const permFail = runs.find((r) => r.scenarioId === "worker.error.permission");
    expect(permFail?.success).toBe(true);
    expect(permFail?.issues.some((i) => i.code === "PERMISSION_DENIED")).toBe(true);
  });
});
