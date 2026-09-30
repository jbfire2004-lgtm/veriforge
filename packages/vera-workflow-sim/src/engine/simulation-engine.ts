import { WorkflowSimulator } from "./simulator";
import { ALL_SCENARIOS } from "../scenarios";
import { WorkflowReportGenerator } from "../reporters/report-generator";
import type { SimulationRunResult, WorkflowSimulationReport } from "../types";
import { ALL_WORKFLOWS } from "../workflows/registry";

export type SimulationEngineOptions = {
  scenarios?: typeof ALL_SCENARIOS;
  validateDefinitions?: boolean;
};

export class WorkflowSimulationEngine {
  private simulator = new WorkflowSimulator();
  private reporter = new WorkflowReportGenerator();

  run(options: SimulationEngineOptions = {}): {
    runs: SimulationRunResult[];
    report: WorkflowSimulationReport;
    definitionIssues: ReturnType<WorkflowSimulator["validateRegistry"]>;
  } {
    const scenarios = options.scenarios ?? ALL_SCENARIOS;
    const definitionIssues = options.validateDefinitions !== false
      ? this.simulator.validateRegistry()
      : [];

    const runs = this.simulator.runAll(scenarios);
    const report = this.reporter.generate(runs);

    if (definitionIssues.length > 0) {
      report.errors.push(...definitionIssues);
    }

    return { runs, report, definitionIssues };
  }

  getWorkflowCount(): number {
    return ALL_WORKFLOWS.length;
  }

  getScenarioCount(): number {
    return ALL_SCENARIOS.length;
  }
}
