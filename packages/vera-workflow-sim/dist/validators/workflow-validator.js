"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowValidator = void 0;
const compliance_validator_1 = require("./compliance-validator");
const conflict_validator_1 = require("./conflict-validator");
const permission_validator_1 = require("./permission-validator");
const step_validator_1 = require("./step-validator");
const sync_validator_1 = require("./sync-validator");
class WorkflowValidator {
    constructor() {
        this.stepValidator = new step_validator_1.StepValidator();
        this.permissionValidator = new permission_validator_1.PermissionValidator();
        this.complianceValidator = new compliance_validator_1.ComplianceValidator();
        this.syncValidator = new sync_validator_1.SyncValidator();
        this.conflictValidator = new conflict_validator_1.ConflictValidator();
    }
    validateDefinition(workflow) {
        const issues = [];
        const stateSet = new Set(workflow.states);
        if (!stateSet.has(workflow.initialState)) {
            issues.push({
                code: "INVALID_INITIAL_STATE",
                message: `Initial state "${workflow.initialState}" not in workflow states`,
                severity: "error",
                validator: "WorkflowValidator",
            });
        }
        for (const t of workflow.transitions) {
            if (!stateSet.has(t.from) || !stateSet.has(t.to)) {
                issues.push({
                    code: "INVALID_TRANSITION",
                    message: `Transition ${t.from}→${t.to} references unknown state`,
                    severity: "error",
                    transition: `${t.from}→${t.to}`,
                    validator: "WorkflowValidator",
                });
            }
        }
        const reachable = this.computeReachable(workflow);
        for (const terminal of workflow.terminalStates) {
            if (!reachable.has(terminal) && workflow.states.length > 2) {
                issues.push({
                    code: "UNREACHABLE_TERMINAL",
                    message: `Terminal state "${terminal}" is not reachable from initial state`,
                    severity: "warn",
                    validator: "WorkflowValidator",
                });
            }
        }
        return issues;
    }
    validateTransition(workflow, transition, ctx) {
        return [
            ...this.permissionValidator.validateTransition(transition, ctx),
            ...this.complianceValidator.validateTransition(transition, ctx),
            ...this.permissionValidator.validateWorkflowAccess(workflow, ctx),
            ...this.complianceValidator.detectGaps(workflow.category, ctx),
        ];
    }
    validateRun(workflow, visitedStates, executedSteps, ctx) {
        return [
            ...this.stepValidator.validate(workflow, executedSteps),
            ...this.stepValidator.validateStepCoverage(workflow, visitedStates),
            ...this.syncValidator.validateDelta(ctx),
        ];
    }
    validateAllDefinitions(workflows) {
        return workflows.flatMap((w) => this.validateDefinition(w));
    }
    get step() {
        return this.stepValidator;
    }
    get permission() {
        return this.permissionValidator;
    }
    get compliance() {
        return this.complianceValidator;
    }
    get sync() {
        return this.syncValidator;
    }
    get conflict() {
        return this.conflictValidator;
    }
    computeReachable(workflow) {
        const adj = new Map();
        for (const t of workflow.transitions) {
            const list = adj.get(t.from) ?? [];
            list.push(t.to);
            adj.set(t.from, list);
        }
        const seen = new Set();
        const queue = [workflow.initialState];
        while (queue.length) {
            const s = queue.shift();
            if (seen.has(s))
                continue;
            seen.add(s);
            for (const next of adj.get(s) ?? [])
                queue.push(next);
        }
        return seen;
    }
}
exports.WorkflowValidator = WorkflowValidator;
//# sourceMappingURL=workflow-validator.js.map