import { Injectable } from '@nestjs/common';
import {
  ProviderApprovalStatus,
  ProviderQualificationRule,
  TrainingProvider,
} from '@prisma/client';

export interface ProviderValidationIssue {
  code: string;
  message: string;
}

@Injectable()
export class ProviderQualificationValidator {
  validate(
    provider: TrainingProvider,
    rules: ProviderQualificationRule[],
    matchedStandardCodes: string[],
  ): { valid: boolean; issues: ProviderValidationIssue[] } {
    const issues: ProviderValidationIssue[] = [];
    const matched = new Set(matchedStandardCodes);

    if (!provider.active) {
      issues.push({
        code: 'PROVIDER_INACTIVE',
        message: 'Provider is inactive',
      });
    }
    if (provider.approvalStatus !== ProviderApprovalStatus.APPROVED) {
      issues.push({
        code: 'PROVIDER_NOT_APPROVED',
        message: `Approval status is ${provider.approvalStatus}`,
      });
    }

    const activeRules = rules.filter((r) => r.active);
    for (const rule of activeRules) {
      if (
        rule.requiredApprovalStatus &&
        provider.approvalStatus !== rule.requiredApprovalStatus
      ) {
        issues.push({
          code: 'PROVIDER_NOT_APPROVED',
          message: `Rule ${rule.ruleKey}: requires ${rule.requiredApprovalStatus}`,
        });
      }
      for (const code of rule.requiredStandardCodes) {
        if (!matched.has(code)) {
          issues.push({
            code: 'CSA_STANDARD_MISSING',
            message: `Provider rule ${rule.ruleKey}: missing ${code}`,
          });
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}
