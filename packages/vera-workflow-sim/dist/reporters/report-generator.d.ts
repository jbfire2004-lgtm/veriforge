import type { SimulationRunResult, ValidationIssue, WorkflowSimulationReport } from "../types";
export declare class WorkflowReportGenerator {
    generate(runs: SimulationRunResult[]): WorkflowSimulationReport;
    toMarkdown(report: WorkflowSimulationReport): string;
    toJson(report: WorkflowSimulationReport): string;
}
export declare function formatIssues(issues: ValidationIssue[]): string;
//# sourceMappingURL=report-generator.d.ts.map