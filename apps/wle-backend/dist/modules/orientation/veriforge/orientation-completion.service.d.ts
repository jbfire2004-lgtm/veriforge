import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../audit/audit-log.service';
import { EventBusService } from '../../api-platform/events/event-bus.service';
import type { CreateOrientationCompletionInput } from './orientation.types';
export declare class OrientationCompletionService {
    private readonly prisma;
    private readonly auditLog;
    private readonly events?;
    constructor(prisma: PrismaService, auditLog: AuditLogService, events?: EventBusService);
    create(input: CreateOrientationCompletionInput): Promise<any>;
    list(filters: {
        workerId?: number;
        orientationId?: string;
    }): Promise<({
        orientation: {
            id: string;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            version: string;
        };
    } & {
        id: string;
        workerId: number;
        orientationId: string;
        companyId: number;
        projectId: number | null;
        completedOn: Date | null;
        expiresOn: Date | null;
        score: number | null;
        status: import(".prisma/client").$Enums.OrientationCompletionStatus;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    expireDue(companyId?: number): Promise<{
        expired: number;
    }>;
}
