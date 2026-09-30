import type {
  SimulationContext,
  ValidationIssue,
  WorkflowDefinition,
  WorkflowTransition,
} from "../types";
import { ComplianceValidator } from "./compliance-validator";
import { ConflictValidator } from "./conflict-validator";
import { PermissionValidator } from "./permission-validator";
import { StepValidator } from "./step-validator";
import { SyncValidator } from "./sync-validator";

export class WorkflowValidator {
  private stepValidator = new StepValidator();
  private permissionValidator = new PermissionValidator();
  private complianceValidator = new ComplianceValidator();
  private syncValidator = new SyncValidator();
  private conflictValidator = new ConflictValidator();

  validateDefinition(workflow: WorkflowDefinition): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
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

  validateTransition(
    workflow: WorkflowDefinition,
    transition: WorkflowTransition,
    ctx: SimulationContext
  ): ValidationIssue[] {
    return [
      ...this.permissionValidator.validateTransition(transition, ctx),
      ...this.complianceValidator.validateTransition(transition, ctx),
      ...this.permissionValidator.validateWorkflowAccess(workflow, ctx),
      ...this.complianceValidator.detectGaps(workflow.category, ctx),
    ];
  }

  validateRun(
    workflow: WorkflowDefinition,
    visitedStates: string[],
    executedSteps: string[],
    ctx: SimulationContext
  ): ValidationIssue[] {
    return [
      ...this.stepValidator.validate(workflow, executedSteps),
      ...this.stepValidator.validateStepCoverage(workflow, visitedStates),
      ...this.syncValidator.validateDelta(ctx),
    ];
  }

  validateAllDefinitions(workflows: WorkflowDefinition[]): ValidationIssue[] {
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

  private computeReachable(workflow: WorkflowDefinition): Set<string> {
    const adj = new Map<string, string[]>();
    for (const t of workflow.transitions) {
      const list = adj.get(t.from) ?? [];
      list.push(t.to);
      adj.set(t.from, list);
    }
    const seen = new Set<string>();
    const queue = [workflow.initialState];
    while (queue.length) {
      const s = queue.shift()!;
      if (seen.has(s)) continue;
      seen.add(s);
      for (const next of adj.get(s) ?? []) queue.push(next);
    }
    return seen;
  }
}
