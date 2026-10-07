import {
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTrainingRecordDto {
  @Type(() => Number)
  @IsInt()
  workerId: number;

  @Type(() => Number)
  @IsInt()
  certificationId: number;

  @IsDateString()
  issuedAt: string;

  @IsDateString()
  expiresAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  certificateNumber?: string;

  /** Training school / issuer (certificate source). Not the worker's employer. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  providerId?: number;
}
