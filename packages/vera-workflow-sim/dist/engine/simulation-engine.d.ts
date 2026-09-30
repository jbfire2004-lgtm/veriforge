import { WorkflowSimulator } from "./simulator";
import { ALL_SCENARIOS } from "../scenarios";
import type { SimulationRunResult, WorkflowSimulationReport } from "../types";
export type SimulationEngineOptions = {
    scenarios?: typeof ALL_SCENARIOS;
    validateDefinitions?: boolean;
};
export declare class WorkflowSimulationEngine {
    private simulator;
    private reporter;
    run(options?: SimulationEngineOptions): {
        runs: SimulationRunResult[];
        report: WorkflowSimulationReport;
        definitionIssues: ReturnType<WorkflowSimulator["validateRegistry"]>;
    };
    getWorkflowCount(): number;
    getScenarioCount(): number;
}
//# sourceMappingURL=simulation-engine.d.ts.map