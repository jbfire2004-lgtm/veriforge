import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { phase1RequestStore } from '../common/monitoring/phase1-request-context.storage';
import type {
  AuditActor,
  AuditEntityRef,
  AuditLogOptions,
} from './audit-log.types';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Structured audit entry for safety-critical actions.
   * Tenant is resolved from entity.tenantId → actor.companyId → metadata.companyId.
   */
  async logAudit(
    actor: AuditActor | null | undefined,
    action: string,
    entity: AuditEntityRef,
    metadata?: Record<string, unknown>,
    options?: AuditLogOptions,
  ) {
    const store = phase1RequestStore.getStore();
    const tenantId = this.resolveTenantId(actor, entity, metadata);
    const entityId = String(entity.id);
    const meta = this.buildMetadata(metadata, store?.correlationId);

    const data: Prisma.AuditLogCreateInput = {
      action,
      entityType: entity.type,
      entityId,
      tenantId: tenantId ?? undefined,
      metadataJson: meta as Prisma.InputJsonValue,
      ip: options?.ip ?? store?.ip ?? undefined,
      userAgent: options?.userAgent ?? store?.userAgent ?? undefined,
      ...(actor?.id != null ? { actor: { connect: { id: actor.id } } } : {}),
    };

    const client = options?.tx ?? this.prisma;
    return client.auditLog.create({ data });
  }

  async findForTenant(tenantId: number, limit = 200) {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findForEntity(
    entityType: string,
    entityId: string | number,
    limit = 100,
  ) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId: String(entityId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private resolveTenantId(
    actor: AuditActor | null | undefined,
    entity: AuditEntityRef,
    metadata?: Record<string, unknown>,
  ): number | null {
    if (entity.tenantId != null && Number.isFinite(entity.tenantId)) {
      return entity.tenantId;
    }
    if (actor?.companyId != null && Number.isFinite(actor.companyId)) {
      return actor.companyId;
    }
    const fromMeta = metadata?.companyId ?? metadata?.tenantId;
    if (typeof fromMeta === 'number' && Number.isFinite(fromMeta)) {
      return fromMeta;
    }
    return null;
  }

  private buildMetadata(
    metadata?: Record<string, unknown>,
    correlationId?: string,
  ): Record<string, unknown> | undefined {
    const base = metadata ? { ...metadata } : {};
    if (correlationId) base.correlationId = correlationId;
    return Object.keys(base).length ? base : undefined;
  }
}
