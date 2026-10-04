import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrainingIngestRowDto {
  @Type(() => Number)
  @IsInt()
  workerId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  certificationId?: number;

  @IsOptional()
  @IsString()
  certificationCode?: string;

  @IsOptional()
  @IsString()
  certificationName?: string;

  @IsDateString()
  issuedAt: string;

  @IsDateString()
  expiresAt: string;

  @IsOptional()
  @IsString()
  providerName?: string;

  /** Card / certificate id from issuer (optional; feeds verification `certificateNumber` checks). */
  @IsOptional()
  @IsString()
  @MaxLength(512)
  certificateNumber?: string;
}

export class IngestTrainingRowsDto {
  @Type(() => Number)
  @IsInt()
  companyId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingIngestRowDto)
  rows: TrainingIngestRowDto[];
}
