import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditActor, AuditEntityRef, AuditLogOptions } from './audit-log.types';
export declare class AuditLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    logAudit(actor: AuditActor | null | undefined, action: string, entity: AuditEntityRef, metadata?: Record<string, unknown>, options?: AuditLogOptions): Promise<{
        id: number;
        actorId: number | null;
        tenantId: number | null;
        action: string;
        entityType: string | null;
        entityId: string | null;
        metadataJson: Prisma.JsonValue | null;
        ip: string | null;
        userAgent: string | null;
        createdAt: Date;
    }>;
    findForTenant(tenantId: number, limit?: number): Promise<{
        id: number;
        actorId: number | null;
        tenantId: number | null;
        action: string;
        entityType: string | null;
        entityId: string | null;
        metadataJson: Prisma.JsonValue | null;
        ip: string | null;
        userAgent: string | null;
        createdAt: Date;
    }[]>;
    findForEntity(entityType: string, entityId: string | number, limit?: number): Promise<{
        id: number;
        actorId: number | null;
        tenantId: number | null;
        action: string;
        entityType: string | null;
        entityId: string | null;
        metadataJson: Prisma.JsonValue | null;
        ip: string | null;
        userAgent: string | null;
        createdAt: Date;
    }[]>;
    private resolveTenantId;
    private buildMetadata;
}
