import { AuditService } from './audit.service';
import { toSecurityActor } from '../security/actor.util';
export declare class AuditController {
    private readonly audit;
    constructor(audit: AuditService);
    all(req: {
        user: Parameters<typeof toSecurityActor>[0];
    }, companyId?: string, limit?: string): Promise<{
        id: number;
        actorId: number | null;
        tenantId: number | null;
        action: string;
        entityType: string | null;
        entityId: string | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue | null;
        ip: string | null;
        userAgent: string | null;
        createdAt: Date;
    }[]>;
    forUser(req: {
        user: Parameters<typeof toSecurityActor>[0];
    }, id: number, companyId?: string, limit?: string): Promise<{
        id: number;
        actorId: number | null;
        tenantId: number | null;
        action: string;
        entityType: string | null;
        entityId: string | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue | null;
        ip: string | null;
        userAgent: string | null;
        createdAt: Date;
    }[]>;
    forEntity(req: {
        user: Parameters<typeof toSecurityActor>[0];
    }, entity: string, id: string, companyId?: string, limit?: string): Promise<{
        id: number;
        actorId: number | null;
        tenantId: number | null;
        action: string;
        entityType: string | null;
        entityId: string | null;
        metadataJson: import(".prisma/client").Prisma.JsonValue | null;
        ip: string | null;
        userAgent: string | null;
        createdAt: Date;
    }[]>;
}
