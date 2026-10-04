import { PmCompanyEnforcementAction } from '@prisma/client';

export type CompanyEnforcementInput = {
  profilePublished: boolean;
  corporateRiskLevel: string;
  enforcementRules: Record<string, unknown>;
  workerChecks: Record<string, boolean>;
  activeOverrides: Array<{ overrideType: string; ruleKey: string }>;
  missingPolicyAcks: number;
  missingTraining: string[];
  expiredSds: number;
};

export type CompanyEnforcementResult = {
  allowed: boolean;
  action: PmCompanyEnforcementAction;
  violations: string[];
  waived: string[];
};

export class CompanyEnforcementEngine {
  evaluate(input: CompanyEnforcementInput): CompanyEnforcementResult {
    const violations: string[] = [];
    const waived: string[] = [];

    if (!input.profilePublished) {
      violations.push('Company safety profile not published');
    }

    const rules = input.enforcementRules;

    if (
      rules.blockAccessWithoutOrientation &&
      input.workerChecks.orientation === false
    ) {
      if (this.waived(input, 'training', 'ORIENTATION'))
        waived.push('ORIENTATION');
      else violations.push('Company orientation required');
    }

    if (rules.blockAccessWithoutPolicyAck && input.missingPolicyAcks > 0) {
      if (this.waived(input, 'policy', 'REQUIRED')) waived.push('POLICY');
      else
        violations.push(
          `${input.missingPolicyAcks} required policy acknowledgment(s) missing`,
        );
    }

    for (const code of input.missingTraining) {
      if (this.waived(input, 'training', code)) waived.push(code);
      else violations.push(`Missing training: ${code}`);
    }

    if (input.expiredSds > 0) {
      violations.push(`${input.expiredSds} expired SDS document(s)`);
    }

    if (
      input.corporateRiskLevel === 'critical' &&
      input.workerChecks.sif === false
    ) {
      if (this.waived(input, 'zone', 'SIF')) waived.push('SIF');
      else violations.push('SIF clearance required for critical-risk company');
    }

    let action: PmCompanyEnforcementAction = 'block_access';
    if (violations.length === 0) action = 'block_access';
    else if (
      violations.every(
        (v) => v.includes('training') || v.includes('orientation'),
      ) &&
      rules.requireSupervisorOverrideOnTrainingGap
    ) {
      action = 'supervisor_override';
    } else if (
      input.corporateRiskLevel === 'critical' &&
      rules.requireSafetyOverrideOnSif
    ) {
      action = 'safety_override';
    } else if (violations.length > 2 && rules.autoCapaOnRepeatDenial) {
      action = 'auto_capa';
    }

    return {
      allowed: violations.length === 0,
      action,
      violations,
      waived,
    };
  }

  private waived(
    input: CompanyEnforcementInput,
    type: string,
    key: string,
  ): boolean {
    return input.activeOverrides.some(
      (o) => o.overrideType === type && o.ruleKey === key,
    );
  }
}
