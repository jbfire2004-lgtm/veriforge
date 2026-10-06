import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CompetencyEvaluateDto {
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
