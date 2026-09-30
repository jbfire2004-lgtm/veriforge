/**
 * Vera Core workflow simulation — re-exports @vera/workflow-sim for frontend/CI use.
 */
export {
  WorkflowSimulationEngine,
  WorkflowSimulator,
  WorkflowReportGenerator,
  WorkflowValidator,
  ALL_WORKFLOWS,
  ALL_SCENARIOS,
  workflowToMermaid,
  type WorkflowSimulationReport,
  type SimulationScenario,
  type SimulationRunResult,
} from "@vera/workflow-sim";
