import { InstructorQualificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingStandardsComplianceService } from '../training-standards-compliance/training-standards-compliance.service';
import { TrainingWalletIntegrationService } from './training-wallet-integration.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
export type UnionHallActor = {
    id: number;
    role: string;
    unionHallId?: number | null;
};
export declare class UnionHallTrainingService {
    private readonly prisma;
    private readonly walletIntegration;
    private readonly standardsCompliance?;
    private readonly events?;
    constructor(prisma: PrismaService, walletIntegration: TrainingWalletIntegrationService, standardsCompliance?: TrainingStandardsComplianceService, events?: EventBusService);
    ensurePendingReceiptsForRecord(trainingRecordId: number): Promise<void>;
    getDashboard(unionHallId: number, actor: UnionHallActor): Promise<{
        unionHallId: number;
        unionHallName: string;
        counts: {
            pending: number;
            accepted: number;
            pushed: number;
            rejected: number;
        };
        providerTrainingHistory: {
            receiptId: number;
            status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
            acceptedAt: string;
            validatedAt: string;
            pushedAt: string;
            trainingRecordId: number;
            workerId: number;
            workerName: string;
            courseName: string;
            providerName: string;
            providerId: number;
            instructorName: string;
            instructorQualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            issuedAt: string;
            expiresAt: string;
            validationOutcome: string;
            certificateQrToken: string;
        }[];
        providers: {
            providerId: number;
            name: string;
            code: string;
            approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
            active: boolean;
            complianceStatus: import(".prisma/client").$Enums.ProviderComplianceLevel;
            complianceScore: number;
            complianceAssessedAt: string;
            gaps: import(".prisma/client").Prisma.JsonValue;
        }[];
        instructors: {
            instructorId: number;
            firstName: string;
            lastName: string;
            providerId: number;
            providerName: string;
            qualificationStatus: InstructorQualificationStatus;
            qualificationExpiresAt: string | null;
        }[];
    }>;
    listPending(unionHallId: number, actor: UnionHallActor): Promise<{
        receiptId: number;
        status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
        acceptedAt: string;
        validatedAt: string;
        pushedAt: string;
        trainingRecordId: number;
        workerId: number;
        workerName: string;
        courseName: string;
        providerName: string;
        providerId: number;
        instructorName: string;
        instructorQualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
        issuedAt: string;
        expiresAt: string;
        validationOutcome: string;
        certificateQrToken: string;
    }[]>;
    linkProvider(unionHallId: number, trainingProviderId: number, actor: UnionHallActor): Promise<{
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
    } & {
        id: number;
        unionHallId: number;
        trainingProviderId: number;
        active: boolean;
        createdAt: Date;
    }>;
    acceptTraining(unionHallId: number, trainingRecordId: number, actor: UnionHallActor, notes?: string): Promise<{
        trainingRecord: {
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            company: {
                id: number;
                name: string;
                logoUrl: string | null;
                city: string | null;
                province: string | null;
                industry: string | null;
                lat: number | null;
                lng: number | null;
                createdAt: Date;
            };
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
            trainingProvider: {
                id: number;
                name: string;
            };
            project: {
                site: {
                    id: number;
                    name: string;
                    code: string | null;
                    region: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    active: boolean;
                    createdAt: Date;
                };
            } & {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
            instructor: {
                id: number;
                firstName: string;
                lastName: string;
                qualificationExpiresAt: Date;
                qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            };
            course: {
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
            };
            validationResults: {
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
            }[];
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
    } & {
        id: number;
        unionHallId: number;
        trainingRecordId: number;
        status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
        acceptedAt: Date | null;
        acceptedByUserId: number | null;
        validatedAt: Date | null;
        pushedAt: Date | null;
        pushedCompanyId: number | null;
        pushedProjectId: number | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    rejectTraining(unionHallId: number, trainingRecordId: number, actor: UnionHallActor, notes?: string): Promise<{
        trainingRecord: {
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            company: {
                id: number;
                name: string;
                logoUrl: string | null;
                city: string | null;
                province: string | null;
                industry: string | null;
                lat: number | null;
                lng: number | null;
                createdAt: Date;
            };
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
            trainingProvider: {
                id: number;
                name: string;
            };
            project: {
                site: {
                    id: number;
                    name: string;
                    code: string | null;
                    region: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    active: boolean;
                    createdAt: Date;
                };
            } & {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
            instructor: {
                id: number;
                firstName: string;
                lastName: string;
                qualificationExpiresAt: Date;
                qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            };
            course: {
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
            };
            validationResults: {
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
            }[];
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
    } & {
        id: number;
        unionHallId: number;
        trainingRecordId: number;
        status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
        acceptedAt: Date | null;
        acceptedByUserId: number | null;
        validatedAt: Date | null;
        pushedAt: Date | null;
        pushedCompanyId: number | null;
        pushedProjectId: number | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validateTraining(unionHallId: number, trainingRecordId: number, actor: UnionHallActor): Promise<{
        validation: import("../training-standards-compliance/training-standards-compliance.service").ValidationReport;
        receiptId: number;
    }>;
    pushTraining(unionHallId: number, trainingRecordId: number, actor: UnionHallActor, targets?: {
        companyId?: number;
        projectId?: number;
        equipmentId?: number;
    }): Promise<{
        receipt: {
            receiptId: number;
            status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
            acceptedAt: string;
            validatedAt: string;
            pushedAt: string;
            trainingRecordId: number;
            workerId: number;
            workerName: string;
            courseName: string;
            providerName: string;
            providerId: number;
            instructorName: string;
            instructorQualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            issuedAt: string;
            expiresAt: string;
            validationOutcome: string;
            certificateQrToken: string;
        };
        wallet: import("./training-wallet.mapper").WalletTrainingRecordDto;
    }>;
    private providerSummary;
    private mapReceipt;
    private requireReceipt;
    private assertHallAccess;
}
