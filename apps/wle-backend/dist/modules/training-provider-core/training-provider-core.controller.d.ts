import { CertificateUploadDto, CreateTrainingCourseDto, CreateTrainingInstructorDto, CreateTrainingProviderDto, InstructorOnboardingDto, IssueCertificateDto, ProviderApprovalDto, ProviderOnboardingDto, RequestApprovalDto, SignCertificateDto, UpdateTrainingProviderProfileDto, UploadClassListDto, UploadTrainingDto } from './dto/training-provider.dto';
import { TrainingProviderPermission } from './training-provider-permissions';
import { TrainingProviderAccessService, PortalUser } from './training-provider-access.service';
import { TrainingProviderCoreService } from './training-provider-core.service';
type ReqUser = {
    user?: PortalUser;
};
export declare class TrainingProviderCoreController {
    private readonly svc;
    private readonly access;
    constructor(svc: TrainingProviderCoreService, access: TrainingProviderAccessService);
    portalMe(req: ReqUser): Promise<{
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
    onboardInstructor(providerId: number, dto: InstructorOnboardingDto, req: ReqUser): Promise<{
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
    getProvider(id: number, req: ReqUser): Promise<{
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
    }>;
    dashboard(req: ReqUser, providerId?: string): Promise<{
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
    updateProfile(id: number, dto: UpdateTrainingProviderProfileDto, req: ReqUser): Promise<{
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
    approvalStatus(id: number, req: ReqUser): Promise<{
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
    requestApproval(id: number, dto: RequestApprovalDto, req: ReqUser): Promise<{
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderApprovalStatus;
        reviewedBy: number | null;
        notes: string | null;
        createdAt: Date;
    }>;
    approve(id: number, dto: ProviderApprovalDto, req: ReqUser): Promise<{
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderApprovalStatus;
        reviewedBy: number | null;
        notes: string | null;
        createdAt: Date;
    }>;
    compliance(id: number, req: ReqUser): Promise<{
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderComplianceLevel;
        score: number | null;
        gaps: import(".prisma/client").Prisma.JsonValue | null;
        assessedAt: Date;
        notes: string | null;
    }[]>;
    assessCompliance(id: number, notes: string | undefined, req: ReqUser): Promise<{
        gaps: string[];
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderComplianceLevel;
        score: number | null;
        assessedAt: Date;
        notes: string | null;
    }>;
    listCourses(providerId: number, req: ReqUser): Promise<({
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
    addCourse(providerId: number, dto: CreateTrainingCourseDto, req: ReqUser): Promise<{
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
    listInstructors(providerId: number, req: ReqUser): Promise<({
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
    addInstructor(providerId: number, dto: CreateTrainingInstructorDto, req: ReqUser): Promise<{
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
    instructorMe(req: ReqUser): Promise<{
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
    validateInstructor(id: number): Promise<{
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
    uploadTraining(providerId: number, dto: UploadTrainingDto, req: ReqUser): Promise<{
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
    uploadClassList(providerId: number, dto: UploadClassListDto, req: ReqUser): Promise<{
        uploaded: number;
        total: number;
        results: {
            workerId: number;
            ok: boolean;
            recordId?: number;
            error?: string;
        }[];
    }>;
    issueCertificate(providerId: number, dto: IssueCertificateDto, req: ReqUser): Promise<{
        digitalCertificate: import("./training-provider-certificate.service").DigitalCertificatePayload;
        qrDataUrl: string;
    }>;
    attachCertificate(recordId: number, dto: CertificateUploadDto, req: ReqUser): Promise<{
        digitalCertificate: import("./training-provider-certificate.service").DigitalCertificatePayload;
        qrDataUrl: string;
    }>;
    signCertificate(recordId: number, dto: SignCertificateDto, req: ReqUser): Promise<{
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
    history(providerId: number, limit?: string, req?: ReqUser): Promise<({
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
}
export {};
