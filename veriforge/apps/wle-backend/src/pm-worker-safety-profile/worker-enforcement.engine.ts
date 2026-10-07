import { PmCompanyEnforcementAction } from '@prisma/client';

export type WorkerEnforcementInput = {
  checks: Record<string, boolean>;
  medicalBlocks: string[];
  activeOverrides: Array<{ overrideType: string; ruleKey: string }>;
  corporateRiskLevel?: string;
};

export type WorkerEnforcementResult = {
  allowed: boolean;
  action: PmCompanyEnforcementAction;
  violations: string[];
  waived: string[];
};

export class WorkerEnforcementEngine {
  evaluate(input: WorkerEnforcementInput): WorkerEnforcementResult {
    const violations: string[] = [];
    const waived: string[] = [];

    if (input.checks.training === false) {
      if (this.waived(input, 'training', 'REQUIRED')) waived.push('training');
      else violations.push('Required training incomplete or expired');
    }

    if (input.checks.equipmentAuth === false) {
      if (this.waived(input, 'equipment', 'AUTH')) waived.push('equipment');
      else violations.push('Equipment authorization missing or expired');
    }

    if (input.checks.capa === false) {
      if (this.waived(input, 'training', 'CAPA')) waived.push('capa');
      else violations.push('Open or overdue corrective actions');
    }

    if (input.checks.sdsAck === false) {
      violations.push('SDS acknowledgment required');
    }

    if (input.checks.policyAck === false) {
      if (this.waived(input, 'training', 'POLICY')) waived.push('policy');
      else violations.push('Policy acknowledgment required');
    }

    if (input.checks.jha === false) {
      violations.push('JHA/FLHA participation required');
    }

    for (const block of input.medicalBlocks) {
      if (!this.waived(input, 'medical', block)) {
        violations.push(`Medical restriction: ${block}`);
      } else {
        waived.push(block);
      }
    }

    let action: PmCompanyEnforcementAction = 'block_access';
    if (violations.length === 0) {
      return { allowed: true, action, violations, waived };
    }

    const trainingOnly = violations.every(
      (v) =>
        v.includes('training') ||
        v.includes('Policy') ||
        v.includes('orientation'),
    );
    if (trainingOnly) action = 'supervisor_override';
    else if (
      input.corporateRiskLevel === 'critical' ||
      violations.some((v) => v.includes('SIF') || v.includes('Medical'))
    ) {
      action = 'safety_override';
    } else if (violations.length >= 3) {
      action = 'auto_capa';
    }

    return { allowed: false, action, violations, waived };
  }

  private waived(
    input: WorkerEnforcementInput,
    type: string,
    key: string,
  ): boolean {
    return input.activeOverrides.some(
      (o) => o.overrideType === type && o.ruleKey === key,
    );
  }
}
