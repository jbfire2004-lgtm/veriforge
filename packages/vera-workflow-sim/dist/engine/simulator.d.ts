import type { SimulationRunResult, SimulationScenario, ValidationIssue } from "../types";
export declare class WorkflowSimulator {
    private validator;
    runScenario(scenario: SimulationScenario): SimulationRunResult;
    runAll(scenarios: SimulationScenario[]): SimulationRunResult[];
    validateRegistry(): ValidationIssue[];
    private log;
    private failFast;
}
//# sourceMappingURL=simulator.d.ts.map