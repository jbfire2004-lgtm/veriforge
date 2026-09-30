import { WorkflowSimulationEngine, WorkflowReportGenerator } from "@vera/workflow-sim";

/** Run full simulation suite (for Vitest smoke or scripts). */
export function runWorkflowSimulation() {
  const engine = new WorkflowSimulationEngine();
  const { runs, report } = engine.run();
  return {
    runs,
    report,
    markdown: new WorkflowReportGenerator().toMarkdown(report),
    ok: report.summary.failed === 0,
  };
}
