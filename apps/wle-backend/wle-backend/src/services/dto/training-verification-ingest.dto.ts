import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class TrainingVerificationIngestDto {
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

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsInt()
  certificationId!: number;

  @IsOptional()
  @IsInt()
  providerId?: number;

  @IsOptional()
  @IsInt()
  trainingProviderId?: number;

  @IsOptional()
  @IsInt()
  courseId?: number;

  @IsOptional()
  @IsInt()
  instructorId?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsInt()
  ingestionRunId?: number;

  @IsOptional()
  @IsString()
  jurisdictionCode?: string;
}
