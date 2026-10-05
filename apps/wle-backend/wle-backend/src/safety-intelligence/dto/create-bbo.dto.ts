import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  BboBehaviorCategory,
  CailRiskCategory,
  CailSeverity,
  ObservationPolarity,
} from '@prisma/client';

export class CreateBboDto {
  @IsInt()
  projectId!: number;

  @IsEnum(ObservationPolarity)
  polarity!: ObservationPolarity;

  @IsString()
  behaviorDescription!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  workActivity?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  workersObservedCount?: number;

  @IsOptional()
  @IsEnum(BboBehaviorCategory)
  behaviorCategory?: BboBehaviorCategory;

  @IsOptional()
  @IsString()
  safeBehaviors?: string;

  @IsOptional()
  @IsString()
  atRiskBehaviors?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  antecedents?: string[];

  @IsOptional()
  @IsBoolean()
  feedbackGiven?: boolean;

  @IsOptional()
  @IsString()
  feedbackNotes?: string;

  @IsOptional()
  @IsString()
  workerResponse?: string;

  @IsOptional()
  @IsString()
  actionAgreed?: string;

  @IsOptional()
  @IsInt()
  actionOwnerUserId?: number;

  @IsOptional()
  @IsDateString()
  actionDueAt?: string;

  @IsOptional()
  @IsBoolean()
  steeringEscalate?: boolean;

  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsInt()
  ownerCompanyId?: number;

  @IsOptional()
  @IsInt()
  assignedUserId?: number;

  @IsOptional()
  @IsEnum(CailSeverity)
  severity?: CailSeverity;

  @IsOptional()
  @IsEnum(CailRiskCategory)
  riskCategory?: CailRiskCategory;

  @IsOptional()
  @IsDateString()
  observedAt?: string;
}
