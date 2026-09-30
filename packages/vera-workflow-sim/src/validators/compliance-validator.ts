import type { SimulationContext, ValidationIssue, WorkflowTransition } from "../types";

const DEFAULT_FLAGS: Record<string, boolean> = {
  "training.valid": true,
  "competency.valid": true,
  "inspection.pass": true,
  "inspection.fail": false,
  "csa.valid": true,
  "ohs.valid": true,
  "provider.approved": true,
  "provider.reviewed": true,
  "project.readiness": true,
};

export class ComplianceValidator {
  evaluateGuards(
    guards: string[] | undefined,
    ctx: SimulationContext
  ): ValidationIssue[] {
    if (!guards?.length) return [];
    const flags = { ...DEFAULT_FLAGS, ...ctx.complianceFlags };
    const issues: ValidationIssue[] = [];

    for (const guard of guards) {
      if (!flags[guard]) {
        issues.push({
          code: "COMPLIANCE_GUARD_FAIL",
          message: `Compliance guard failed: ${guard}`,
          severity: "error",
          validator: "ComplianceValidator",
        });
      }
    }
    return issues;
  }

  validateTransition(
    transition: WorkflowTransition,
    ctx: SimulationContext
  ): ValidationIssue[] {
    return this.evaluateGuards(transition.guards, ctx);
  }

  validateStepChecks(
    checks: string[] | undefined,
    ctx: SimulationContext
  ): ValidationIssue[] {
    return this.evaluateGuards(checks, ctx);
  }

  detectGaps(
    workflowCategory: string,
    ctx: SimulationContext
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const flags = { ...DEFAULT_FLAGS, ...ctx.complianceFlags };

    if (workflowCategory === "training" && !flags["provider.approved"]) {
      issues.push({
        code: "PROVIDER_NOT_APPROVED",
        message: "Training cannot be validated: provider not approved",
        severity: "error",
        validator: "ComplianceValidator",
      });
    }

    if (workflowCategory === "project" && !flags["project.readiness"]) {
      issues.push({
        code: "PROJECT_NOT_READY",
        message: "Project readiness check failed",
        severity: "error",
        validator: "ComplianceValidator",
      });
    }

    return issues;
  }
}
