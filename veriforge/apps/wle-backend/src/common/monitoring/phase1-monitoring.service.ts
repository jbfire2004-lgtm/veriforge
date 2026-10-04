import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';
import { phase1RequestStore } from './phase1-request-context.storage';

export type Phase1AuditInput = {
  userId?: number | null;
  action: string;
  entity?: string | null;
  entityId?: number | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class Phase1MonitoringService {
  private readonly logger = new Logger(Phase1MonitoringService.name);

  constructor(private readonly audit: AuditService) {}

  private base(): {
    correlationId: string | null;
    userId: number | null;
  } {
    const s = phase1RequestStore.getStore();
    return {
      correlationId: s?.correlationId ?? null,
      userId: s?.userId ?? null,
    };
  }

  private emit(
    kind: 'processing' | 'warn' | 'error',
    domain: string,
    action: string,
    data?: Record<string, unknown>,
  ) {
    const { correlationId, userId } = this.base();
    const line = JSON.stringify({
      type: `phase1.${kind}`,
      domain,
      action,
      correlationId,
      userId,
      ts: new Date().toISOString(),
      ...data,
    });
    if (kind === 'error') this.logger.error(line);
    else if (kind === 'warn') this.logger.warn(line);
    else this.logger.log(line);
  }

  /** Business / pipeline step (ingestion stage, verification branch, etc.). */
  processing(domain: string, action: string, data?: Record<string, unknown>) {
    this.emit('processing', domain, action, data);
  }

  warn(domain: string, action: string, data?: Record<string, unknown>) {
    this.emit('warn', domain, action, data);
  }

  error(domain: string, action: string, data?: Record<string, unknown>) {
    this.emit('error', domain, action, data);
  }

  /**
   * Persist {@link AuditLog} with correlation id merged into metadata for cross-reference.
   */
  async persistAudit(input: Phase1AuditInput) {
    const s = phase1RequestStore.getStore();
    const { correlationId, userId } = this.base();
    const meta =
      input.metadata &&
      typeof input.metadata === 'object' &&
      !Array.isArray(input.metadata)
        ? { ...input.metadata }
        : input.metadata != null
        ? { value: input.metadata }
        : {};
    if (correlationId)
      (meta as Record<string, unknown>).correlationId = correlationId;
    const resolvedUserId =
      input.userId !== undefined && input.userId !== null
        ? input.userId
        : userId ?? undefined;
    try {
      await this.audit.log({
        userId: resolvedUserId ?? null,
        action: input.action,
        entity: input.entity ?? undefined,
        entityId: input.entityId ?? undefined,
        metadata: Object.keys(meta).length ? meta : undefined,
        ip: input.ip ?? s?.ip ?? undefined,
        userAgent: input.userAgent ?? s?.userAgent ?? undefined,
      });
    } catch (err) {
      this.logger.warn(
        JSON.stringify({
          type: 'phase1.audit.persist_failed',
          action: input.action,
          correlationId,
          message: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  }
}
