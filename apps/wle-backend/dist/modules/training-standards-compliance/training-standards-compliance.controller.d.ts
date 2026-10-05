import { TrainingValidationOutcome } from '@prisma/client';
import { ApprovalWorkflowDto, RejectionWorkflowDto, ValidateCertificateDto, ValidateInstructorDto, ValidateProviderDto, ValidateTrainingDto } from './dto/training-standards.dto';
import { TrainingStandardsComplianceService } from './training-standards-compliance.service';
import { StandardsCatalogService } from './standards-catalog.service';
import { RegulatoryDecisionService } from './regulatory/regulatory-decision.service';
import { RegulatoryEquivalencyService } from './regulatory/regulatory-equivalency.service';
import { RegulatoryDecisionBodyDto } from './dto/regulatory-decision.dto';
type ReqUser = {
    user?: {
        id: number;
    };
};
export declare class TrainingStandardsComplianceController {
    private readonly svc;
    private readonly catalog;
    private readonly regulatoryDecision;
    private readonly regulatoryEquivalency;
    constructor(svc: TrainingStandardsComplianceService, catalog: StandardsCatalogService, regulatoryDecision: RegulatoryDecisionService, regulatoryEquivalency: RegulatoryEquivalencyService);
    dashboard(): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        needsReview: number;
        recent: ({
            trainingRecord: {
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
            rejections: ({
                rejectionReason: {
                    id: number;
                    code: string;
                    title: string;
                    description: string | null;
                    severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
                    category: import(".prisma/client").$Enums.TrainingRejectionCategory;
                    active: boolean;
                };
            } & {
                validationResultId: number;
                rejectionReasonId: number;
                message: string | null;
            })[];
        } & {
            id: number;
            subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
            outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
            score: number | null;
            jurisdictionCode: string | null;
            matchedStandardCodes: string[];
            missingStandardCodes: string[];
            details: import(".prisma/client").Prisma.JsonValue | null;
            validatedAt: Date;
            validatedBy: number | null;
            trainingRecordId: number | null;
            trainingProviderId: number | null;
            instructorId: number | null;
            courseId: number | null;
            certificateQrToken: string | null;
        })[];
    }>;
    listStandards(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        code: string;
        title: string;
        kind: import(".prisma/client").$Enums.TrainingStandardKind;
        jurisdictionCode: string | null;
        description: string | null;
        keywords: string[];
        defaultValidityDays: number | null;
        active: boolean;
        createdAt: Date;
    }[]>;
    rejectionReasons(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        code: string;
        title: string;
        description: string | null;
        severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
        category: import(".prisma/client").$Enums.TrainingRejectionCategory;
        active: boolean;
    }[]>;
    validateTraining(dto: ValidateTrainingDto, req: ReqUser): Promise<import("./training-standards-compliance.service").ValidationReport>;
    postRegulatoryDecision(dto: RegulatoryDecisionBodyDto, req: ReqUser): Promise<import("./regulatory/regulatory-decision.types").RegulatoryDecision>;
    latestRegulatoryDecision(trainingRecordId: number): Promise<import("./regulatory/regulatory-decision.types").RegulatoryDecision>;
    listRegulatoryEquivalencies(): Promise<{
        id: number;
        fromJurisdiction: string;
        toJurisdiction: string;
        standardCode: string;
        notes: string | null;
        active: boolean;
        createdAt: Date;
    }[]>;
    validateProvider(dto: ValidateProviderDto, req: ReqUser): Promise<import("./training-standards-compliance.service").ValidationReport>;
    validateInstructor(dto: ValidateInstructorDto, req: ReqUser): Promise<import("./training-standards-compliance.service").ValidationReport>;
    validateCertificate(dto: ValidateCertificateDto, req: ReqUser): Promise<import("./training-standards-compliance.service").ValidationReport>;
    getResults(trainingRecordId?: string, trainingProviderId?: string, outcome?: TrainingValidationOutcome, limit?: string): import(".prisma/client").Prisma.PrismaPromise<({
        trainingRecord: {
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
        trainingProvider: {
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
        rejections: ({
            rejectionReason: {
                id: number;
                code: string;
                title: string;
                description: string | null;
                severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
                category: import(".prisma/client").$Enums.TrainingRejectionCategory;
                active: boolean;
            };
        } & {
            validationResultId: number;
            rejectionReasonId: number;
            message: string | null;
        })[];
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    })[]>;
    getResult(id: number): Promise<{
        trainingRecord: {
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
        trainingProvider: {
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
        rejections: ({
            rejectionReason: {
                id: number;
                code: string;
                title: string;
                description: string | null;
                severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
                category: import(".prisma/client").$Enums.TrainingRejectionCategory;
                active: boolean;
            };
        } & {
            validationResultId: number;
            rejectionReasonId: number;
            message: string | null;
        })[];
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    }>;
    approve(dto: ApprovalWorkflowDto, req: ReqUser): Promise<{
        rejections: ({
            rejectionReason: {
                id: number;
                code: string;
                title: string;
                description: string | null;
                severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
                category: import(".prisma/client").$Enums.TrainingRejectionCategory;
                active: boolean;
            };
        } & {
            validationResultId: number;
            rejectionReasonId: number;
            message: string | null;
        })[];
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    }>;
    reject(dto: RejectionWorkflowDto, req: ReqUser): Promise<{
        trainingRecord: {
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
        trainingProvider: {
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
        rejections: ({
            rejectionReason: {
                id: number;
                code: string;
                title: string;
                description: string | null;
                severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
                category: import(".prisma/client").$Enums.TrainingRejectionCategory;
                active: boolean;
            };
        } & {
            validationResultId: number;
            rejectionReasonId: number;
            message: string | null;
        })[];
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    }>;
}
export {};
