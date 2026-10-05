import { EmergencyService } from './emergency.service';
export declare class EmergencyController {
    private readonly emergency;
    constructor(emergency: EmergencyService);
    listPlans(siteId: string): Promise<{
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
    createPlan(body: {
        siteId: number;
        title: string;
        planType?: string;
        contentJson?: Record<string, unknown>;
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
    triggerMuster(req: {
        user?: {
            userId?: number;
        };
    }, body: {
        siteId: number;
        projectId?: number;
        notes?: string;
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
    checkIn(id: string, body: {
        workerId: number;
        method?: string;
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
        geoJson: import(".prisma/client").Prisma.JsonValue | null;
        clientSyncId: string | null;
    }>;
    allClear(id: string): Promise<{
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
    history(siteId: string): Promise<({
        _count: {
            checkins: number;
        };
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
    })[]>;
}
