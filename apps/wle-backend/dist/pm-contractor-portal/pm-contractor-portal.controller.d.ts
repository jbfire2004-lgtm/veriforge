import { PmContractorDispatchStatus, UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PmContractorPortalAccessService } from './pm-contractor-portal-access.service';
import { PmContractorPortalInboxService } from './pm-contractor-portal-inbox.service';
import { PmContractorPortalFindingsService } from './pm-contractor-portal-findings.service';
import { PmContractorPortalComplianceService } from './pm-contractor-portal-compliance.service';
import { PmContractorPortalMessagesService } from './pm-contractor-portal-messages.service';
import { PmInspectionSharedService } from '../pm-inspections/pm-inspection-shared.service';
import { ContractorComplianceEngineService } from './contractor-compliance-engine.service';
import type { ContractorComplianceEngineInput } from './contractor-compliance-engine.types';
export declare class PmContractorPortalController {
    private readonly access;
    private readonly inbox;
    private readonly findings;
    private readonly compliance;
    private readonly messages;
    private readonly notifications;
    private readonly sharedReports;
    private readonly complianceEngine;
    constructor(access: PmContractorPortalAccessService, inbox: PmContractorPortalInboxService, findings: PmContractorPortalFindingsService, compliance: PmContractorPortalComplianceService, messages: PmContractorPortalMessagesService, notifications: NotificationsService, sharedReports: PmInspectionSharedService, complianceEngine: ContractorComplianceEngineService);
    generateComplianceEngine(body: ContractorComplianceEngineInput): import("./contractor-compliance-engine.types").ContractorComplianceEngineOutput;
    generateComplianceEngineFromMembership(membershipId: string, body?: {
        work_scope?: ContractorComplianceEngineInput['work_scope'];
    }): Promise<import("./contractor-compliance-engine.types").ContractorComplianceEngineOutput>;
    private securityActor;
    private actor;
    listMemberships(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }): Promise<({
        project: {
            id: number;
            name: string;
        };
        primeCompany: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        active: boolean;
        createdAt: Date;
    })[]>;
    listPrimeMemberships(primeCompanyId: string, projectId?: string): Promise<({
        project: {
            id: number;
            name: string;
        };
        contractorCompany: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        active: boolean;
        createdAt: Date;
    })[]>;
    dashboard(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }): Promise<{
        inbox: {
            total: number;
            overdue: number;
            pendingAck: number;
        };
        findings: {
            total: number;
            unacknowledged: number;
            critical: number;
        };
        compliance: {
            workersTotal: number;
            trainingExpired: number;
            trainingExpiringSoon: number;
            credentialsExpired: number;
            credentialsExpiringSoon: number;
            equipmentNonCompliant: number;
            equipmentTotal: number;
        };
    }>;
    listInbox(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, status?: PmContractorDispatchStatus, overdueOnly?: string): Promise<{
        summary: {
            total: number;
            overdue: number;
            pendingAck: number;
        };
        items: {
            inspectionId: string;
            sourcePhotos: {
                id?: string;
                dataUrl?: string;
                fileName?: string;
            }[];
            smsRiskContext: {
                id: string;
                companyId: number;
                projectId: number | null;
                entityType: import(".prisma/client").$Enums.PmSmsEntityType;
                entityId: string;
                sclState: import(".prisma/client").$Enums.PmSclState | null;
                sclTriggersJson: import(".prisma/client").Prisma.JsonValue;
                sclPrecursorsJson: import(".prisma/client").Prisma.JsonValue;
                sclPotentialSeverity: string | null;
                hecaInvolved: boolean;
                hecaType: import(".prisma/client").$Enums.PmSmsHecaType | null;
                hecaCategoryCode: string | null;
                hecaLibraryEntryId: string | null;
                energyTypesJson: import(".prisma/client").Prisma.JsonValue;
                energyControlState: import(".prisma/client").$Enums.PmEnergyControlState | null;
                highEnergyFlag: boolean;
                missingControlsJson: import(".prisma/client").Prisma.JsonValue;
                escalationScore: number;
                requiresInvestigation: boolean;
                metadataJson: import(".prisma/client").Prisma.JsonValue;
                clientSyncId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            subcontractorCompany: {
                id: number;
                name: string;
            };
            correctiveAction: {
                project: {
                    id: number;
                    name: string;
                };
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                projectId: number;
                title: string;
                attachments: {
                    id: string;
                    actionId: string;
                    storageKey: string | null;
                    fileName: string | null;
                    mimeType: string | null;
                    dataUrl: string | null;
                    coreFileId: number | null;
                    phase: string;
                    clientSyncId: string | null;
                    createdAt: Date;
                }[];
                description: string;
                dueAt: Date;
                severityLevel: string;
            };
            id: string;
            correctiveActionId: string;
            subcontractorCompanyId: number;
            status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
            packageJson: import(".prisma/client").Prisma.JsonValue;
            sentAt: Date | null;
            acknowledgedAt: Date | null;
            completedAt: Date | null;
            overdueAt: Date | null;
            notificationIds: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    acknowledgeInbox(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, dispatchId: string): Promise<{
        id: string;
        correctiveActionId: string;
        subcontractorCompanyId: number;
        status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
        packageJson: import(".prisma/client").Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadEvidence(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, dispatchId: string, body: {
        dataUrl?: string;
        storageKey?: string;
        fileName?: string;
        mimeType?: string;
        notes?: string;
    }): Promise<{
        id: string;
        actionId: string;
        storageKey: string | null;
        fileName: string | null;
        mimeType: string | null;
        dataUrl: string | null;
        coreFileId: number | null;
        phase: string;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    completeInbox(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, dispatchId: string, body?: {
        storageKey?: string;
        dataUrl?: string;
        fileName?: string;
        mimeType?: string;
        notes?: string;
    }): Promise<{
        correctiveAction: {
            id: string;
            cailEntryId: string;
            companyId: number;
            projectId: number;
            siteId: number | null;
            sourceModule: string;
            sourceId: string;
            sourceItemId: string;
            deficiencyId: string | null;
            actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
            status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
            title: string;
            description: string | null;
            severityScore: number;
            priorityScore: number;
            escalationLevel: number;
            dueAt: Date | null;
            overdueAt: Date | null;
            equipmentId: number | null;
            workerId: number | null;
            subcontractorCompanyId: number | null;
            requiresVerification: boolean;
            verifiedAt: Date | null;
            closedAt: Date | null;
            createdByUserId: number;
            verifiedByUserId: number | null;
            parentActionId: string | null;
            hazardId: string | null;
            controlId: string | null;
            rootCauseId: string | null;
            publishVersion: number;
            publishedAt: Date | null;
            severityLevel: string;
            priorityLevel: string;
            evidenceRequirementsJson: import(".prisma/client").Prisma.JsonValue;
            verificationRequirementsJson: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        correctiveActionId: string;
        subcontractorCompanyId: number;
        status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
        packageJson: import(".prisma/client").Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listSharedReports(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, projectId?: string): Promise<{
        total: number;
        items: any[];
    }>;
    listFindings(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, projectId?: string, unacknowledgedOnly?: string): Promise<{
        summary: {
            total: number;
            unacknowledged: number;
            critical: number;
        };
        items: {
            id: string;
            title: string;
            description: string;
            severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
            status: import(".prisma/client").$Enums.PmDeficiencyStatus;
            dueAt: Date;
            inspection: {
                project: {
                    id: number;
                    name: string;
                };
                id: string;
                createdAt: Date;
                projectId: number;
                submittedAt: Date;
                inspector: {
                    id: number;
                    username: string;
                };
            };
            acknowledged: boolean;
            acknowledgment: {
                id: string;
                deficiencyId: string;
                contractorCompanyId: number;
                acknowledgedByUserId: number;
                notes: string | null;
                acknowledgedAt: Date;
            };
            photo: {
                id: string;
                fileName: string;
                dataUrl: string;
            };
        }[];
    }>;
    acknowledgeFinding(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, deficiencyId: string, body?: {
        notes?: string;
    }): Promise<{
        acknowledgedBy: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        deficiencyId: string;
        contractorCompanyId: number;
        acknowledgedByUserId: number;
        notes: string | null;
        acknowledgedAt: Date;
    }>;
    complianceDashboard(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, projectId?: string): Promise<{
        summary: {
            workersTotal: number;
            trainingExpired: number;
            trainingExpiringSoon: number;
            credentialsExpired: number;
            credentialsExpiringSoon: number;
            equipmentNonCompliant: number;
            equipmentTotal: number;
        };
        workers: {
            id: number;
            firstName: string;
            lastName: string;
            status: string;
        }[];
        training: {
            expired: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
            expiringSoon: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
            current: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
        };
        certifications: {
            expired: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
            expiringSoon: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
        };
        equipment: {
            nonCompliant: ({
                equipment: {
                    id: number;
                    name: string;
                    serialNumber: string;
                };
            } & {
                id: number;
                companyId: number;
                equipmentId: number;
                lastPreUseAt: Date | null;
                lastFormalAt: Date | null;
                preUseCompliant7d: boolean;
                formalCompliant: boolean;
                trainingOperatorsOk: number;
                trainingOperatorsTotal: number;
                competencyOperatorsOk: number;
                competencyOperatorsTotal: number;
                updatedAt: Date;
            })[];
            compliant: ({
                equipment: {
                    id: number;
                    name: string;
                    serialNumber: string;
                };
            } & {
                id: number;
                companyId: number;
                equipmentId: number;
                lastPreUseAt: Date | null;
                lastFormalAt: Date | null;
                preUseCompliant7d: boolean;
                formalCompliant: boolean;
                trainingOperatorsOk: number;
                trainingOperatorsTotal: number;
                competencyOperatorsOk: number;
                competencyOperatorsTotal: number;
                updatedAt: Date;
            })[];
        };
    }>;
    listMessages(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, primeCompanyId?: string, projectId?: string): Promise<{
        messages: ({
            primeCompany: {
                id: number;
                name: string;
            };
            sender: {
                id: number;
                username: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            primeCompanyId: number;
            contractorCompanyId: number;
            projectId: number | null;
            senderUserId: number;
            body: string;
            relatedType: string | null;
            relatedId: string | null;
            readAt: Date | null;
            createdAt: Date;
        })[];
    } | {
        messages: ({
            contractorCompany: {
                id: number;
                name: string;
            };
            sender: {
                id: number;
                username: string;
                role: import(".prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            primeCompanyId: number;
            contractorCompanyId: number;
            projectId: number | null;
            senderUserId: number;
            body: string;
            relatedType: string | null;
            relatedId: string | null;
            readAt: Date | null;
            createdAt: Date;
        })[];
    }>;
    sendMessage(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, body: {
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId?: number;
        text: string;
        relatedType?: string;
        relatedId?: string;
    }): Promise<{
        primeCompany: {
            id: number;
            name: string;
        };
        sender: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        senderUserId: number;
        body: string;
        relatedType: string | null;
        relatedId: string | null;
        readAt: Date | null;
        createdAt: Date;
    }>;
    markMessageRead(req: {
        user: {
            id: number;
            role: UserRole;
            companyId?: number;
        };
    }, messageId: string): Promise<{
        id: string;
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId: number | null;
        senderUserId: number;
        body: string;
        relatedType: string | null;
        relatedId: string | null;
        readAt: Date | null;
        createdAt: Date;
    }>;
    listNotifications(req: {
        user: {
            id: number;
        };
    }, unreadOnly?: string): Promise<{
        id: number;
        userId: number | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        type: string;
        title: string | null;
        body: string | null;
        payload: import(".prisma/client").Prisma.JsonValue;
        status: import(".prisma/client").$Enums.NotificationStatus;
        readAt: Date | null;
        dedupeKey: string | null;
        scheduledFor: Date | null;
        sentAt: Date | null;
        createdAt: Date;
    }[]>;
    markNotificationRead(req: {
        user: {
            id: number;
        };
    }, id: string): Promise<{
        id: number;
        userId: number | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        type: string;
        title: string | null;
        body: string | null;
        payload: import(".prisma/client").Prisma.JsonValue;
        status: import(".prisma/client").$Enums.NotificationStatus;
        readAt: Date | null;
        dedupeKey: string | null;
        scheduledFor: Date | null;
        sentAt: Date | null;
        createdAt: Date;
    }>;
    createMembership(body: {
        primeCompanyId: number;
        contractorCompanyId: number;
        projectId?: number;
    }): Promise<any>;
}
