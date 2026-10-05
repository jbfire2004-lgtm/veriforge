import { ProviderApprovalStatus } from '@prisma/client';
export declare class CreateTrainingProviderDto {
    name: string;
    code?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
}
export declare class UpdateTrainingProviderProfileDto {
    name?: string;
    phone?: string;
    website?: string;
    address?: string;
    logoUrl?: string;
}
export declare class CourseStandardDto {
    standardKey: string;
    title: string;
    description?: string;
    required?: boolean;
    minScore?: number;
}
export declare class CreateTrainingCourseDto {
    code: string;
    name: string;
    description?: string;
    certificationId?: number;
    durationHours?: number;
    validityDays?: number;
    contentText?: string;
    standards?: CourseStandardDto[];
    instructorIds?: number[];
}
export declare class CreateTrainingInstructorDto {
    firstName: string;
    lastName: string;
    email?: string;
    licenseNumber?: string;
    qualifiedCourseCodes?: string[];
    qualificationExpiresAt?: string;
    courseIds?: number[];
}
export declare class UploadTrainingDto {
    workerId: number;
    courseId: number;
    instructorId?: number;
    companyId?: number;
    projectId?: number;
    equipmentId?: number;
    issuedAt?: string;
    expiresAt?: string;
    certificateNumber?: string;
}
export declare class IssueCertificateDto {
    trainingRecordId: number;
    certificateUrl?: string;
}
export declare class ProviderApprovalDto {
    status: ProviderApprovalStatus;
    notes?: string;
}
export declare class CertificateUploadDto {
    certificateUrl: string;
}
export declare class ProviderOnboardingDto extends CreateTrainingProviderDto {
    adminEmail: string;
    adminPassword: string;
    adminUsername: string;
}
export declare class InstructorOnboardingDto extends CreateTrainingInstructorDto {
    userEmail?: string;
    userPassword?: string;
    userUsername?: string;
}
export declare class UploadClassListDto {
    courseId: number;
    workerIds: number[];
    companyId?: number;
    projectId?: number;
    issuedAt?: string;
    expiresAt?: string;
}
export declare class SignCertificateDto {
    signatureName: string;
    signedAt?: string;
}
export declare class RequestApprovalDto {
    notes?: string;
}
