"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepValidator = void 0;
class StepValidator {
    validate(workflow, executedStepIds) {
        const issues = [];
        const executed = new Set(executedStepIds);
        for (const step of workflow.steps) {
            if (step.required && !executed.has(step.id)) {
                issues.push({
                    code: "STEP_MISSING",
                    message: `Required step "${step.label}" (${step.id}) was not executed`,
                    severity: "error",
                    stepId: step.id,
                    validator: "StepValidator",
                });
            }
            if (step.offlineCapable === false && executed.has(step.id)) {
                // no-op: offline-only steps flagged elsewhere
            }
        }
        return issues;
    }
    validateStepCoverage(workflow, visitedStates) {
        const issues = [];
        const stateSet = new Set(visitedStates);
        const unreachable = workflow.states.filter((s) => s !== workflow.initialState && !stateSet.has(s) && !workflow.terminalStates.includes(s));
        if (unreachable.length > 0 && visitedStates.length > 1) {
            issues.push({
                code: "STEP_COVERAGE_GAP",
                message: `States never visited: ${unreachable.slice(0, 5).join(", ")}${unreachable.length > 5 ? "…" : ""}`,
                severity: "warn",
                validator: "StepValidator",
            });
        }
        return issues;
    }
    validateOfflineStep(stepId, ctx) {
        if (!ctx.offline)
            return [];
        return [
            {
                code: "OFFLINE_STEP",
                message: `Step ${stepId} executed in offline mode`,
                severity: "info",
                stepId,
                validator: "StepValidator",
            },
        ];
    }
}
exports.StepValidator = StepValidator;
//# sourceMappingURL=step-validator.js.map