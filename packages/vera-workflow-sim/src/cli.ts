#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { WorkflowSimulationEngine } from "./engine/simulation-engine";
import { WorkflowReportGenerator } from "./reporters/report-generator";

const args = process.argv.slice(2);
const outDir = args.includes("--out")
  ? args[args.indexOf("--out") + 1]
  : path.join(process.cwd(), "simulation-reports");
const jsonOnly = args.includes("--json");
const quiet = args.includes("--quiet");

const engine = new WorkflowSimulationEngine();
const { runs, report, definitionIssues } = engine.run();
const reporter = new WorkflowReportGenerator();

if (!quiet) {
  console.log("Vera Core — Workflow Simulation Engine");
  console.log("======================================");
  console.log(`Workflows: ${engine.getWorkflowCount()}`);
  console.log(`Scenarios: ${engine.getScenarioCount()}`);
  console.log(`Passed: ${report.summary.passed} / ${report.summary.total}`);
  console.log(`Failed: ${report.summary.failed}`);
  if (definitionIssues.length) {
    console.log(`Definition warnings/errors: ${definitionIssues.length}`);
  }
  for (const run of runs.filter((r) => !r.success)) {
    console.log(`  FAIL  ${run.scenarioId} → ${run.finalState}`);
  }
}

fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const mdPath = path.join(outDir, `workflow-simulation-${stamp}.md`);
const jsonPath = path.join(outDir, `workflow-simulation-${stamp}.json`);

if (!jsonOnly) {
  fs.writeFileSync(mdPath, reporter.toMarkdown(report), "utf8");
  if (!quiet) console.log(`Report: ${mdPath}`);
}
fs.writeFileSync(jsonPath, reporter.toJson(report), "utf8");
if (!quiet) console.log(`JSON:  ${jsonPath}`);

process.exit(report.summary.failed > 0 ? 1 : 0);
