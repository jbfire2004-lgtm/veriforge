export type RuleViolation = {
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  module: string;
};

export type RuleEvaluationInput = {
  openCapa: number;
  overdueCapa: number;
  criticalHazards: number;
  weakControls: number;
  expiredTraining: number;
  accessDenials30d: number;
  openIncidents: number;
  equipmentFailures: number;
  emergencyActive: boolean;
};

export class CailRuleBasedEngine {
  evaluate(input: RuleEvaluationInput): RuleViolation[] {
    const violations: RuleViolation[] = [];

    if (input.emergencyActive) {
      violations.push({
        ruleId: 'EMERGENCY_ACTIVE',
        severity: 'critical',
        message: 'Active emergency — elevated monitoring required',
        module: 'emergency',
      });
    }
    if (input.overdueCapa > 0) {
      violations.push({
        ruleId: 'CAPA_OVERDUE',
        severity: input.overdueCapa >= 3 ? 'critical' : 'high',
        message: `${input.overdueCapa} overdue corrective action(s)`,
        module: 'corrective_action',
      });
    }
    if (input.criticalHazards > 0) {
      violations.push({
        ruleId: 'HAZARD_CRITICAL_OPEN',
        severity: 'critical',
        message: `${input.criticalHazards} critical published hazard(s) without adequate controls`,
        module: 'hazard',
      });
    }
    if (input.weakControls > 0) {
      violations.push({
        ruleId: 'CONTROL_WEAK',
        severity: 'high',
        message: `${input.weakControls} weak or unmapped control(s)`,
        module: 'control',
      });
    }
    if (input.expiredTraining > 0) {
      violations.push({
        ruleId: 'TRAINING_LAPSE',
        severity: 'high',
        message: `${input.expiredTraining} expired required training record(s)`,
        module: 'training',
      });
    }
    if (input.accessDenials30d >= 5) {
      violations.push({
        ruleId: 'ACCESS_CHRONIC_DENIAL',
        severity: 'medium',
        message: `${input.accessDenials30d} access denials in 30 days`,
        module: 'site_access',
      });
    }
    if (input.openIncidents > 0) {
      violations.push({
        ruleId: 'INCIDENT_OPEN',
        severity: 'high',
        message: `${input.openIncidents} open incident investigation(s)`,
        module: 'incident',
      });
    }
    if (input.equipmentFailures > 0) {
      violations.push({
        ruleId: 'EQUIPMENT_FAILURE_OPEN',
        severity: 'high',
        message: `${input.equipmentFailures} unresolved equipment failure(s)`,
        module: 'equipment',
      });
    }

    return violations;
  }
}
