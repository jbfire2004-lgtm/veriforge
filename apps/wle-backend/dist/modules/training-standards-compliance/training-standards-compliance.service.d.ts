import { TrainingValidationOutcome } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Phase1MonitoringService } from '../../common/monitoring/phase1-monitoring.service';
import { CredentialLedgerService } from '../credential-ledger/credential-ledger.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { StandardsMatchingEngine } from './engines/standards-matching.engine';
import { JurisdictionMatchingEngine } from './engines/jurisdiction-matching.engine';
import { ExpiryRuleEngine } from './engines/expiry-rule.engine';
import { CertificateValidationEngine } from './engines/certificate-validation.engine';
import { ProviderQualificationValidator } from './validators/provider-qualification.validator';
import { InstructorQualificationValidator } from './validators/instructor-qualification.validator';
export interface ValidationIssue {
    code: string;
    message: string;
}
export interface ValidationReport {
    outcome: TrainingValidationOutcome;
    score: number;
    jurisdictionCode: string;
    matchedStandardCodes: string[];
    missingStandardCodes: string[];
    issues: ValidationIssue[];
    validationResultId?: number;
}
export declare class TrainingStandardsComplianceService {
    private readonly prisma;
    private readonly monitoring;
    private readonly credentialLedger;
    private readonly standardsEngine;
    private readonly jurisdictionEngine;
    private readonly expiryEngine;
    private readonly certificateEngine;
    private readonly providerValidator;
    private readonly instructorValidator;
    private readonly events?;
    private readonly legislation;
    constructor(prisma: PrismaService, monitoring: Phase1MonitoringService, credentialLedger: CredentialLedgerService, standardsEngine: StandardsMatchingEngine, jurisdictionEngine: JurisdictionMatchingEngine, expiryEngine: ExpiryRuleEngine, certificateEngine: CertificateValidationEngine, providerValidator: ProviderQualificationValidator, instructorValidator: InstructorQualificationValidator, events?: EventBusService);
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
    validateTraining(trainingRecordId: number, jurisdictionCode?: string, validatedBy?: number): Promise<ValidationReport>;
    validateProvider(trainingProviderId: number, jurisdictionCode?: string, validatedBy?: number): Promise<ValidationReport>;
    validateInstructor(instructorId: number, courseCode?: string, jurisdictionCode?: string, validatedBy?: number): Promise<ValidationReport>;
    validateCertificate(certificateQrToken?: string, trainingRecordId?: number, validatedBy?: number): Promise<ValidationReport>;
    getValidationResult(id: number): import(".prisma/client").Prisma.Prisma__TrainingValidationResultClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    getValidationResults(filters: {
        trainingRecordId?: number;
        trainingProviderId?: number;
        outcome?: TrainingValidationOutcome;
        limit?: number;
    }): import(".prisma/client").Prisma.PrismaPromise<({
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
    approveValidation(validationResultId: number, validatedBy: number, notes?: string): Promise<{
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
    rejectValidation(validationResultId: number, rejectionCodes: string[], validatedBy: number, notes?: string): Promise<{
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
    private updateWorkflow;
    private resolveOutcome;
    private resolveJurisdiction;
    private loadProviderRules;
    private loadInstructorRules;
    private persistResult;
    private audit;
}
