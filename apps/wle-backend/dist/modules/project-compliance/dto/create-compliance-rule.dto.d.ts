import { ProjectComplianceRuleType } from '@prisma/client';
import type { RuleMetadata } from '../project-compliance.types';
export declare class CreateComplianceRuleDto {
    ruleType: ProjectComplianceRuleType;
    requiredCredentialTypeId: number;
    metadata?: RuleMetadata;
}
