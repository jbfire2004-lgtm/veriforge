import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class EmergencyService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPlans(siteId: number): Promise<{
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
        companyId?: number;
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
    triggerMuster(data: {
        siteId: number;
        projectId?: number;
        triggeredByUser?: number;
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
        expectedWorkerIds: Prisma.JsonValue;
        missingWorkerIds: Prisma.JsonValue;
        dangerZoneWorkerIds: Prisma.JsonValue;
        clientSyncId: string | null;
    }>;
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
    checkIn(data: {
        musterEventId: string;
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
        geoJson: Prisma.JsonValue | null;
        clientSyncId: string | null;
    }>;
    allClear(musterEventId: string): Promise<{
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
    listMusterHistory(siteId: number, limit?: number): Promise<({
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
        expectedWorkerIds: Prisma.JsonValue;
        missingWorkerIds: Prisma.JsonValue;
        dangerZoneWorkerIds: Prisma.JsonValue;
        clientSyncId: string | null;
    })[]>;
}
