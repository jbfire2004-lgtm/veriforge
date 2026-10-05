import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingPipelineService } from '../vera-core/training-pipeline.service';
import { TrainingWalletIntegrationService } from '../vera-core/training-wallet-integration.service';
import { TrainingProviderCertificateService } from './training-provider-certificate.service';
import { TrainingProviderComplianceService } from './training-provider-compliance.service';
import { TrainingStandardsComplianceService } from '../training-standards-compliance/training-standards-compliance.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { CreateTrainingCourseDto, CreateTrainingInstructorDto, CreateTrainingProviderDto, IssueCertificateDto, ProviderApprovalDto, UpdateTrainingProviderProfileDto, UploadTrainingDto } from './dto/training-provider.dto';
type AuthUser = {
    id: number;
    role: UserRole;
    trainingProviderId?: number | null;
    instructorId?: number | null;
};
export declare class TrainingProviderCoreService {
    private readonly prisma;
    private readonly pipeline;
    private readonly compliance;
    private readonly certificates;
    private readonly standardsCompliance;
    private readonly walletIntegration;
    private readonly audit;
    constructor(prisma: PrismaService, pipeline: TrainingPipelineService, compliance: TrainingProviderComplianceService, certificates: TrainingProviderCertificateService, standardsCompliance: TrainingStandardsComplianceService, walletIntegration: TrainingWalletIntegrationService, audit: AuditLogService);
    dashboard(providerId: number): Promise<{
        provider: {
            id: number;
            name: string;
            code: string | null;
            email: string | null;
            phone: string | null;
            website: string | null;
            address: string | null;
            logoUrl: string | null;
            qrToken: string | null;
            approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        stats: {
            activeCourses: number;
            activeInstructors: number;
            trainingRecordsIssued: number;
        };
        compliance: {
            id: number;
            providerId: number;
            status: import(".prisma/client").$Enums.ProviderComplianceLevel;
            score: number | null;
            gaps: import(".prisma/client").Prisma.JsonValue | null;
            assessedAt: Date;
            notes: string | null;
        };
        recentRecords: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            certification: {
                id: number;
                name: string;
            };
            course: {
                id: number;
                name: string;
                code: string;
            };
        } & {
            id: number;
            workerId: number;
            certificationId: number;
            providerId: number | null;
            trainingProviderId: number | null;
            courseId: number | null;
            instructorId: number | null;
            companyId: number | null;
            projectId: number | null;
            expiresAt: Date | null;
            issuedAt: Date;
            certificateNumber: string | null;
            certificateUrl: string | null;
            certificateQrToken: string | null;
            certificateSignedAt: Date | null;
            certificateSignedByInstructorId: number | null;
            completedAt: Date | null;
            lastVerificationStatus: string | null;
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        })[];
    }>;
    listProviders(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            trainingRecords: number;
            instructors: number;
            courses: number;
        };
    } & {
        id: number;
        name: string;
        code: string | null;
        email: string | null;
        phone: string | null;
        website: string | null;
        address: string | null;
        logoUrl: string | null;
        qrToken: string | null;
        approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createProvider(dto: CreateTrainingProviderDto): Promise<{
        id: number;
        name: string;
        code: string | null;
        email: string | null;
        phone: string | null;
        website: string | null;
        address: string | null;
        logoUrl: string | null;
        qrToken: string | null;
        approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProvider(id: number): import(".prisma/client").Prisma.Prisma__TrainingProviderClient<{
        instructors: {
            id: number;
            providerId: number;
            firstName: string;
            lastName: string;
            email: string | null;
            licenseNumber: string | null;
            qualifiedCourseCodes: string[];
            qualificationExpiresAt: Date | null;
            qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            userId: number | null;
            active: boolean;
            createdAt: Date;
        }[];
        courses: ({
            standards: {
                id: number;
                courseId: number;
                standardKey: string;
                title: string;
                description: string | null;
                required: boolean;
                minScore: number | null;
            }[];
        } & {
            id: number;
            providerId: number;
            certificationId: number | null;
            code: string;
            name: string;
            description: string | null;
            durationHours: number | null;
            validityDays: number | null;
            contentText: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        approvals: {
            id: number;
            providerId: number;
            status: import(".prisma/client").$Enums.ProviderApprovalStatus;
            reviewedBy: number | null;
            notes: string | null;
            createdAt: Date;
        }[];
        complianceStatuses: {
            id: number;
            providerId: number;
            status: import(".prisma/client").$Enums.ProviderComplianceLevel;
            score: number | null;
            gaps: import(".prisma/client").Prisma.JsonValue | null;
            assessedAt: Date;
            notes: string | null;
        }[];
    } & {
        id: number;
        name: string;
        code: string | null;
        email: string | null;
        phone: string | null;
        website: string | null;
        address: string | null;
        logoUrl: string | null;
        qrToken: string | null;
        approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updateProfile(providerId: number, dto: UpdateTrainingProviderProfileDto): Promise<{
        id: number;
        name: string;
        code: string | null;
        email: string | null;
        phone: string | null;
        website: string | null;
        address: string | null;
        logoUrl: string | null;
        qrToken: string | null;
        approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    approveProvider(providerId: number, dto: ProviderApprovalDto, reviewerId: number): Promise<{
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderApprovalStatus;
        reviewedBy: number | null;
        notes: string | null;
        createdAt: Date;
    }>;
    listCourses(providerId: number): import(".prisma/client").Prisma.PrismaPromise<({
        certification: {
            id: number;
            name: string;
            code: string | null;
            description: string | null;
        };
        standards: {
            id: number;
            courseId: number;
            standardKey: string;
            title: string;
            description: string | null;
            required: boolean;
            minScore: number | null;
        }[];
        instructors: {
            id: number;
            providerId: number;
            firstName: string;
            lastName: string;
            email: string | null;
            licenseNumber: string | null;
            qualifiedCourseCodes: string[];
            qualificationExpiresAt: Date | null;
            qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            userId: number | null;
            active: boolean;
            createdAt: Date;
        }[];
    } & {
        id: number;
        providerId: number;
        certificationId: number | null;
        code: string;
        name: string;
        description: string | null;
        durationHours: number | null;
        validityDays: number | null;
        contentText: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    addCourse(providerId: number, dto: CreateTrainingCourseDto): Promise<{
        certification: {
            id: number;
            name: string;
            code: string | null;
            description: string | null;
        };
        standards: {
            id: number;
            courseId: number;
            standardKey: string;
            title: string;
            description: string | null;
            required: boolean;
            minScore: number | null;
        }[];
        instructors: {
            id: number;
            providerId: number;
            firstName: string;
            lastName: string;
            email: string | null;
            licenseNumber: string | null;
            qualifiedCourseCodes: string[];
            qualificationExpiresAt: Date | null;
            qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            userId: number | null;
            active: boolean;
            createdAt: Date;
        }[];
    } & {
        id: number;
        providerId: number;
        certificationId: number | null;
        code: string;
        name: string;
        description: string | null;
        durationHours: number | null;
        validityDays: number | null;
        contentText: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listInstructors(providerId: number): import(".prisma/client").Prisma.PrismaPromise<({
        courses: {
            id: number;
            providerId: number;
            certificationId: number | null;
            code: string;
            name: string;
            description: string | null;
            durationHours: number | null;
            validityDays: number | null;
            contentText: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        providerId: number;
        firstName: string;
        lastName: string;
        email: string | null;
        licenseNumber: string | null;
        qualifiedCourseCodes: string[];
        qualificationExpiresAt: Date | null;
        qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
        userId: number | null;
        active: boolean;
        createdAt: Date;
    })[]>;
    addInstructor(providerId: number, dto: CreateTrainingInstructorDto): Promise<{
        courses: {
            id: number;
            providerId: number;
            certificationId: number | null;
            code: string;
            name: string;
            description: string | null;
            durationHours: number | null;
            validityDays: number | null;
            contentText: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        providerId: number;
        firstName: string;
        lastName: string;
        email: string | null;
        licenseNumber: string | null;
        qualifiedCourseCodes: string[];
        qualificationExpiresAt: Date | null;
        qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
        userId: number | null;
        active: boolean;
        createdAt: Date;
    }>;
    validateInstructorQualification(instructorId: number): Promise<{
        instructorId: number;
        qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
        valid: boolean;
        courseChecks: {
            valid: boolean;
            reason?: string;
            courseId: number;
            courseCode: string;
        }[];
    }>;
    uploadTraining(providerId: number, dto: UploadTrainingDto): Promise<{
        record: {
            worker: {
                id: number;
                firstName: string;
                lastName: string;
                status: string;
                companyId: number | null;
                photoUrl: string | null;
                userId: number | null;
                email: string | null;
                phone: string | null;
                dateOfBirth: Date | null;
                qrToken: string | null;
                unionNumber: string | null;
            };
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
            course: {
                id: number;
                providerId: number;
                certificationId: number | null;
                code: string;
                name: string;
                description: string | null;
                durationHours: number | null;
                validityDays: number | null;
                contentText: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            workerId: number;
            certificationId: number;
            providerId: number | null;
            trainingProviderId: number | null;
            courseId: number | null;
            instructorId: number | null;
            companyId: number | null;
            projectId: number | null;
            expiresAt: Date | null;
            issuedAt: Date;
            certificateNumber: string | null;
            certificateUrl: string | null;
            certificateQrToken: string | null;
            certificateSignedAt: Date | null;
            certificateSignedByInstructorId: number | null;
            completedAt: Date | null;
            lastVerificationStatus: string | null;
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        };
        verificationPath: string;
        validation: import("../training-standards-compliance/training-standards-compliance.service").ValidationReport;
        walletTraining: import("../vera-core/training-wallet.mapper").WalletTrainingRecordDto;
    }>;
    issueCertificate(providerId: number, dto: IssueCertificateDto, actorId?: number): Promise<{
        digitalCertificate: import("./training-provider-certificate.service").DigitalCertificatePayload;
        qrDataUrl: string;
    }>;
    validateCertificate(token: string): Promise<{
        valid: boolean;
        reason: string;
        expired?: undefined;
        record?: undefined;
    } | {
        valid: boolean;
        expired: boolean;
        record: {
            id: number;
            workerId: number;
            workerName: string;
            certification: string;
            course: string;
            provider: string;
            instructor: string;
            issuedAt: Date;
            expiresAt: Date;
            certificateNumber: string;
            certificateUrl: string;
        };
        reason?: undefined;
    }>;
    certificateBundle(recordId: number): Promise<{
        digitalCertificate: import("./training-provider-certificate.service").DigitalCertificatePayload;
        qrDataUrl: string;
    }>;
    attachCertificateUrl(recordId: number, certificateUrl: string): Promise<{
        digitalCertificate: import("./training-provider-certificate.service").DigitalCertificatePayload;
        qrDataUrl: string;
    }>;
    assessCompliance(providerId: number, notes?: string): Promise<{
        gaps: string[];
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderComplianceLevel;
        score: number | null;
        assessedAt: Date;
        notes: string | null;
    }>;
    getComplianceHistory(providerId: number): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderComplianceLevel;
        score: number | null;
        gaps: import(".prisma/client").Prisma.JsonValue | null;
        assessedAt: Date;
        notes: string | null;
    }[]>;
    trainingHistory(providerId: number, limit?: number): import(".prisma/client").Prisma.PrismaPromise<({
        worker: {
            id: number;
            email: string;
            firstName: string;
            lastName: string;
        };
        company: {
            id: number;
            name: string;
        };
        certification: {
            id: number;
            name: string;
            code: string | null;
            description: string | null;
        };
        project: {
            id: number;
            name: string;
        };
        instructor: {
            id: number;
            providerId: number;
            firstName: string;
            lastName: string;
            email: string | null;
            licenseNumber: string | null;
            qualifiedCourseCodes: string[];
            qualificationExpiresAt: Date | null;
            qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            userId: number | null;
            active: boolean;
            createdAt: Date;
        };
        course: {
            id: number;
            providerId: number;
            certificationId: number | null;
            code: string;
            name: string;
            description: string | null;
            durationHours: number | null;
            validityDays: number | null;
            contentText: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        workerId: number;
        certificationId: number;
        providerId: number | null;
        trainingProviderId: number | null;
        courseId: number | null;
        instructorId: number | null;
        companyId: number | null;
        projectId: number | null;
        expiresAt: Date | null;
        issuedAt: Date;
        certificateNumber: string | null;
        certificateUrl: string | null;
        certificateQrToken: string | null;
        certificateSignedAt: Date | null;
        certificateSignedByInstructorId: number | null;
        completedAt: Date | null;
        lastVerificationStatus: string | null;
        lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
        verifiedAt: Date | null;
        ingestionRunId: number | null;
    })[]>;
    assertAccess(user: AuthUser, providerId: number): Promise<void>;
    resolveProviderId(user: AuthUser, queryProviderId?: number): Promise<number>;
    private instructorProviderIdForUser;
    private requireProvider;
}
export {};
