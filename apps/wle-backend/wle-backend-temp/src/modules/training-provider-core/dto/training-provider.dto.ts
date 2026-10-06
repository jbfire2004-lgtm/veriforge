import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProviderApprovalStatus } from '@prisma/client';

export class CreateTrainingProviderDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateTrainingProviderProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

export class CourseStandardDto {
  @IsString()
  standardKey!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minScore?: number;
}

export class CreateTrainingCourseDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  certificationId?: number;

  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @IsOptional()
  @IsInt()
  validityDays?: number;

  @IsOptional()
  @IsString()
  contentText?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseStandardDto)
  standards?: CourseStandardDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  instructorIds?: number[];
}

export class CreateTrainingInstructorDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifiedCourseCodes?: string[];

  @IsOptional()
  @IsDateString()
  qualificationExpiresAt?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  courseIds?: number[];
}

export class UploadTrainingDto {
  @IsInt()
  workerId!: number;

  @IsInt()
  courseId!: number;

  @IsOptional()
  @IsInt()
  instructorId?: number;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  certificateNumber?: string;
}

export class IssueCertificateDto {
  @IsInt()
  trainingRecordId!: number;

  @IsOptional()
  @IsUrl()
  certificateUrl?: string;
}

export class ProviderApprovalDto {
  @IsEnum(ProviderApprovalStatus)
  status!: ProviderApprovalStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CertificateUploadDto {
  @IsUrl()
  certificateUrl!: string;
}

export class ProviderOnboardingDto extends CreateTrainingProviderDto {
  @IsEmail()
  adminEmail!: string;

  @IsString()
  adminPassword!: string;

  @IsString()
  adminUsername!: string;
}

export class InstructorOnboardingDto extends CreateTrainingInstructorDto {
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @IsOptional()
  @IsString()
  userPassword?: string;

  @IsOptional()
  @IsString()
  userUsername?: string;
}

export class UploadClassListDto {
  @IsInt()
  courseId!: number;

  @IsArray()
  @IsInt({ each: true })
  workerIds!: number[];

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class SignCertificateDto {
  @IsString()
  signatureName!: string;

  @IsOptional()
  @IsDateString()
  signedAt?: string;
}

export class RequestApprovalDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
