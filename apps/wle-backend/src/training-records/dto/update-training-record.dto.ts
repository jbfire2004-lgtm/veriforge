import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateTrainingRecordDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  workerId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  certificationId?: number;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  certificateNumber?: string;

  /** Issuing training organization. Omit to leave unchanged; send null to clear. */
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' || value === undefined
      ? value === null
        ? null
        : undefined
      : Number(value),
  )
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsInt()
  providerId?: number | null;
}
