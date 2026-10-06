import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  SmsAccessPlane,
  type Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPayload } from '../types';
import type { SmsRequestScope } from '../types';
import { SmsProductionOpsService } from '../services/sms-production-ops.service';

export type SmsAuditAction =
  | 'authz.deny'
  | 'geo.entitlement.deny'
  | 'record.create'
  | 'record.update'
  | 'record.delete'
  | 'investigation.package.view'
  | 'metrics.recompute'
  | 'ai.inference'
  | 'ai.cache.hit'
  | 'ai.cache.miss'
  | 'ai.shown'
  | 'ai.accepted'
  | 'ai.dismissed'
  | 'ai.applied'
  | 'ai.fallback'
  | 'erp.generate'
  | 'erp.simulate'
  | 'erp.drill'
  | 'export'
  | 'ingest.batch'
  | 'benchmark.compute'
  | 'regional.rollup';

@Injectable()
export class SmsAuditService {
  private readonly logger = new Logger(SmsAuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly ops?: SmsProductionOpsService,
  ) {}

  async log(params: {
    scope: Pick<SmsRequestScope, 'companyId' | 'userId' | 'plane'> &
      Partial<Pick<SmsRequestScope, 'requestId'>>;
    action: SmsAuditAction | string;
    entityType: string;
    entityId?: string | null;
    before?: unknown;
    after?: unknown;
    payload?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.smsAuditLog.create({
        data: {
          companyId: params.scope.companyId,
          actorUserId: params.scope.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId ?? undefined,
          plane: params.scope.plane as SmsAccessPlane,
          requestId: params.scope.requestId,
          beforeHash:
            params.before != null ? hashPayload(params.before) : undefined,
          afterHash:
            params.after != null ? hashPayload(params.after) : undefined,
          payloadJson: (params.payload ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
          ip: params.ip,
          userAgent: params.userAgent,
        },
      });
      this.ops?.emitMetric('audit.write', {
        action: params.action,
        entityType: params.entityType,
        companyId: params.scope.companyId,
      });
    } catch (err) {
      this.logger.warn(
        `sms_audit_log write failed: ${(err as Error).message}`,
      );
      void this.ops?.raiseAlert({
        severity: 'warning',
        title: 'SMS audit log write failed',
        detail: (err as Error).message,
        companyId: params.scope.companyId,
        requestId: params.scope.requestId,
      });
    }
  }

  async logAiSuggestion(params: {
    companyId: number;
    suggestionId: string;
    behaviorId: string;
    actorUserId?: number;
    decision: 'accepted' | 'dismissed' | 'applied' | 'shown';
    entityType?: string;
    entityId?: string;
    reason?: string;
    payload?: Record<string, unknown>;
  }) {
    await this.prisma.smsAiSuggestionAudit.create({
      data: {
        companyId: params.companyId,
        suggestionId: params.suggestionId,
        behaviorId: params.behaviorId,
        actorUserId: params.actorUserId,
        decision: params.decision,
        entityType: params.entityType,
        entityId: params.entityId,
        reason: params.reason,
        payloadJson: params.payload as Prisma.InputJsonValue | undefined,
      },
    });
    this.ops?.logAiDecision({
      companyId: params.companyId,
      suggestionId: params.suggestionId,
      behaviorId: params.behaviorId,
      decision: params.decision,
      actorUserId: params.actorUserId,
      confidence:
        typeof params.payload?.confidence === 'number'
          ? params.payload.confidence
          : undefined,
      degraded: Boolean(params.payload?.degraded),
      guardrails: Array.isArray(params.payload?.guardrails)
        ? (params.payload.guardrails as string[])
        : undefined,
    });
  }
}
