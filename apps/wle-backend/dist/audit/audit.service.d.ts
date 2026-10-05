import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';
import type { AuditActor, AuditEntityRef, AuditLogOptions } from './audit-log.types';
import type { SecurityActor } from '../security/security.types';
interface LegacyAuditLogInput {
    userId?: number | null;
    action: string;
    entity?: string;
    entityId?: number | string | null;
    metadata?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
    tenantId?: number | null;
}
export declare class AuditService {
    private readonly prisma;
    private readonly auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    log(input: LegacyAuditLogInput): Promise<{
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
    }>;
    logAudit(actor: AuditActor | null | undefined, action: string, entity: AuditEntityRef, metadata?: Record<string, unknown>, options?: AuditLogOptions): Promise<{
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
    }>;
    findAll(actor: SecurityActor, companyId?: number, limit?: number): Promise<{
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
    findForUser(actor: SecurityActor, actorId: number, companyId?: number, limit?: number): Promise<{
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
    findForEntity(actor: SecurityActor, entityType: string, entityId: number | string, companyId?: number, limit?: number): Promise<{
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
    findForTenant(actor: SecurityActor, tenantId: number, limit?: number): Promise<{
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
    private buildTenantWhere;
    private coerceLimit;
}
export {};
