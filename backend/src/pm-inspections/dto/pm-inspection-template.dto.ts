import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TemplateScoringRulesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  failThresholdPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reviewThresholdRisk?: number;
}

export class RequiredSignatureDto {
  @IsString()
  @MinLength(1)
  role!: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class ChecklistItemDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  type!: string;

  @IsOptional()
  required?: boolean;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  critical?: boolean;

  @IsOptional()
  showIf?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  options?: string[];
}

export class CreatePmInspectionTemplateDto {
  @IsInt()
  companyId!: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  scoringMode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items!: ChecklistItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateScoringRulesDto)
  scoringRules?: TemplateScoringRulesDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredSignatureDto)
  requiredSignatures?: RequiredSignatureDto[];
}

export class UpdatePmInspectionTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  scoringMode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items?: ChecklistItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateScoringRulesDto)
  scoringRules?: TemplateScoringRulesDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredSignatureDto)
  requiredSignatures?: RequiredSignatureDto[];
}
