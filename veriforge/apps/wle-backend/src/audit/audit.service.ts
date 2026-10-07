import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';
import type {
  AuditActor,
  AuditEntityRef,
  AuditLogOptions,
} from './audit-log.types';
import type { SecurityActor } from '../security/security.types';

/** @deprecated Prefer {@link AuditLogService.logAudit} with typed actions. */
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

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Legacy shim — maps to structured {@link AuditLogService.logAudit}. */
  async log(input: LegacyAuditLogInput) {
    const actor: AuditActor = { id: input.userId ?? null };
    const entity: AuditEntityRef = {
      type: input.entity ?? 'Unknown',
      id: input.entityId ?? 'unknown',
      tenantId: input.tenantId ?? null,
    };
    return this.auditLog.logAudit(actor, input.action, entity, input.metadata, {
      ip: input.ip,
      userAgent: input.userAgent,
    });
  }

  async logAudit(
    actor: AuditActor | null | undefined,
    action: string,
    entity: AuditEntityRef,
    metadata?: Record<string, unknown>,
    options?: AuditLogOptions,
  ) {
    return this.auditLog.logAudit(actor, action, entity, metadata, options);
  }

  async findAll(actor: SecurityActor, companyId?: number, limit = 200) {
    const where = this.buildTenantWhere(actor, companyId);
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: this.coerceLimit(limit),
    });
  }

  async findForUser(
    actor: SecurityActor,
    actorId: number,
    companyId?: number,
    limit = 200,
  ) {
    const tenantWhere = this.buildTenantWhere(actor, companyId);
    return this.prisma.auditLog.findMany({
      where: { ...tenantWhere, actorId },
      orderBy: { createdAt: 'desc' },
      take: this.coerceLimit(limit),
    });
  }

  async findForEntity(
    actor: SecurityActor,
    entityType: string,
    entityId: number | string,
    companyId?: number,
    limit = 200,
  ) {
    const tenantWhere = this.buildTenantWhere(actor, companyId);
    return this.prisma.auditLog.findMany({
      where: {
        ...tenantWhere,
        entityType,
        entityId: String(entityId),
      },
      orderBy: { createdAt: 'desc' },
      take: this.coerceLimit(limit),
    });
  }

  async findForTenant(actor: SecurityActor, tenantId: number, limit = 200) {
    const where = this.buildTenantWhere(actor, tenantId);
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: this.coerceLimit(limit),
    });
  }

  private buildTenantWhere(actor: SecurityActor, requestedCompanyId?: number) {
    const normalizedCompanyId =
      requestedCompanyId != null && Number.isFinite(requestedCompanyId)
        ? Math.trunc(requestedCompanyId)
        : undefined;

    if (actor.role === UserRole.SUPER_ADMIN || actor.role === UserRole.ADMIN) {
      if (normalizedCompanyId && normalizedCompanyId > 0) {
        return { tenantId: normalizedCompanyId };
      }
      return {};
    }

    if (actor.companyId == null) {
      throw new ForbiddenException('Tenant company context required');
    }
    if (
      normalizedCompanyId != null &&
      normalizedCompanyId > 0 &&
      normalizedCompanyId !== actor.companyId
    ) {
      throw new ForbiddenException('Cross-tenant audit access denied');
    }
    return { tenantId: actor.companyId };
  }

  private coerceLimit(limit: number): number {
    if (!Number.isFinite(limit)) return 200;
    return Math.max(1, Math.min(500, Math.trunc(limit)));
  }
}
