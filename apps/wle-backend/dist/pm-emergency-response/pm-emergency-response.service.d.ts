import { PmEmergencyEventStatus, PmEmergencyEventType, PmEmergencyPlanType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { MusterPoint } from './muster-geofence.engine';
import { PmEmergencyCailIntelligenceService } from './pm-emergency-cail-intelligence.service';
export declare class PmEmergencyResponseService {
    private readonly prisma;
    private readonly cail;
    private readonly notifications?;
    private readonly capaAuto?;
    private readonly workflow;
    private readonly geofence;
    constructor(prisma: PrismaService, cail: PmEmergencyCailIntelligenceService, notifications?: NotificationsService, capaAuto?: PmCapaAutoGenerateService);
    private audit;
    listPlans(filters: {
        companyId: number;
        siteId?: number;
        projectId?: number;
        planType?: PmEmergencyPlanType;
    }): Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        siteId: number;
        projectId: number | null;
        title: string;
        planType: import(".prisma/client").$Enums.PmEmergencyPlanType;
        status: import(".prisma/client").$Enums.PmEmergencyPlanStatus;
        versionNum: number;
        contentJson: Prisma.JsonValue;
        rolesJson: Prisma.JsonValue;
        musterPointsJson: Prisma.JsonValue;
        responseStepsJson: Prisma.JsonValue;
        requiresAck: boolean;
        requiresAckForAccess: boolean;
        publishedAt: Date | null;
        reviewDueAt: Date | null;
        clientSyncId: string | null;
        active: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createPlan(data: {
        companyId: number;
        siteId: number;
        projectId?: number;
        title: string;
        planType?: PmEmergencyPlanType;
        contentJson?: Record<string, unknown>;
        rolesJson?: unknown[];
        musterPointsJson?: MusterPoint[];
        responseStepsJson?: unknown[];
        clientSyncId?: string;
    }, actorId?: number): Promise<{
        id: string;
        companyId: number;
        siteId: number;
        projectId: number | null;
        title: string;
        planType: import(".prisma/client").$Enums.PmEmergencyPlanType;
        status: import(".prisma/client").$Enums.PmEmergencyPlanStatus;
        versionNum: number;
        contentJson: Prisma.JsonValue;
        rolesJson: Prisma.JsonValue;
        musterPointsJson: Prisma.JsonValue;
        responseStepsJson: Prisma.JsonValue;
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
    publishPlan(id: string, actorId?: number): Promise<{
        id: string;
        companyId: number;
        siteId: number;
        projectId: number | null;
        title: string;
        planType: import(".prisma/client").$Enums.PmEmergencyPlanType;
        status: import(".prisma/client").$Enums.PmEmergencyPlanStatus;
        versionNum: number;
        contentJson: Prisma.JsonValue;
        rolesJson: Prisma.JsonValue;
        musterPointsJson: Prisma.JsonValue;
        responseStepsJson: Prisma.JsonValue;
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
    acknowledgePlan(data: {
        planId: string;
        workerId: number;
        signatureData?: string;
        clientSyncId?: string;
    }): Promise<{
        id: string;
        planId: string;
        workerId: number;
        acknowledgedAt: Date;
        signatureData: string | null;
        clientSyncId: string | null;
    }>;
    declareEmergency(data: {
        companyId: number;
        siteId: number;
        projectId?: number;
        eventType: PmEmergencyEventType;
        title: string;
        description?: string;
        declaredByUserId?: number;
        autoMuster?: boolean;
        lockSiteAccess?: boolean;
        requirePublishedPlan?: boolean;
    }, actorId?: number): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        siteId: number;
        eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
        status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
        title: string;
        description: string | null;
        classification: string | null;
        timelineJson: Prisma.JsonValue;
        responseActionsJson: Prisma.JsonValue;
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
    transitionEvent(id: string, to: PmEmergencyEventStatus, actorId?: number): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        siteId: number;
        eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
        status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
        title: string;
        description: string | null;
        classification: string | null;
        timelineJson: Prisma.JsonValue;
        responseActionsJson: Prisma.JsonValue;
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
    addEventAttachment(emergencyEventId: string, data: {
        storageKey?: string;
        fileName?: string;
        mimeType?: string;
        dataUrl?: string;
        clientSyncId?: string;
    }): Promise<{
        id: string;
        emergencyEventId: string;
        storageKey: string | null;
        fileName: string | null;
        mimeType: string | null;
        dataUrl: string | null;
        coreFileId: number | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    startMuster(data: {
        companyId: number;
        siteId: number;
        projectId?: number;
        emergencyEventId?: string;
        triggeredByUser?: number;
        notes?: string;
        expectedWorkerIds?: number[];
        clientSyncId?: string;
    }, actorId?: number): Promise<{
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
        expectedWorkerIds: Prisma.JsonValue;
        missingWorkerIds: Prisma.JsonValue;
        dangerZoneWorkerIds: Prisma.JsonValue;
        clientSyncId: string | null;
    }>;
    private resolveExpectedWorkers;
    getActiveMuster(siteId: number): Promise<{
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
            geoJson: Prisma.JsonValue | null;
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
        expectedWorkerIds: Prisma.JsonValue;
        missingWorkerIds: Prisma.JsonValue;
        dangerZoneWorkerIds: Prisma.JsonValue;
        clientSyncId: string | null;
    }>;
    private refreshMissingWorkers;
    musterCheckIn(data: {
        musterEventId: string;
        workerId: number;
        method?: string;
        musterPointCode?: string;
        lat?: number;
        lng?: number;
        supervisorOverride?: boolean;
        clientSyncId?: string;
    }): Promise<{
        id: string;
        musterEventId: string;
        workerId: number;
        checkedInAt: Date;
        checkedOutAt: Date | null;
        method: string;
        musterPointCode: string | null;
        identityVerified: boolean;
        supervisorOverride: boolean;
        geoJson: Prisma.JsonValue | null;
        clientSyncId: string | null;
    }>;
    mapWorkflowPhase(status: PmEmergencyEventStatus): string;
    getEventStatus(emergencyEventId: string): Promise<{
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
                payload: Prisma.JsonValue | null;
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
                    geoJson: Prisma.JsonValue | null;
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
                expectedWorkerIds: Prisma.JsonValue;
                missingWorkerIds: Prisma.JsonValue;
                dangerZoneWorkerIds: Prisma.JsonValue;
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
            timelineJson: Prisma.JsonValue;
            responseActionsJson: Prisma.JsonValue;
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
                geoJson: Prisma.JsonValue | null;
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
            expectedWorkerIds: Prisma.JsonValue;
            missingWorkerIds: Prisma.JsonValue;
            dangerZoneWorkerIds: Prisma.JsonValue;
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
    startMusterForEvent(emergencyEventId: string, body: Record<string, unknown>, actorId?: number): Promise<{
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
        expectedWorkerIds: Prisma.JsonValue;
        missingWorkerIds: Prisma.JsonValue;
        dangerZoneWorkerIds: Prisma.JsonValue;
        clientSyncId: string | null;
    }>;
    musterCheckInForEvent(emergencyEventId: string, data: {
        workerId: number;
        method?: string;
        lat?: number;
        lng?: number;
        musterPointCode?: string;
        supervisorOverride?: boolean;
        clientSyncId?: string;
    }): Promise<{
        id: string;
        musterEventId: string;
        workerId: number;
        checkedInAt: Date;
        checkedOutAt: Date | null;
        method: string;
        musterPointCode: string | null;
        identityVerified: boolean;
        supervisorOverride: boolean;
        geoJson: Prisma.JsonValue | null;
        clientSyncId: string | null;
    }>;
    allClearEmergency(emergencyEventId: string, actorId?: number, force?: boolean): Promise<{
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
                payload: Prisma.JsonValue | null;
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
                    geoJson: Prisma.JsonValue | null;
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
                expectedWorkerIds: Prisma.JsonValue;
                missingWorkerIds: Prisma.JsonValue;
                dangerZoneWorkerIds: Prisma.JsonValue;
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
            timelineJson: Prisma.JsonValue;
            responseActionsJson: Prisma.JsonValue;
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
                geoJson: Prisma.JsonValue | null;
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
            expectedWorkerIds: Prisma.JsonValue;
            missingWorkerIds: Prisma.JsonValue;
            dangerZoneWorkerIds: Prisma.JsonValue;
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
    closeEmergency(emergencyEventId: string, actorId?: number, force?: boolean): Promise<{
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
                payload: Prisma.JsonValue | null;
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
                    geoJson: Prisma.JsonValue | null;
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
                expectedWorkerIds: Prisma.JsonValue;
                missingWorkerIds: Prisma.JsonValue;
                dangerZoneWorkerIds: Prisma.JsonValue;
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
            timelineJson: Prisma.JsonValue;
            responseActionsJson: Prisma.JsonValue;
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
                geoJson: Prisma.JsonValue | null;
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
            expectedWorkerIds: Prisma.JsonValue;
            missingWorkerIds: Prisma.JsonValue;
            dangerZoneWorkerIds: Prisma.JsonValue;
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
    musterAllClear(musterEventId: string, actorId?: number): Promise<{
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
        expectedWorkerIds: Prisma.JsonValue;
        missingWorkerIds: Prisma.JsonValue;
        dangerZoneWorkerIds: Prisma.JsonValue;
        clientSyncId: string | null;
    }>;
    createEmergencyEquipment(data: {
        companyId: number;
        siteId?: number;
        projectId?: number;
        equipmentType: Prisma.PmEmergencyEquipmentCreateInput['equipmentType'];
        name: string;
        locationNote?: string;
        expiresAt?: Date;
    }): Prisma.Prisma__PmEmergencyEquipmentClient<{
        id: string;
        companyId: number;
        siteId: number | null;
        projectId: number | null;
        equipmentType: import(".prisma/client").$Enums.PmEmergencyEquipmentType;
        name: string;
        locationNote: string | null;
        mapCoordsJson: Prisma.JsonValue | null;
        readinessScore: number;
        expiresAt: Date | null;
        lastInspectionAt: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    listEmergencyEquipment(companyId: number, siteId?: number): Prisma.PrismaPromise<({
        inspections: {
            id: string;
            emergencyEquipmentId: string;
            passed: boolean;
            notes: string | null;
            inspectedAt: Date;
            inspectedByUserId: number | null;
        }[];
    } & {
        id: string;
        companyId: number;
        siteId: number | null;
        projectId: number | null;
        equipmentType: import(".prisma/client").$Enums.PmEmergencyEquipmentType;
        name: string;
        locationNote: string | null;
        mapCoordsJson: Prisma.JsonValue | null;
        readinessScore: number;
        expiresAt: Date | null;
        lastInspectionAt: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    recordEquipmentInspection(emergencyEquipmentId: string, data: {
        passed: boolean;
        notes?: string;
        inspectedByUserId?: number;
    }, actorId?: number): Promise<{
        id: string;
        emergencyEquipmentId: string;
        passed: boolean;
        notes: string | null;
        inspectedAt: Date;
        inspectedByUserId: number | null;
    }>;
    scanEmergencyEquipment(companyId: number, actorId?: number): Promise<{
        scanned: number;
        capasCreated: number;
    }>;
    private dispatchNotifications;
    workerAccessCheck(workerId: number, projectId: number): Promise<{
        allowed: boolean;
        reason: string;
        emergencyActive: boolean;
    } | {
        allowed: boolean;
        emergencyActive: boolean;
        reason?: undefined;
    }>;
    isSiteLocked(projectId: number): Prisma.Prisma__PmSiteEmergencyLockClient<{
        id: string;
        projectId: number;
        emergencyEventId: string;
        active: boolean;
        lockedAt: Date;
        unlockedAt: Date | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    analytics(projectId: number): Promise<{
        avgMusterCompliance: number;
        equipmentReadinessAvg: number;
        openEmergencyEvents: number;
        recentMusterCount: number;
        projectEmergencyScore: number;
        trends: {
            avgResponseTimeMinutes: number;
            totalMissingWorkerEvents: number;
            musterComplianceTrend: number;
        };
        leadingIndicators: {
            musterGapRate: number;
            lowReadinessEquipment: number;
            equipmentReadinessPct: number;
        };
        cailInsights: import("./pm-emergency-cail-intelligence.service").EmergencyCailInsight[];
    }>;
    syncBundle(projectId: number): Promise<{
        syncedAt: string;
        projectId: number;
        plans: {
            id: string;
            companyId: number;
            siteId: number;
            projectId: number | null;
            title: string;
            planType: import(".prisma/client").$Enums.PmEmergencyPlanType;
            status: import(".prisma/client").$Enums.PmEmergencyPlanStatus;
            versionNum: number;
            contentJson: Prisma.JsonValue;
            rolesJson: Prisma.JsonValue;
            musterPointsJson: Prisma.JsonValue;
            responseStepsJson: Prisma.JsonValue;
            requiresAck: boolean;
            requiresAckForAccess: boolean;
            publishedAt: Date | null;
            reviewDueAt: Date | null;
            clientSyncId: string | null;
            active: boolean;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        roster: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
                phone: string;
            };
        } & {
            id: number;
            workerId: number;
            projectId: number;
            companyId: number;
            assignedBy: number | null;
            assignedAt: Date;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            role: string | null;
            endedAt: Date | null;
        })[];
        equipment: any[] | {
            id: number;
            name: string;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
        }[];
        emergencyEquipment: ({
            inspections: {
                id: string;
                emergencyEquipmentId: string;
                passed: boolean;
                notes: string | null;
                inspectedAt: Date;
                inspectedByUserId: number | null;
            }[];
        } & {
            id: string;
            companyId: number;
            siteId: number | null;
            projectId: number | null;
            equipmentType: import(".prisma/client").$Enums.PmEmergencyEquipmentType;
            name: string;
            locationNote: string | null;
            mapCoordsJson: Prisma.JsonValue | null;
            readinessScore: number;
            expiresAt: Date | null;
            lastInspectionAt: Date | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    applyOfflineSync(projectId: number, payload: {
        checkins?: Array<{
            musterEventId: string;
            workerId: number;
            clientSyncId?: string;
            lat?: number;
            lng?: number;
        }>;
        events?: Array<Record<string, unknown>>;
    }, actorId?: number): Promise<{
        checkins: number;
        events: number;
    }>;
    stationPayload(companyId: number, siteId: number): Promise<{
        generatedAt: string;
        activeMuster: {
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
                geoJson: Prisma.JsonValue | null;
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
            expectedWorkerIds: Prisma.JsonValue;
            missingWorkerIds: Prisma.JsonValue;
            dangerZoneWorkerIds: Prisma.JsonValue;
            clientSyncId: string | null;
        };
        activeEvents: {
            id: string;
            companyId: number;
            projectId: number | null;
            siteId: number;
            eventType: import(".prisma/client").$Enums.PmEmergencyEventType;
            status: import(".prisma/client").$Enums.PmEmergencyEventStatus;
            title: string;
            description: string | null;
            classification: string | null;
            timelineJson: Prisma.JsonValue;
            responseActionsJson: Prisma.JsonValue;
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
        }[];
    }>;
}
