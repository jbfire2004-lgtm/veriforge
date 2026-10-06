import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class TrainingIngestDto {
  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsString()
  workerEmail?: string;

  @IsOptional()
  @IsString()
  workerPhone?: string;

  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsInt()
  certificationId!: number;

  @IsOptional()
  @IsInt()
  providerId?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;
}
