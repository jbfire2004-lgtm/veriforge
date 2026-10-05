import { PublicTokenResolver } from './public-token.resolver';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEngineService } from '../rules/rule-engine.service';
import type { TrainingRecordVerificationResult, ValidateTrainingRecordOptions } from './types/training-record-verification.types';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegulatoryDecisionService } from '../modules/training-standards-compliance/regulatory/regulatory-decision.service';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import { TrainingWalletIntegrationService } from '../modules/vera-core/training-wallet-integration.service';
import type { WalletTrainingRecordDto } from '../modules/vera-core/training-wallet.mapper';
import { TrainingCredentialNftCoordinatorService } from '../modules/training-credential-nft/training-credential-nft-coordinator.service';
import { AuditLogService } from '../audit/audit-log.service';
export type VerificationIssueType = 'MISSING' | 'EXPIRED' | 'EXPIRING_SOON' | 'NO_DOCUMENT';
export interface WorkerVerificationStatus {
    workerId: number;
    isCompliant: boolean;
    issues: {
        type: VerificationIssueType;
        courseName: string;
        expiresAt: Date | null;
    }[];
}
export declare class VerificationService {
    private prisma;
    private ruleEngine;
    private readonly monitoring;
    private readonly auditLog;
    private readonly publicTokens;
    private readonly walletIntegration?;
    private readonly nftCoordinator?;
    private readonly regulatoryDecision?;
    private readonly events?;
    private readonly notifications?;
    private readonly logger;
    constructor(prisma: PrismaService, ruleEngine: RuleEngineService, monitoring: Phase1MonitoringService, auditLog: AuditLogService, publicTokens: PublicTokenResolver, walletIntegration?: TrainingWalletIntegrationService, nftCoordinator?: TrainingCredentialNftCoordinatorService, regulatoryDecision?: RegulatoryDecisionService, events?: EventBusService, notifications?: NotificationsService);
    evaluateWorkerCompliance(workerId: number): Promise<WorkerVerificationStatus>;
    verifyByPublicToken(token: string): Promise<{
        equipment: {
            name: string;
            safetyStatus: string;
            isSafe: boolean;
        };
        type: "equipment";
        publicRef: string;
        name: string;
        safetyStatus: string;
        isSafe: boolean;
        photoUrl: string;
        company: {
            name: string;
        };
        assignedWorkers: {
            displayName: string;
        }[];
    } | {
        worker: {
            firstName: string;
            lastName: string;
            photoUrl: string;
            company: import("./public-response.sanitizer").PublicCompanyRef;
        };
        certifications: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
        trainingRecords: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
        credentials: {
            name: string;
            status: string;
            issuedOn: Date;
            expiresOn: Date;
            certificationName: string;
        }[];
        equipment: {
            name: string;
            safetyStatus: string;
            isSafe: boolean;
        }[];
        compliance: {
            isCompliant: boolean;
            issues: {
                type: VerificationIssueType;
                courseName: string;
                expiresAt: Date;
            }[];
        };
        type: "worker";
        publicRef: string;
        displayName: string;
        photoUrl: string;
        company: {
            name: string;
        };
        training: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
    }>;
    verifyWorker(workerId: number): Promise<{
        worker: {
            firstName: string;
            lastName: string;
            photoUrl: string;
            company: import("./public-response.sanitizer").PublicCompanyRef;
        };
        certifications: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
        trainingRecords: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
        credentials: {
            name: string;
            status: string;
            issuedOn: Date;
            expiresOn: Date;
            certificationName: string;
        }[];
        equipment: {
            name: string;
            safetyStatus: string;
            isSafe: boolean;
        }[];
        compliance: {
            isCompliant: boolean;
            issues: {
                type: VerificationIssueType;
                courseName: string;
                expiresAt: Date;
            }[];
        };
        type: "worker";
        publicRef: string;
        displayName: string;
        photoUrl: string;
        company: {
            name: string;
        };
        training: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
    }>;
    verifyWorkerByRef(ref: string): Promise<{
        worker: {
            firstName: string;
            lastName: string;
            photoUrl: string;
            company: import("./public-response.sanitizer").PublicCompanyRef;
        };
        certifications: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
        trainingRecords: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
        credentials: {
            name: string;
            status: string;
            issuedOn: Date;
            expiresOn: Date;
            certificationName: string;
        }[];
        equipment: {
            name: string;
            safetyStatus: string;
            isSafe: boolean;
        }[];
        compliance: {
            isCompliant: boolean;
            issues: {
                type: VerificationIssueType;
                courseName: string;
                expiresAt: Date;
            }[];
        };
        type: "worker";
        publicRef: string;
        displayName: string;
        photoUrl: string;
        company: {
            name: string;
        };
        training: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
    }>;
    verifyWorkerFullByRef(ref: string): Promise<{
        worker: {
            company: {
                trainingRequirements: {
                    id: number;
                    companyId: number;
                    courseName: string;
                    expiresInDays: number;
                    createdAt: Date;
                }[];
            } & {
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
            trainingRecords: ({
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
                lastVerificationChecks: Prisma.JsonValue | null;
                verifiedAt: Date | null;
                ingestionRunId: number | null;
            })[];
            credentials: ({
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            } & {
                id: number;
                workerId: number;
                name: string;
                value: string;
                createdAt: Date;
                expiresAt: Date | null;
                issuedAt: Date;
                certificationId: number | null;
            })[];
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            equipmentAssignments: ({
                equipment: {
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
                } & {
                    id: number;
                    name: string;
                    serialNumber: string | null;
                    assetTag: string | null;
                    qrToken: string | null;
                    safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
                    companyId: number | null;
                    categoryId: number | null;
                    typeId: number | null;
                    photoUrl: string | null;
                    description: string | null;
                    manufacturer: string | null;
                    model: string | null;
                    yearMade: number | null;
                    lockedOutAt: Date | null;
                    lockoutReason: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
                    catalogTypeKey: string | null;
                    meterHours: number;
                    complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
                    lastInspectionAt: Date | null;
                    nextInspectionAt: Date | null;
                    lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
                    competencyRequired: boolean;
                    trainingRequired: boolean;
                    complianceUpdatedAt: Date | null;
                    operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
                    safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
                    capacity: string | null;
                    loadChartJson: Prisma.JsonValue;
                    pmSafetyMetadataJson: Prisma.JsonValue;
                    deletedAt: Date | null;
                };
            } & {
                id: number;
                workerId: number;
                equipmentId: number | null;
                siteId: number | null;
                companyId: number | null;
                assignedBy: number | null;
                assignedAt: Date;
                endedAt: Date | null;
                startAt: Date | null;
                endAt: Date | null;
                autoStarted: boolean;
                autoEnded: boolean;
            })[];
            documents: {
                id: number;
                type: string;
                name: string;
                url: string;
                description: string | null;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                tags: string[];
                version: number;
                deleted: boolean;
                createdAt: Date;
            }[];
        } & {
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
        certifications: WalletTrainingRecordDto[] | ({
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
            lastVerificationChecks: Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        })[];
        credentials: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            workerId: number;
            name: string;
            value: string;
            createdAt: Date;
            expiresAt: Date | null;
            issuedAt: Date;
            certificationId: number | null;
        })[];
        expiredCerts: ({
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
            lastVerificationChecks: Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        })[];
        activeIncidents: {
            id: number;
            title: string;
            description: string | null;
            category: string | null;
            latitude: number | null;
            longitude: number | null;
            metadata: Prisma.JsonValue | null;
            status: string;
            severity: string;
            workerId: number | null;
            equipmentId: number | null;
            companyId: number | null;
            siteId: number | null;
            createdById: number | null;
            assignedToId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        ruleResult: {
            result: string;
            reasons: string[];
            missingCertifications: number[];
            expiredTraining: any;
            expiredCredentials: any;
            workerIncidents: any;
            equipmentIncidents: any;
        };
        compliance: WorkerVerificationStatus;
    }>;
    verifyEquipmentMissingRef(): never;
    verifyWorkerPublic(workerId: number, knownToken?: string | null): Promise<{
        worker: {
            firstName: string;
            lastName: string;
            photoUrl: string;
            company: import("./public-response.sanitizer").PublicCompanyRef;
        };
        certifications: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
        trainingRecords: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
        credentials: {
            name: string;
            status: string;
            issuedOn: Date;
            expiresOn: Date;
            certificationName: string;
        }[];
        equipment: {
            name: string;
            safetyStatus: string;
            isSafe: boolean;
        }[];
        compliance: {
            isCompliant: boolean;
            issues: {
                type: VerificationIssueType;
                courseName: string;
                expiresAt: Date;
            }[];
        };
        type: "worker";
        publicRef: string;
        displayName: string;
        photoUrl: string;
        company: {
            name: string;
        };
        training: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        }[];
    }>;
    verifyWorkerFull(workerId: number): Promise<{
        worker: {
            company: {
                trainingRequirements: {
                    id: number;
                    companyId: number;
                    courseName: string;
                    expiresInDays: number;
                    createdAt: Date;
                }[];
            } & {
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
            trainingRecords: ({
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
                lastVerificationChecks: Prisma.JsonValue | null;
                verifiedAt: Date | null;
                ingestionRunId: number | null;
            })[];
            credentials: ({
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            } & {
                id: number;
                workerId: number;
                name: string;
                value: string;
                createdAt: Date;
                expiresAt: Date | null;
                issuedAt: Date;
                certificationId: number | null;
            })[];
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            equipmentAssignments: ({
                equipment: {
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
                } & {
                    id: number;
                    name: string;
                    serialNumber: string | null;
                    assetTag: string | null;
                    qrToken: string | null;
                    safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
                    companyId: number | null;
                    categoryId: number | null;
                    typeId: number | null;
                    photoUrl: string | null;
                    description: string | null;
                    manufacturer: string | null;
                    model: string | null;
                    yearMade: number | null;
                    lockedOutAt: Date | null;
                    lockoutReason: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
                    catalogTypeKey: string | null;
                    meterHours: number;
                    complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
                    lastInspectionAt: Date | null;
                    nextInspectionAt: Date | null;
                    lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
                    competencyRequired: boolean;
                    trainingRequired: boolean;
                    complianceUpdatedAt: Date | null;
                    operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
                    safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
                    capacity: string | null;
                    loadChartJson: Prisma.JsonValue;
                    pmSafetyMetadataJson: Prisma.JsonValue;
                    deletedAt: Date | null;
                };
            } & {
                id: number;
                workerId: number;
                equipmentId: number | null;
                siteId: number | null;
                companyId: number | null;
                assignedBy: number | null;
                assignedAt: Date;
                endedAt: Date | null;
                startAt: Date | null;
                endAt: Date | null;
                autoStarted: boolean;
                autoEnded: boolean;
            })[];
            documents: {
                id: number;
                type: string;
                name: string;
                url: string;
                description: string | null;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                tags: string[];
                version: number;
                deleted: boolean;
                createdAt: Date;
            }[];
        } & {
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
        certifications: WalletTrainingRecordDto[] | ({
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
            lastVerificationChecks: Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        })[];
        credentials: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            workerId: number;
            name: string;
            value: string;
            createdAt: Date;
            expiresAt: Date | null;
            issuedAt: Date;
            certificationId: number | null;
        })[];
        expiredCerts: ({
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
            lastVerificationChecks: Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        })[];
        activeIncidents: {
            id: number;
            title: string;
            description: string | null;
            category: string | null;
            latitude: number | null;
            longitude: number | null;
            metadata: Prisma.JsonValue | null;
            status: string;
            severity: string;
            workerId: number | null;
            equipmentId: number | null;
            companyId: number | null;
            siteId: number | null;
            createdById: number | null;
            assignedToId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        ruleResult: {
            result: string;
            reasons: string[];
            missingCertifications: number[];
            expiredTraining: any;
            expiredCredentials: any;
            workerIncidents: any;
            equipmentIncidents: any;
        };
        compliance: WorkerVerificationStatus;
    }>;
    private mapPublicTraining;
    verifyEquipment(equipmentId: number): Promise<{
        equipment: {
            name: string;
            safetyStatus: string;
            isSafe: boolean;
        };
        type: "equipment";
        publicRef: string;
        name: string;
        safetyStatus: string;
        isSafe: boolean;
        photoUrl: string;
        company: {
            name: string;
        };
        assignedWorkers: {
            displayName: string;
        }[];
    }>;
    verifyEquipmentByRef(ref: string): Promise<{
        equipment: {
            name: string;
            safetyStatus: string;
            isSafe: boolean;
        };
        type: "equipment";
        publicRef: string;
        name: string;
        safetyStatus: string;
        isSafe: boolean;
        photoUrl: string;
        company: {
            name: string;
        };
        assignedWorkers: {
            displayName: string;
        }[];
    }>;
    verifyEquipmentFullByRef(ref: string): Promise<{
        equipment: {
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
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            equipmentAssignments: ({
                worker: {
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
                    trainingRecords: {
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
                        lastVerificationChecks: Prisma.JsonValue | null;
                        verifiedAt: Date | null;
                        ingestionRunId: number | null;
                    }[];
                    credentials: {
                        id: number;
                        workerId: number;
                        name: string;
                        value: string;
                        createdAt: Date;
                        expiresAt: Date | null;
                        issuedAt: Date;
                        certificationId: number | null;
                    }[];
                    incidents: {
                        id: number;
                        title: string;
                        description: string | null;
                        category: string | null;
                        latitude: number | null;
                        longitude: number | null;
                        metadata: Prisma.JsonValue | null;
                        status: string;
                        severity: string;
                        workerId: number | null;
                        equipmentId: number | null;
                        companyId: number | null;
                        siteId: number | null;
                        createdById: number | null;
                        assignedToId: number | null;
                        createdAt: Date;
                        updatedAt: Date;
                    }[];
                } & {
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
            } & {
                id: number;
                workerId: number;
                equipmentId: number | null;
                siteId: number | null;
                companyId: number | null;
                assignedBy: number | null;
                assignedAt: Date;
                endedAt: Date | null;
                startAt: Date | null;
                endAt: Date | null;
                autoStarted: boolean;
                autoEnded: boolean;
            })[];
        } & {
            id: number;
            name: string;
            serialNumber: string | null;
            assetTag: string | null;
            qrToken: string | null;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            companyId: number | null;
            categoryId: number | null;
            typeId: number | null;
            photoUrl: string | null;
            description: string | null;
            manufacturer: string | null;
            model: string | null;
            yearMade: number | null;
            lockedOutAt: Date | null;
            lockoutReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
            catalogTypeKey: string | null;
            meterHours: number;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date | null;
            nextInspectionAt: Date | null;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
            complianceUpdatedAt: Date | null;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
            safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
            capacity: string | null;
            loadChartJson: Prisma.JsonValue;
            pmSafetyMetadataJson: Prisma.JsonValue;
            deletedAt: Date | null;
        };
        requiredCerts: any[];
        assignedWorkers: ({
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
            trainingRecords: {
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
                lastVerificationChecks: Prisma.JsonValue | null;
                verifiedAt: Date | null;
                ingestionRunId: number | null;
            }[];
            credentials: {
                id: number;
                workerId: number;
                name: string;
                value: string;
                createdAt: Date;
                expiresAt: Date | null;
                issuedAt: Date;
                certificationId: number | null;
            }[];
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
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
        })[];
        activeIncidents: {
            id: number;
            title: string;
            description: string | null;
            category: string | null;
            latitude: number | null;
            longitude: number | null;
            metadata: Prisma.JsonValue | null;
            status: string;
            severity: string;
            workerId: number | null;
            equipmentId: number | null;
            companyId: number | null;
            siteId: number | null;
            createdById: number | null;
            assignedToId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        ruleResult: {
            result: string;
            reasons: string[];
            missingCertifications: number[];
            expiredTraining: any;
            expiredCredentials: any;
            workerIncidents: any;
            equipmentIncidents: any;
        };
    }>;
    verifyEquipmentPublic(equipmentId: number, knownToken?: string | null): Promise<{
        equipment: {
            name: string;
            safetyStatus: string;
            isSafe: boolean;
        };
        type: "equipment";
        publicRef: string;
        name: string;
        safetyStatus: string;
        isSafe: boolean;
        photoUrl: string;
        company: {
            name: string;
        };
        assignedWorkers: {
            displayName: string;
        }[];
    }>;
    verifyEquipmentFull(equipmentId: number): Promise<{
        equipment: {
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
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            equipmentAssignments: ({
                worker: {
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
                    trainingRecords: {
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
                        lastVerificationChecks: Prisma.JsonValue | null;
                        verifiedAt: Date | null;
                        ingestionRunId: number | null;
                    }[];
                    credentials: {
                        id: number;
                        workerId: number;
                        name: string;
                        value: string;
                        createdAt: Date;
                        expiresAt: Date | null;
                        issuedAt: Date;
                        certificationId: number | null;
                    }[];
                    incidents: {
                        id: number;
                        title: string;
                        description: string | null;
                        category: string | null;
                        latitude: number | null;
                        longitude: number | null;
                        metadata: Prisma.JsonValue | null;
                        status: string;
                        severity: string;
                        workerId: number | null;
                        equipmentId: number | null;
                        companyId: number | null;
                        siteId: number | null;
                        createdById: number | null;
                        assignedToId: number | null;
                        createdAt: Date;
                        updatedAt: Date;
                    }[];
                } & {
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
            } & {
                id: number;
                workerId: number;
                equipmentId: number | null;
                siteId: number | null;
                companyId: number | null;
                assignedBy: number | null;
                assignedAt: Date;
                endedAt: Date | null;
                startAt: Date | null;
                endAt: Date | null;
                autoStarted: boolean;
                autoEnded: boolean;
            })[];
        } & {
            id: number;
            name: string;
            serialNumber: string | null;
            assetTag: string | null;
            qrToken: string | null;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            companyId: number | null;
            categoryId: number | null;
            typeId: number | null;
            photoUrl: string | null;
            description: string | null;
            manufacturer: string | null;
            model: string | null;
            yearMade: number | null;
            lockedOutAt: Date | null;
            lockoutReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
            catalogTypeKey: string | null;
            meterHours: number;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date | null;
            nextInspectionAt: Date | null;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
            complianceUpdatedAt: Date | null;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
            safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
            capacity: string | null;
            loadChartJson: Prisma.JsonValue;
            pmSafetyMetadataJson: Prisma.JsonValue;
            deletedAt: Date | null;
        };
        requiredCerts: any[];
        assignedWorkers: ({
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
            trainingRecords: {
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
                lastVerificationChecks: Prisma.JsonValue | null;
                verifiedAt: Date | null;
                ingestionRunId: number | null;
            }[];
            credentials: {
                id: number;
                workerId: number;
                name: string;
                value: string;
                createdAt: Date;
                expiresAt: Date | null;
                issuedAt: Date;
                certificationId: number | null;
            }[];
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
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
        })[];
        activeIncidents: {
            id: number;
            title: string;
            description: string | null;
            category: string | null;
            latitude: number | null;
            longitude: number | null;
            metadata: Prisma.JsonValue | null;
            status: string;
            severity: string;
            workerId: number | null;
            equipmentId: number | null;
            companyId: number | null;
            siteId: number | null;
            createdById: number | null;
            assignedToId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        ruleResult: {
            result: string;
            reasons: string[];
            missingCertifications: number[];
            expiredTraining: any;
            expiredCredentials: any;
            workerIncidents: any;
            equipmentIncidents: any;
        };
    }>;
    verifyCombined(workerId: number, equipmentId: number): Promise<{
        worker: {
            company: {
                trainingRequirements: {
                    id: number;
                    companyId: number;
                    courseName: string;
                    expiresInDays: number;
                    createdAt: Date;
                }[];
            } & {
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
            trainingRecords: ({
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
                lastVerificationChecks: Prisma.JsonValue | null;
                verifiedAt: Date | null;
                ingestionRunId: number | null;
            })[];
            credentials: ({
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            } & {
                id: number;
                workerId: number;
                name: string;
                value: string;
                createdAt: Date;
                expiresAt: Date | null;
                issuedAt: Date;
                certificationId: number | null;
            })[];
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            equipmentAssignments: ({
                equipment: {
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
                } & {
                    id: number;
                    name: string;
                    serialNumber: string | null;
                    assetTag: string | null;
                    qrToken: string | null;
                    safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
                    companyId: number | null;
                    categoryId: number | null;
                    typeId: number | null;
                    photoUrl: string | null;
                    description: string | null;
                    manufacturer: string | null;
                    model: string | null;
                    yearMade: number | null;
                    lockedOutAt: Date | null;
                    lockoutReason: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
                    catalogTypeKey: string | null;
                    meterHours: number;
                    complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
                    lastInspectionAt: Date | null;
                    nextInspectionAt: Date | null;
                    lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
                    competencyRequired: boolean;
                    trainingRequired: boolean;
                    complianceUpdatedAt: Date | null;
                    operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
                    safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
                    capacity: string | null;
                    loadChartJson: Prisma.JsonValue;
                    pmSafetyMetadataJson: Prisma.JsonValue;
                    deletedAt: Date | null;
                };
            } & {
                id: number;
                workerId: number;
                equipmentId: number | null;
                siteId: number | null;
                companyId: number | null;
                assignedBy: number | null;
                assignedAt: Date;
                endedAt: Date | null;
                startAt: Date | null;
                endAt: Date | null;
                autoStarted: boolean;
                autoEnded: boolean;
            })[];
            documents: {
                id: number;
                type: string;
                name: string;
                url: string;
                description: string | null;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                tags: string[];
                version: number;
                deleted: boolean;
                createdAt: Date;
            }[];
        } & {
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
        equipment: {
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
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            equipmentAssignments: ({
                worker: {
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
                    trainingRecords: {
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
                        lastVerificationChecks: Prisma.JsonValue | null;
                        verifiedAt: Date | null;
                        ingestionRunId: number | null;
                    }[];
                    credentials: {
                        id: number;
                        workerId: number;
                        name: string;
                        value: string;
                        createdAt: Date;
                        expiresAt: Date | null;
                        issuedAt: Date;
                        certificationId: number | null;
                    }[];
                    incidents: {
                        id: number;
                        title: string;
                        description: string | null;
                        category: string | null;
                        latitude: number | null;
                        longitude: number | null;
                        metadata: Prisma.JsonValue | null;
                        status: string;
                        severity: string;
                        workerId: number | null;
                        equipmentId: number | null;
                        companyId: number | null;
                        siteId: number | null;
                        createdById: number | null;
                        assignedToId: number | null;
                        createdAt: Date;
                        updatedAt: Date;
                    }[];
                } & {
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
            } & {
                id: number;
                workerId: number;
                equipmentId: number | null;
                siteId: number | null;
                companyId: number | null;
                assignedBy: number | null;
                assignedAt: Date;
                endedAt: Date | null;
                startAt: Date | null;
                endAt: Date | null;
                autoStarted: boolean;
                autoEnded: boolean;
            })[];
        } & {
            id: number;
            name: string;
            serialNumber: string | null;
            assetTag: string | null;
            qrToken: string | null;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            companyId: number | null;
            categoryId: number | null;
            typeId: number | null;
            photoUrl: string | null;
            description: string | null;
            manufacturer: string | null;
            model: string | null;
            yearMade: number | null;
            lockedOutAt: Date | null;
            lockoutReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
            catalogTypeKey: string | null;
            meterHours: number;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date | null;
            nextInspectionAt: Date | null;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
            complianceUpdatedAt: Date | null;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
            safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
            capacity: string | null;
            loadChartJson: Prisma.JsonValue;
            pmSafetyMetadataJson: Prisma.JsonValue;
            deletedAt: Date | null;
        };
        ruleResult: {
            result: string;
            reasons: string[];
            missingCertifications: number[];
            expiredTraining: any;
            expiredCredentials: any;
            workerIncidents: any;
            equipmentIncidents: any;
        };
        missingCertifications: number[];
        expiredTraining: any;
        expiredCredentials: any;
        workerIncidents: any;
        equipmentIncidents: any;
        compliance: WorkerVerificationStatus;
    }>;
    verifyCombinedPublic(workerRef: string, equipmentRef: string): Promise<{
        status: string;
        worker: {
            publicRef: string;
            displayName: string;
            company: {
                name: string;
            };
            isCompliant: boolean;
        };
        equipment: {
            publicRef: string;
            name: string;
            isSafe: boolean;
            safetyStatus: string;
        };
    }>;
    verifyCertificationPublic(certificationId: number): Promise<{
        type: string;
        id: number;
        name: string;
        code: string;
        description: string;
        trainingRecordCount: number;
        credentialCount: number;
    }>;
    verifyTrainingRecordPublic(trainingRecordId: number): Promise<{
        type: string;
        displayName: string;
        company: import("./public-response.sanitizer").PublicCompanyRef;
        training: {
            courseName: string;
            certificationCode: string;
            expiresAt: Date;
            issuedAt: Date;
            completedAt: Date;
            status: string;
        };
        providerName: string;
    }>;
    verifyCredentialPublic(credentialId: number): Promise<{
        type: string;
        displayName: string;
        company: import("./public-response.sanitizer").PublicCompanyRef;
        credential: {
            name: string;
            status: string;
            issuedOn: Date;
            expiresOn: Date;
            certificationName: string;
        };
        relatedTrainingCount: number;
    }>;
    verifyCompanyPublic(companyId: number): Promise<{
        type: string;
        name: string;
        logoUrl: string;
        workerCount: number;
        equipmentCount: number;
    }>;
    private parseWorkerSiteToken;
    verifySiteAccessPublic(token: string): Promise<{
        type: string;
        firstName: string;
        lastName: string;
        photoUrl: string;
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
        siteAccess: {
            isAllowed: boolean;
            workerId: number;
            siteId: number;
            siteName: string;
            accessStatus: string;
            approved: boolean;
            notes: string;
            complianceOk: boolean;
            compliance: WorkerVerificationStatus;
        };
    }>;
    validateTrainingRecord(trainingRecordId: number, options?: ValidateTrainingRecordOptions): Promise<TrainingRecordVerificationResult>;
    getTrainingVerificationSnapshot(trainingRecordId: number): Promise<{
        trainingRecordId: number;
        lastVerificationStatus: string;
        lastVerificationChecks: Prisma.JsonValue;
        verifiedAt: string;
        completedAt: string;
        credentialNft: {
            id: number;
            trainingRecordId: number;
            workerId: number;
            regulatoryVerificationDecisionId: number;
            nftTokenId: string | null;
            chain: string;
            transactionHash: string | null;
            mintStatus: import(".prisma/client").$Enums.TrainingCredentialNftMintStatus;
            regulatoryDecisionHash: string;
            originalDocumentHash: string | null;
            metadata: Prisma.JsonValue | null;
            mintedAt: Date | null;
            createdAt: Date;
        };
        latestMintJob: {
            id: number;
            trainingRecordId: number;
            status: import(".prisma/client").$Enums.NftMintJobStatus;
            attempts: number;
            lastError: string | null;
            idempotencyKey: string;
            createdAt: Date;
            processedAt: Date | null;
        };
    }>;
    completeTrainingVerification(trainingRecordId: number, actor?: {
        userId: number;
    } | null): Promise<{
        ok: true;
    }>;
    private persistVerificationSnapshot;
    private closeVerificationLoop;
    private notifyVerificationAttention;
}
