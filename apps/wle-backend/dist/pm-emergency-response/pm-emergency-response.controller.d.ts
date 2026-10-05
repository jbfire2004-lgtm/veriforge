import { PmEmergencyEventStatus } from '@prisma/client';
import { PmEmergencyResponseService } from './pm-emergency-response.service';
import { PmEmergencyCailIntelligenceService } from './pm-emergency-cail-intelligence.service';
export declare class PmEmergencyResponseController {
    private readonly emergency;
    private readonly cail;
    constructor(emergency: PmEmergencyResponseService, cail: PmEmergencyCailIntelligenceService);
    listPlans(companyId: string, siteId?: string, projectId?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
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
    publishPlan(id: string, req: {
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
    acknowledgePlan(body: {
        planId: string;
        workerId: number;
        signatureData?: string;
    }): Promise<{
        id: string;
        planId: string;
        workerId: number;
        acknowledgedAt: Date;
        signatureData: string | null;
        clientSyncId: string | null;
    }>;
    declareEvent(body: Record<string, unknown>, req: {
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
    transitionEvent(id: string, status: PmEmergencyEventStatus, req: {
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
    addAttachment(id: string, body: Record<string, unknown>): Promise<{
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
    startMuster(body: Record<string, unknown>, req: {
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
    activeMuster(siteId: string): Promise<{
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
    allClear(id: string, req: {
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
    listEquipment(companyId: string, siteId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
        mapCoordsJson: import(".prisma/client").Prisma.JsonValue | null;
        readinessScore: number;
        expiresAt: Date | null;
        lastInspectionAt: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    inspectEquipment(id: string, body: {
        passed: boolean;
        notes?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        emergencyEquipmentId: string;
        passed: boolean;
        notes: string | null;
        inspectedAt: Date;
        inspectedByUserId: number | null;
    }>;
    scanEquipment(companyId: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        scanned: number;
        capasCreated: number;
    }>;
    workerAccess(workerId: string, projectId: string): Promise<{
        allowed: boolean;
        reason: string;
        emergencyActive: boolean;
    } | {
        allowed: boolean;
        emergencyActive: boolean;
        reason?: undefined;
    }>;
    siteLock(projectId: string): import(".prisma/client").Prisma.Prisma__PmSiteEmergencyLockClient<{
        id: string;
        projectId: number;
        emergencyEventId: string;
        active: boolean;
        lockedAt: Date;
        unlockedAt: Date | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    analytics(projectId: string): Promise<{
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
    intelligence(projectId: string): Promise<import("./pm-emergency-cail-intelligence.service").EmergencyCailInsight[]>;
    syncBundle(projectId: string): Promise<{
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
            mapCoordsJson: import(".prisma/client").Prisma.JsonValue | null;
            readinessScore: number;
            expiresAt: Date | null;
            lastInspectionAt: Date | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    applySync(projectId: string, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        checkins: number;
        events: number;
    }>;
    station(companyId: string, siteId: string): Promise<{
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
        }[];
    }>;
}
