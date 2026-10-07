import { IsEnum, IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { ProjectComplianceRuleType } from '@prisma/client';
import type { RuleMetadata } from '../project-compliance.types';

export class CreateComplianceRuleDto {
  @IsEnum(ProjectComplianceRuleType)
  ruleType!: ProjectComplianceRuleType;

  @IsInt()
  @IsPositive()
  requiredCredentialTypeId!: number;

  @IsOptional()
  metadata?: RuleMetadata;
}
