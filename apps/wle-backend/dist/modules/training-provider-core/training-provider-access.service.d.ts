import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Phase1MonitoringService } from '../../common/monitoring/phase1-monitoring.service';
import { TrainingProviderPermission } from './training-provider-permissions';
import { InstructorOnboardingDto, ProviderOnboardingDto, RequestApprovalDto, SignCertificateDto, UploadClassListDto, UploadTrainingDto } from './dto/training-provider.dto';
import { TrainingProviderCoreService } from './training-provider-core.service';
import { TrainingWalletIntegrationService } from '../vera-core/training-wallet-integration.service';
export type PortalUser = {
    id: number;
    role: UserRole;
    trainingProviderId?: number | null;
    instructorId?: number | null;
};
export declare class TrainingProviderAccessService {
    private readonly prisma;
    private readonly monitoring;
    private readonly walletIntegration;
    private readonly providerCore;
    constructor(prisma: PrismaService, monitoring: Phase1MonitoringService, walletIntegration: TrainingWalletIntegrationService, providerCore: TrainingProviderCoreService);
    requirePermission(user: PortalUser, permission: TrainingProviderPermission): void;
    resolveProviderId(user: PortalUser, queryProviderId?: number): Promise<number>;
    getPortalContext(user: PortalUser): Promise<{
        user: {
            id: number;
            role: import(".prisma/client").$Enums.UserRole;
            trainingProviderId: number;
            instructorId: any;
        };
        permissions: TrainingProviderPermission[];
        provider: any;
        instructor: any;
        dashboardPath: string;
    }>;
    onboardProvider(dto: ProviderOnboardingDto): Promise<{
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
        user: {
            id: number;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    onboardInstructor(providerId: number, dto: InstructorOnboardingDto, actor: PortalUser): Promise<{
        instructor: {
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
        };
        user: any;
    }>;
    requestApproval(providerId: number, dto: RequestApprovalDto, actor: PortalUser): Promise<{
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderApprovalStatus;
        reviewedBy: number | null;
        notes: string | null;
        createdAt: Date;
    }>;
    getApprovalStatus(providerId: number, actor: PortalUser): Promise<{
        provider: {
            id: number;
            active: boolean;
            approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
        };
        approvals: {
            id: number;
            providerId: number;
            status: import(".prisma/client").$Enums.ProviderApprovalStatus;
            reviewedBy: number | null;
            notes: string | null;
            createdAt: Date;
        }[];
    }>;
    uploadClassList(providerId: number, dto: UploadClassListDto, actor: PortalUser): Promise<{
        uploaded: number;
        total: number;
        results: {
            workerId: number;
            ok: boolean;
            recordId?: number;
            error?: string;
        }[];
    }>;
    signCertificate(recordId: number, dto: SignCertificateDto, actor: PortalUser): Promise<{
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
            certificateSignedBy: {
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
        signature: {
            name: string;
            signedAt: string;
            instructorId: number;
        };
    }>;
    uploadTrainingForActor(providerId: number, dto: UploadTrainingDto, actor: PortalUser): Promise<{
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
    instructorProfile(actor: PortalUser): Promise<{
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
    trainingHistoryForActor(providerId: number, actor: PortalUser, limit?: number): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
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
    })[]>;
    private resolveInstructorIdForActor;
    private resolveInstructorRecord;
    private audit;
}
