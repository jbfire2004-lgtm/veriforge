export type AssignmentRuleInput = {
  workerId: number;
  equipmentId: number;
  hasAuthorization: boolean;
  authorizationExpired: boolean;
  certificationValid: boolean;
  inspectionCurrent: boolean;
  conditionScore: number;
  minConditionScore?: number;
  underLoto: boolean;
};

export type AssignmentRuleResult = {
  allowed: boolean;
  failures: string[];
};

export class EquipmentAssignmentEngine {
  validate(input: AssignmentRuleInput): AssignmentRuleResult {
    const failures: string[] = [];
    const minScore = input.minConditionScore ?? 50;

    if (!input.hasAuthorization) {
      failures.push('Worker lacks equipment authorization');
    }
    if (input.authorizationExpired) {
      failures.push('Equipment authorization expired');
    }
    if (!input.certificationValid) {
      failures.push('Equipment certification expired or missing');
    }
    if (!input.inspectionCurrent) {
      failures.push('Required equipment inspection overdue');
    }
    if (input.conditionScore < minScore) {
      failures.push(
        `Equipment condition score ${input.conditionScore} below threshold ${minScore}`,
      );
    }
    if (input.underLoto) {
      failures.push('Equipment is under active lockout/tagout');
    }

    return { allowed: failures.length === 0, failures };
  }
}
