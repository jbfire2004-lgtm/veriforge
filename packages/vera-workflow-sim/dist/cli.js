#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const simulation_engine_1 = require("./engine/simulation-engine");
const report_generator_1 = require("./reporters/report-generator");
const args = process.argv.slice(2);
const outDir = args.includes("--out")
    ? args[args.indexOf("--out") + 1]
    : path.join(process.cwd(), "simulation-reports");
const jsonOnly = args.includes("--json");
const quiet = args.includes("--quiet");
const engine = new simulation_engine_1.WorkflowSimulationEngine();
const { runs, report, definitionIssues } = engine.run();
const reporter = new report_generator_1.WorkflowReportGenerator();
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
    if (!quiet)
        console.log(`Report: ${mdPath}`);
}
fs.writeFileSync(jsonPath, reporter.toJson(report), "utf8");
if (!quiet)
    console.log(`JSON:  ${jsonPath}`);
process.exit(report.summary.failed > 0 ? 1 : 0);
//# sourceMappingURL=cli.js.map