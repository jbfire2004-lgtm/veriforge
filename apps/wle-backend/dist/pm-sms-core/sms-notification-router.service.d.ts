import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';
export type SmsNotifyPayload = {
    companyId: number;
    projectId?: number;
    eventKey: string;
    title: string;
    body: string;
    entityType?: string;
    entityId?: string;
    userIds?: number[];
    hecaEscalation?: boolean;
    metadata?: Record<string, unknown>;
};
export declare class SmsNotificationRouterService {
    private readonly prisma;
    private readonly notifications?;
    private readonly ecosystem?;
    private readonly logger;
    constructor(prisma: PrismaService, notifications?: NotificationsService, ecosystem?: SafetyEcosystemEventsService);
    listRoutes(companyId: number): Promise<{
        id: string;
        companyId: number;
        eventKey: string;
        channelsJson: import(".prisma/client").Prisma.JsonValue;
        rolesJson: import(".prisma/client").Prisma.JsonValue;
        templateKey: string;
        escalateOnHecaHighEnergy: boolean;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    ensureDefaultRoutes(companyId: number): Promise<{
        id: string;
        companyId: number;
        eventKey: string;
        channelsJson: import(".prisma/client").Prisma.JsonValue;
        rolesJson: import(".prisma/client").Prisma.JsonValue;
        templateKey: string;
        escalateOnHecaHighEnergy: boolean;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    dispatch(payload: SmsNotifyPayload): Promise<{
        channels: string[];
        roles: string[];
        templateKey: string;
    }>;
}
