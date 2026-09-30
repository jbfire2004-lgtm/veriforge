"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowSimulator = void 0;
const registry_1 = require("../workflows/registry");
const workflow_validator_1 = require("../validators/workflow-validator");
const EVENT_TO_STEP = {
    "worker.create": "create",
    "worker.linkCompany": "linkCompany",
    "worker.assignProject": "assignProject",
    "worker.uploadTraining": "uploadTraining",
    "compliance.pass": "complianceCheck",
    "competency.pass": "competencyEval",
    "worker.qrScan": "qrScanOnline",
    "worker.qrScanOffline": "qrScanOffline",
    "wallet.push": "walletUpdate",
    "worker.leaveProject": "leaveProject",
    "worker.leaveCompany": "leaveCompany",
    "worker.transferCompany": "transferCompany",
    "worker.archive": "historyArchive",
    "equipment.create": "create",
    "equipment.linkCompany": "linkCompany",
    "equipment.assignProject": "assignProject",
    "inspection.preUsePass": "preUseInspection",
    "inspection.scheduledPass": "scheduledInspection",
    "equipment.lockout": "lockout",
    "training.certificateUpload": "certificate",
    "training.submitValidation": "validate",
    "training.offlineUpload": "offlineUpload",
    "sync.complete": "syncValidate",
    "provider.approve": "approve",
    "union.memberOnboard": "onboard",
    "company.create": "create",
    "project.create": "create",
    "dashboard.fetch": "pipelines",
    "dashboard.realtimeTick": "realtime",
    "dashboard.syncRefresh": "syncRefresh",
    "inspection.offlineSubmit": "offline",
    "competency.offlineEval": "offlineEval",
    "offline.action": "qrOffline",
};
class WorkflowSimulator {
    constructor() {
        this.validator = new workflow_validator_1.WorkflowValidator();
    }
    runScenario(scenario) {
        const start = Date.now();
        const workflow = registry_1.WORKFLOW_BY_ID[scenario.workflowId];
        if (!workflow) {
            return this.failFast(scenario, `Unknown workflow: ${scenario.workflowId}`, start);
        }
        const defIssues = this.validator.validateDefinition(workflow);
        if (defIssues.some((i) => i.severity === "error")) {
            return this.failFast(scenario, defIssues.map((i) => i.message).join("; "), start, defIssues);
        }
        let state = workflow.initialState;
        const visitedStates = [state];
        const executedSteps = new Set();
        const logs = [];
        const allIssues = [...defIssues];
        const stepResults = [];
        const ctx = { ...scenario.context };
        if (ctx.offline) {
            ctx.complianceFlags = { ...ctx.complianceFlags, "offline.mode": true };
        }
        this.log(logs, "info", `Starting scenario: ${scenario.name}`, state);
        for (const event of scenario.events) {
            const transition = workflow.transitions.find((t) => t.from === state && t.event === event.type);
            const syncIssues = this.validator.sync.validateOfflineTransition(event, ctx);
            const conflictIssues = this.validator.conflict.evaluate(event, ctx, {
                projectStatus: ctx.complianceFlags?.["project.closed"] ? "CLOSED" : "ACTIVE",
                lockedOut: ctx.complianceFlags?.["equipment.lockout"] === true,
                trainingExpired: ctx.complianceFlags?.["training.expired"] === true,
            });
            allIssues.push(...syncIssues, ...conflictIssues);
            if (!transition) {
                const alt = workflow.transitions.find((t) => t.event === event.type);
                const issue = {
                    code: "INVALID_TRANSITION",
                    message: alt
                        ? `Invalid transition: cannot apply "${event.type}" from state "${state}" (expected from ${alt.from})`
                        : `Unknown event "${event.type}" for workflow ${workflow.id}`,
                    severity: "error",
                    validator: "WorkflowSimulator",
                };
                allIssues.push(issue);
                this.log(logs, "error", issue.message, state, event.type, [issue]);
                stepResults.push({ stepId: event.type, ok: false, issues: [issue] });
                continue;
            }
            const transitionIssues = this.validator.validateTransition(workflow, transition, ctx);
            allIssues.push(...transitionIssues);
            const stepId = EVENT_TO_STEP[event.type] ?? event.type;
            executedSteps.add(stepId);
            const stepOk = !transitionIssues.some((i) => i.severity === "error");
            stepResults.push({ stepId, ok: stepOk, issues: transitionIssues });
            if (stepOk) {
                state = transition.to;
                visitedStates.push(state);
                this.log(logs, "info", `${event.type} → ${state}`, state, event.type);
            }
            else {
                this.log(logs, "error", `Blocked: ${event.type}`, state, event.type, transitionIssues);
            }
        }
        const runIssues = this.validator.validateRun(workflow, visitedStates, [...executedSteps], ctx);
        allIssues.push(...runIssues);
        allIssues.push(...this.validator.sync.validateQueueProcessing(scenario.events));
        const hasErrors = allIssues.some((i) => i.severity === "error");
        const expect = scenario.expect ?? { noErrors: true };
        let success = !hasErrors;
        if (expect.finalState && state !== expect.finalState) {
            allIssues.push({
                code: "EXPECT_STATE_MISMATCH",
                message: `Expected final state "${expect.finalState}", got "${state}"`,
                severity: "error",
                validator: "WorkflowSimulator",
            });
            success = false;
        }
        if (expect.noErrors === true && hasErrors)
            success = false;
        if (expect.noErrors === false && hasErrors)
            success = true;
        const conflictCount = allIssues.filter((i) => i.code.startsWith("CONFLICT_")).length;
        if (expect.conflictCount !== undefined && conflictCount !== expect.conflictCount) {
            success = false;
        }
        this.log(logs, success ? "info" : "error", success ? "Scenario passed" : "Scenario failed", state);
        return {
            scenarioId: scenario.id,
            workflowId: scenario.workflowId,
            kind: scenario.kind,
            success,
            initialState: workflow.initialState,
            finalState: state,
            visitedStates,
            logs,
            issues: allIssues,
            stepResults,
            durationMs: Date.now() - start,
        };
    }
    runAll(scenarios) {
        return scenarios.map((s) => this.runScenario(s));
    }
    validateRegistry() {
        return this.validator.validateAllDefinitions(registry_1.ALL_WORKFLOWS);
    }
    log(logs, level, message, state, event, issues) {
        logs.push({
            timestamp: new Date().toISOString(),
            level,
            message,
            state,
            event,
            issues,
        });
    }
    failFast(scenario, message, start, issues = []) {
        const issue = {
            code: "SCENARIO_SETUP_FAIL",
            message,
            severity: "error",
            validator: "WorkflowSimulator",
        };
        return {
            scenarioId: scenario.id,
            workflowId: scenario.workflowId,
            kind: scenario.kind,
            success: false,
            initialState: "—",
            finalState: "—",
            visitedStates: [],
            logs: [
                {
                    timestamp: new Date().toISOString(),
                    level: "error",
                    message,
                },
            ],
            issues: [...issues, issue],
            stepResults: [],
            durationMs: Date.now() - start,
        };
    }
}
exports.WorkflowSimulator = WorkflowSimulator;
//# sourceMappingURL=simulator.js.map