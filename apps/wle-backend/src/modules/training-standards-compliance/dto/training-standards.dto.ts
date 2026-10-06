import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TrainingValidationOutcome } from '@prisma/client';

export class ValidateTrainingDto {
  @IsInt()
  trainingRecordId!: number;

  @IsOptional()
  @IsString()
  jurisdictionCode?: string;
}

export class ValidateProviderDto {
  @IsInt()
  trainingProviderId!: number;

  @IsOptional()
  @IsString()
  jurisdictionCode?: string;
}

export class ValidateInstructorDto {
  @IsInt()
  instructorId!: number;

  @IsOptional()
  @IsString()
  courseCode?: string;

  @IsOptional()
  @IsString()
  jurisdictionCode?: string;
}

export class ValidateCertificateDto {
  @IsOptional()
  @IsString()
  certificateQrToken?: string;

  @IsOptional()
  @IsInt()
  trainingRecordId?: number;
}

export class ApprovalWorkflowDto {
  @IsInt()
  validationResultId!: number;

  @IsEnum(TrainingValidationOutcome)
  outcome!: TrainingValidationOutcome;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectionWorkflowDto {
  @IsInt()
  validationResultId!: number;

  @IsString({ each: true })
  rejectionCodes!: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
