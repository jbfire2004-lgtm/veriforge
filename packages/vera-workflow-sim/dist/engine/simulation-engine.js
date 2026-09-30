"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowSimulationEngine = void 0;
const simulator_1 = require("./simulator");
const scenarios_1 = require("../scenarios");
const report_generator_1 = require("../reporters/report-generator");
const registry_1 = require("../workflows/registry");
class WorkflowSimulationEngine {
    constructor() {
        this.simulator = new simulator_1.WorkflowSimulator();
        this.reporter = new report_generator_1.WorkflowReportGenerator();
    }
    run(options = {}) {
        const scenarios = options.scenarios ?? scenarios_1.ALL_SCENARIOS;
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
    getWorkflowCount() {
        return registry_1.ALL_WORKFLOWS.length;
    }
    getScenarioCount() {
        return scenarios_1.ALL_SCENARIOS.length;
    }
}
exports.WorkflowSimulationEngine = WorkflowSimulationEngine;
//# sourceMappingURL=simulation-engine.js.map