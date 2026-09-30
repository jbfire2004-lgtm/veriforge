import type {
  LifecycleCategory,
  ScenarioKind,
  SimulationRunResult,
  ValidationIssue,
  WorkflowSimulationReport,
} from "../types";
import { ALL_WORKFLOWS } from "../workflows/registry";
import { allWorkflowsMermaid } from "./mermaid";

export class WorkflowReportGenerator {
  generate(runs: SimulationRunResult[]): WorkflowSimulationReport {
    const passed = runs.filter((r) => r.success).length;
    const failed = runs.length - passed;

    const byCategory = {} as WorkflowSimulationReport["summary"]["byCategory"];
    const byKind = {} as WorkflowSimulationReport["summary"]["byKind"];

    for (const w of ALL_WORKFLOWS) {
      byCategory[w.category] = { passed: 0, failed: 0 };
    }
    const kinds: ScenarioKind[] = [
      "happy",
      "edge",
      "error",
      "offline",
      "conflict",
      "multiUser",
      "multiCompany",
    ];
    for (const k of kinds) byKind[k] = { passed: 0, failed: 0 };

    for (const run of runs) {
      const wf = ALL_WORKFLOWS.find((w) => w.id === run.workflowId);
      if (wf) {
        const bucket = byCategory[wf.category];
        if (run.success) bucket.passed++;
        else bucket.failed++;
      }
      const kindBucket = byKind[run.kind];
      if (run.success) kindBucket.passed++;
      else kindBucket.failed++;
    }

    const allIssues = runs.flatMap((r) => r.issues);
    const errors = allIssues.filter((i) => i.severity === "error");
    const conflicts = allIssues.filter((i) => i.code.startsWith("CONFLICT_"));
    const compliance = allIssues.filter(
      (i) => i.validator === "ComplianceValidator" || i.code.includes("COMPLIANCE")
    );
    const sync = allIssues.filter((i) => i.validator === "SyncValidator");

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        total: runs.length,
        passed,
        failed,
        byCategory,
        byKind,
      },
      runs,
      errors,
      conflicts,
      compliance,
      sync,
      mermaidDiagrams: allWorkflowsMermaid(ALL_WORKFLOWS),
    };
  }

  toMarkdown(report: WorkflowSimulationReport): string {
    const lines: string[] = [
      "# Vera Core — Workflow Simulation Report",
      "",
      `Generated: ${report.generatedAt}`,
      "",
      "## Summary",
      "",
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total scenarios | ${report.summary.total} |`,
      `| Passed | ${report.summary.passed} |`,
      `| Failed | ${report.summary.failed} |`,
      "",
      "### By lifecycle",
      "",
      "| Category | Passed | Failed |",
      "|----------|--------|--------|",
    ];

    for (const [cat, stats] of Object.entries(report.summary.byCategory) as [
      LifecycleCategory,
      { passed: number; failed: number },
    ][]) {
      if (stats.passed + stats.failed === 0) continue;
      lines.push(`| ${cat} | ${stats.passed} | ${stats.failed} |`);
    }

    lines.push("", "### By scenario kind", "", "| Kind | Passed | Failed |", "|------|--------|--------|");
    for (const [kind, stats] of Object.entries(report.summary.byKind)) {
      if (stats.passed + stats.failed === 0) continue;
      lines.push(`| ${kind} | ${stats.passed} | ${stats.failed} |`);
    }

    if (report.errors.length > 0) {
      lines.push("", "## Errors", "");
      for (const e of report.errors.slice(0, 50)) {
        lines.push(`- **${e.code}**: ${e.message} (${e.validator})`);
      }
    }

    if (report.conflicts.length > 0) {
      lines.push("", "## Conflict reports", "");
      for (const c of report.conflicts) {
        lines.push(`- ${c.message}`);
      }
    }

    if (report.compliance.length > 0) {
      lines.push("", "## Compliance reports", "");
      for (const c of report.compliance.slice(0, 30)) {
        lines.push(`- ${c.message}`);
      }
    }

    lines.push("", "## Scenario results", "", "| Scenario | Workflow | Kind | Result | Final state |", "|----------|----------|------|--------|-------------|");
    for (const run of report.runs) {
      lines.push(
        `| ${run.scenarioId} | ${run.workflowId} | ${run.kind} | ${run.success ? "PASS" : "FAIL"} | ${run.finalState} |`
      );
    }

    lines.push("", "## Workflow diagrams", "");
    for (const [id, diagram] of Object.entries(report.mermaidDiagrams)) {
      lines.push(`### ${id}`, "", diagram, "");
    }

    lines.push("", "## Step logs (failed runs)", "");
    for (const run of report.runs.filter((r) => !r.success)) {
      lines.push(`### ${run.scenarioId}`, "");
      for (const log of run.logs.filter((l) => l.level === "error")) {
        lines.push(`- \`${log.timestamp}\` ${log.message}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  toJson(report: WorkflowSimulationReport): string {
    return JSON.stringify(report, null, 2);
  }
}

export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((i) => `[${i.severity}] ${i.code}: ${i.message}`).join("\n");
}
