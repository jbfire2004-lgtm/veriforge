import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class EvaluateCompetencyDto {
  @IsInt()
  workerId!: number;

  @IsInt()
  equipmentId!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  score!: number;

  @IsBoolean()
  passed!: boolean;

  @IsOptional()
  @IsDateString()
  evaluationDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  evidenceNotes?: string;

  @IsOptional()
  @IsArray()
  evidencePhotos?: string[];

  @IsOptional()
  @IsString()
  workerSignature?: string;

  @IsOptional()
  @IsString()
  evaluatorSignature?: string;
}

export class CheckCompetencyDto {
  @IsInt()
  workerId!: number;

  @IsInt()
  equipmentId!: number;
}

export class UpsertCompetencyRequirementDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  minPassingScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  expiryDays?: number | null;

  @IsOptional()
  @IsBoolean()
  requireEvaluation?: boolean;

  @IsOptional()
  @IsInt()
  certificationId?: number | null;
}
