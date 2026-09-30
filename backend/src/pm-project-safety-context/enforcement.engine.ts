export type EnforcementCheckInput = {
  profilePublished: boolean;
  riskLevel: string;
  enforcementRules: Record<string, unknown>;
  zoneCode?: string;
  workerChecks?: Record<string, boolean>;
  activeOverrides?: Array<{ ruleType: string; ruleKey: string }>;
};

export type EnforcementResult = {
  enforced: boolean;
  violations: string[];
  waivedByOverride: string[];
};

export class EnforcementEngine {
  evaluate(input: EnforcementCheckInput): EnforcementResult {
    const violations: string[] = [];
    const waived: string[] = [];

    if (!input.profilePublished) {
      violations.push('Project safety profile not published');
    }

    const rules = input.enforcementRules;
    const checks = input.workerChecks ?? {};

    if (rules.blockAccessWithoutFlha && checks.flha === false) {
      if (this.hasOverride(input, 'training', 'FLHA')) {
        waived.push('FLHA');
      } else {
        violations.push('FLHA required by project profile');
      }
    }

    if (rules.blockAccessWithoutOrientation && checks.orientation === false) {
      if (this.hasOverride(input, 'training', 'ORIENTATION')) {
        waived.push('ORIENTATION');
      } else {
        violations.push('Site orientation required');
      }
    }

    if (input.riskLevel === 'critical' && checks.jha === false) {
      if (this.hasOverride(input, 'zone', input.zoneCode ?? 'SITE')) {
        waived.push('JHA_ZONE');
      } else {
        violations.push('JHA required for critical-risk project');
      }
    }

    return {
      enforced: violations.length === 0,
      violations,
      waivedByOverride: waived,
    };
  }

  private hasOverride(
    input: EnforcementCheckInput,
    ruleType: string,
    ruleKey: string,
  ): boolean {
    return (input.activeOverrides ?? []).some(
      (o) => o.ruleType === ruleType && o.ruleKey === ruleKey,
    );
  }
}
