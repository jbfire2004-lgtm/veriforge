import { PmEmergencyResponseService } from './pm-emergency-response.service';
import { PmEmergencyCailIntelligenceService } from './pm-emergency-cail-intelligence.service';
export declare class PmEmergencyController {
    private readonly emergency;
    private readonly cail;
    constructor(emergency: PmEmergencyResponseService, cail: PmEmergencyCailIntelligenceService);
    offlineSync(body: {
        projectId: number;
        checkins?: Array<Record<string, unknown>>;
        events?: Array<Record<string, unknown>>;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        checkins: number;
        events: number;
    }>;
    createPlan(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        siteId: number;
        projectId: number | null;
        title: string;
        planType: import(".prisma/client").$Enums.PmEmergencyPlanType;
        status: import(".prisma/client").$Enums.PmEmergencyPlanStatus;
        versionNum: number;
        contentJson: import(".prisma/client").Prisma.JsonValue;
        rolesJson: import(".prisma/client").Prisma.JsonValue;
        musterPointsJson: import(".prisma/client").Prisma.JsonValue;
        responseStepsJson: import(".prisma/client").Prisma.JsonValue;
        requiresAck: boolean;
        requiresAckForAccess: boolean;
        publishedAt: Date | null;
        reviewDueAt: Date | null;
        clientSyncId: string | null;
        active: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createEquipment(body: Record<string, unknown>): import(".prisma/client").Prisma.Prisma__PmEmergencyEquipmentClient<{
        id: string;
        companyId: number;
        siteId: number | null;
        projectId: number | null;
        equipmentType: import(".prisma/client").$Enums.PmEmergencyEquipmentType;
        name: string;
        locationNote: string | null;
        mapCoordsJson: import(".prisma/client").Prisma.JsonValue | null;
        readinessScore: number;
        expiresAt: Date | null;
        lastInspectionAt: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    declare(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        siteId: number;
        eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
        status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
        title: string;
        description: string | null;
        classification: string | null;
        timelineJson: import(".prisma/client").Prisma.JsonValue;
        responseActionsJson: import(".prisma/client").Prisma.JsonValue;
        safetyEventId: string | null;
        requiresSupervisorReview: boolean;
        supervisorReviewedAt: Date | null;
        declaredAt: Date;
        declaredByUserId: number | null;
        allClearAt: Date | null;
        closedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    status(id: string): Promise<{
        emergency: {
            notifications: {
                id: string;
                companyId: number;
                emergencyEventId: string | null;
                musterEventId: string | null;
                channel: import(".prisma/client").$Enums.PmEmergencyNotificationChannel;
                status: import(".prisma/client").$Enums.PmEmergencyNotificationStatus;
                triggerType: string;
                recipientUserId: number | null;
                recipientWorkerId: number | null;
                title: string;
                body: string;
                escalationLevel: number;
                sentAt: Date | null;
                payload: import(".prisma/client").Prisma.JsonValue | null;
                createdAt: Date;
            }[];
            musterSessions: ({
                checkins: ({
                    worker: {
                        id: number;
                        firstName: string;
                        lastName: string;
                    };
                } & {
                    id: string;
                    musterEventId: string;
                    workerId: number;
                    checkedInAt: Date;
                    checkedOutAt: Date | null;
                    method: string;
                    musterPointCode: string | null;
                    identityVerified: boolean;
                    supervisorOverride: boolean;
                    geoJson: import(".prisma/client").Prisma.JsonValue | null;
                    clientSyncId: string | null;
                })[];
            } & {
                id: string;
                companyId: number;
                siteId: number;
                projectId: number | null;
                emergencyEventId: string | null;
                status: import(".prisma/client").$Enums.MusterEventStatus;
                evacuationPhase: string;
                musterPointCode: string | null;
                siteAccessLocked: boolean;
                triggeredAt: Date;
                triggeredByUser: number | null;
                allClearAt: Date | null;
                supervisorConfirmedAt: Date | null;
                notes: string | null;
                expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
                missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
                dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
                clientSyncId: string | null;
            })[];
        } & {
            id: string;
            companyId: number;
            projectId: number | null;
            siteId: number;
            eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
            status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
            title: string;
            description: string | null;
            classification: string | null;
            timelineJson: import(".prisma/client").Prisma.JsonValue;
            responseActionsJson: import(".prisma/client").Prisma.JsonValue;
            safetyEventId: string | null;
            requiresSupervisorReview: boolean;
            supervisorReviewedAt: Date | null;
            declaredAt: Date;
            declaredByUserId: number | null;
            allClearAt: Date | null;
            closedAt: Date | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        workflowPhase: string;
        muster: {
            checkins: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                musterEventId: string;
                workerId: number;
                checkedInAt: Date;
                checkedOutAt: Date | null;
                method: string;
                musterPointCode: string | null;
                identityVerified: boolean;
                supervisorOverride: boolean;
                geoJson: import(".prisma/client").Prisma.JsonValue | null;
                clientSyncId: string | null;
            })[];
        } & {
            id: string;
            companyId: number;
            siteId: number;
            projectId: number | null;
            emergencyEventId: string | null;
            status: import(".prisma/client").$Enums.MusterEventStatus;
            evacuationPhase: string;
            musterPointCode: string | null;
            siteAccessLocked: boolean;
            triggeredAt: Date;
            triggeredByUser: number | null;
            allClearAt: Date | null;
            supervisorConfirmedAt: Date | null;
            notes: string | null;
            expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
            missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
            dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
        };
        musterComplianceScore: number;
        missingWorkerCount: number;
        checkedInCount: number;
        expectedWorkerCount: number;
        siteAccessLocked: boolean;
        canAllClear: boolean;
        canClose: boolean;
        notificationsSent: number;
    }>;
    predict(id: string): Promise<{
        emergencyEventId: string;
        score: number;
        predictiveEmergencyLikelihood?: undefined;
        musterComplianceScore?: undefined;
        responseQualityScore?: undefined;
        missingWorkerDetection?: undefined;
        missingWorkerIds?: undefined;
        hazardCorrelation?: undefined;
        explainability?: undefined;
    } | {
        emergencyEventId: string;
        predictiveEmergencyLikelihood: number;
        musterComplianceScore: number;
        responseQualityScore: number;
        missingWorkerDetection: boolean;
        missingWorkerIds: import(".prisma/client").Prisma.JsonArray;
        hazardCorrelation: {
            eventId: string;
            jha: string;
            inspections: string;
            incidents: string;
            correctiveActions: string;
        };
        explainability: {
            rule: string;
            detail: string;
        }[];
        score?: undefined;
    }>;
    allClear(id: string, req: {
        user: {
            id: number;
        };
    }, body?: {
        force?: boolean;
    }): Promise<{
        emergency: {
            notifications: {
                id: string;
                companyId: number;
                emergencyEventId: string | null;
                musterEventId: string | null;
                channel: import(".prisma/client").$Enums.PmEmergencyNotificationChannel;
                status: import(".prisma/client").$Enums.PmEmergencyNotificationStatus;
                triggerType: string;
                recipientUserId: number | null;
                recipientWorkerId: number | null;
                title: string;
                body: string;
                escalationLevel: number;
                sentAt: Date | null;
                payload: import(".prisma/client").Prisma.JsonValue | null;
                createdAt: Date;
            }[];
            musterSessions: ({
                checkins: ({
                    worker: {
                        id: number;
                        firstName: string;
                        lastName: string;
                    };
                } & {
                    id: string;
                    musterEventId: string;
                    workerId: number;
                    checkedInAt: Date;
                    checkedOutAt: Date | null;
                    method: string;
                    musterPointCode: string | null;
                    identityVerified: boolean;
                    supervisorOverride: boolean;
                    geoJson: import(".prisma/client").Prisma.JsonValue | null;
                    clientSyncId: string | null;
                })[];
            } & {
                id: string;
                companyId: number;
                siteId: number;
                projectId: number | null;
                emergencyEventId: string | null;
                status: import(".prisma/client").$Enums.MusterEventStatus;
                evacuationPhase: string;
                musterPointCode: string | null;
                siteAccessLocked: boolean;
                triggeredAt: Date;
                triggeredByUser: number | null;
                allClearAt: Date | null;
                supervisorConfirmedAt: Date | null;
                notes: string | null;
                expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
                missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
                dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
                clientSyncId: string | null;
            })[];
        } & {
            id: string;
            companyId: number;
            projectId: number | null;
            siteId: number;
            eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
            status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
            title: string;
            description: string | null;
            classification: string | null;
            timelineJson: import(".prisma/client").Prisma.JsonValue;
            responseActionsJson: import(".prisma/client").Prisma.JsonValue;
            safetyEventId: string | null;
            requiresSupervisorReview: boolean;
            supervisorReviewedAt: Date | null;
            declaredAt: Date;
            declaredByUserId: number | null;
            allClearAt: Date | null;
            closedAt: Date | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        workflowPhase: string;
        muster: {
            checkins: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                musterEventId: string;
                workerId: number;
                checkedInAt: Date;
                checkedOutAt: Date | null;
                method: string;
                musterPointCode: string | null;
                identityVerified: boolean;
                supervisorOverride: boolean;
                geoJson: import(".prisma/client").Prisma.JsonValue | null;
                clientSyncId: string | null;
            })[];
        } & {
            id: string;
            companyId: number;
            siteId: number;
            projectId: number | null;
            emergencyEventId: string | null;
            status: import(".prisma/client").$Enums.MusterEventStatus;
            evacuationPhase: string;
            musterPointCode: string | null;
            siteAccessLocked: boolean;
            triggeredAt: Date;
            triggeredByUser: number | null;
            allClearAt: Date | null;
            supervisorConfirmedAt: Date | null;
            notes: string | null;
            expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
            missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
            dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
        };
        musterComplianceScore: number;
        missingWorkerCount: number;
        checkedInCount: number;
        expectedWorkerCount: number;
        siteAccessLocked: boolean;
        canAllClear: boolean;
        canClose: boolean;
        notificationsSent: number;
    }>;
    close(id: string, req: {
        user: {
            id: number;
        };
    }, body?: {
        force?: boolean;
    }): Promise<{
        emergency: {
            notifications: {
                id: string;
                companyId: number;
                emergencyEventId: string | null;
                musterEventId: string | null;
                channel: import(".prisma/client").$Enums.PmEmergencyNotificationChannel;
                status: import(".prisma/client").$Enums.PmEmergencyNotificationStatus;
                triggerType: string;
                recipientUserId: number | null;
                recipientWorkerId: number | null;
                title: string;
                body: string;
                escalationLevel: number;
                sentAt: Date | null;
                payload: import(".prisma/client").Prisma.JsonValue | null;
                createdAt: Date;
            }[];
            musterSessions: ({
                checkins: ({
                    worker: {
                        id: number;
                        firstName: string;
                        lastName: string;
                    };
                } & {
                    id: string;
                    musterEventId: string;
                    workerId: number;
                    checkedInAt: Date;
                    checkedOutAt: Date | null;
                    method: string;
                    musterPointCode: string | null;
                    identityVerified: boolean;
                    supervisorOverride: boolean;
                    geoJson: import(".prisma/client").Prisma.JsonValue | null;
                    clientSyncId: string | null;
                })[];
            } & {
                id: string;
                companyId: number;
                siteId: number;
                projectId: number | null;
                emergencyEventId: string | null;
                status: import(".prisma/client").$Enums.MusterEventStatus;
                evacuationPhase: string;
                musterPointCode: string | null;
                siteAccessLocked: boolean;
                triggeredAt: Date;
                triggeredByUser: number | null;
                allClearAt: Date | null;
                supervisorConfirmedAt: Date | null;
                notes: string | null;
                expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
                missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
                dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
                clientSyncId: string | null;
            })[];
        } & {
            id: string;
            companyId: number;
            projectId: number | null;
            siteId: number;
            eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
            status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
            title: string;
            description: string | null;
            classification: string | null;
            timelineJson: import(".prisma/client").Prisma.JsonValue;
            responseActionsJson: import(".prisma/client").Prisma.JsonValue;
            safetyEventId: string | null;
            requiresSupervisorReview: boolean;
            supervisorReviewedAt: Date | null;
            declaredAt: Date;
            declaredByUserId: number | null;
            allClearAt: Date | null;
            closedAt: Date | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        workflowPhase: string;
        muster: {
            checkins: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
            } & {
                id: string;
                musterEventId: string;
                workerId: number;
                checkedInAt: Date;
                checkedOutAt: Date | null;
                method: string;
                musterPointCode: string | null;
                identityVerified: boolean;
                supervisorOverride: boolean;
                geoJson: import(".prisma/client").Prisma.JsonValue | null;
                clientSyncId: string | null;
            })[];
        } & {
            id: string;
            companyId: number;
            siteId: number;
            projectId: number | null;
            emergencyEventId: string | null;
            status: import(".prisma/client").$Enums.MusterEventStatus;
            evacuationPhase: string;
            musterPointCode: string | null;
            siteAccessLocked: boolean;
            triggeredAt: Date;
            triggeredByUser: number | null;
            allClearAt: Date | null;
            supervisorConfirmedAt: Date | null;
            notes: string | null;
            expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
            missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
            dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
        };
        musterComplianceScore: number;
        missingWorkerCount: number;
        checkedInCount: number;
        expectedWorkerCount: number;
        siteAccessLocked: boolean;
        canAllClear: boolean;
        canClose: boolean;
        notificationsSent: number;
    }>;
    startMuster(id: string, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        siteId: number;
        projectId: number | null;
        emergencyEventId: string | null;
        status: import(".prisma/client").$Enums.MusterEventStatus;
        evacuationPhase: string;
        musterPointCode: string | null;
        siteAccessLocked: boolean;
        triggeredAt: Date;
        triggeredByUser: number | null;
        allClearAt: Date | null;
        supervisorConfirmedAt: Date | null;
        notes: string | null;
        expectedWorkerIds: import(".prisma/client").Prisma.JsonValue;
        missingWorkerIds: import(".prisma/client").Prisma.JsonValue;
        dangerZoneWorkerIds: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
    }>;
    checkIn(id: string, body: Record<string, unknown>): Promise<{
        id: string;
        musterEventId: string;
        workerId: number;
        checkedInAt: Date;
        checkedOutAt: Date | null;
        method: string;
        musterPointCode: string | null;
        identityVerified: boolean;
        supervisorOverride: boolean;
        geoJson: import(".prisma/client").Prisma.JsonValue | null;
        clientSyncId: string | null;
    }>;
}
