import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { Prisma, VeripmPermitActivityKind } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import type {
  DomainEventName,
  DomainEventPayload,
} from '../modules/api-platform/events/domain-events';

export type RecordActivityInput = {
  permitId: string;
  kind: VeripmPermitActivityKind;
  source?: string;
  statusFrom?: string | null;
  statusTo?: string | null;
  actorUserId?: number | null;
  fieldosTaskId?: string | null;
  summary: string;
  payload?: Record<string, unknown>;
  photoUrl?: string | null;
  signatureRole?: string | null;
  signatureName?: string | null;
  cssDelta?: number | null;
  occurredAt?: Date;
};

/**
 * Microservice-style activity ledger for VERIPM permits + FieldOS events.
 */
@Injectable()
export class VeripmPermitActivityService {
  private readonly logger = new Logger(VeripmPermitActivityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordActivityInput) {
    try {
      return await this.prisma.veripmPermitActivity.create({
        data: {
          activityId: randomUUID(),
          permitId: input.permitId,
          kind: input.kind,
          source: input.source ?? 'veripm',
          statusFrom: input.statusFrom ?? undefined,
          statusTo: input.statusTo ?? undefined,
          actorUserId: input.actorUserId ?? undefined,
          fieldosTaskId: input.fieldosTaskId ?? undefined,
          summary: input.summary,
          payloadJson: (input.payload ?? {}) as Prisma.InputJsonValue,
          photoUrl: input.photoUrl ?? undefined,
          signatureRole: input.signatureRole ?? undefined,
          signatureName: input.signatureName ?? undefined,
          cssDelta: input.cssDelta ?? undefined,
          occurredAt: input.occurredAt ?? new Date(),
        },
      });
    } catch (err) {
      this.logger.warn(
        `Activity record failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  async listForPermit(permitId: string, take = 100) {
    return this.prisma.veripmPermitActivity.findMany({
      where: { permitId },
      orderBy: { occurredAt: 'desc' },
      take,
    });
  }
}

/**
 * Risk-weighted CSS deltas from permit performance.
 * Positive: clean close of high-risk permit, complete signatures.
 * Negative: sync_error, incident during window, cancelled high-risk, missing controls.
 */
export function computePermitCssDelta(args: {
  riskLevel: string;
  event:
    | 'closed_clean'
    | 'closed_with_incident'
    | 'sync_error'
    | 'cancelled'
    | 'signatures_complete'
    | 'hazard_controls_logged';
}): number {
  const riskWeight =
    args.riskLevel === 'critical'
      ? 2.0
      : args.riskLevel === 'high'
        ? 1.5
        : args.riskLevel === 'medium'
          ? 1.0
          : 0.5;

  const base: Record<typeof args.event, number> = {
    closed_clean: 4,
    signatures_complete: 1.5,
    hazard_controls_logged: 1,
    closed_with_incident: -12,
    sync_error: -3,
    cancelled: -2,
  };

  return Math.round(base[args.event] * riskWeight * 10) / 10;
}

@Injectable()
export class VeripmPermitEventPipeline implements OnModuleInit {
  private readonly logger = new Logger(VeripmPermitEventPipeline.name);

  constructor(
    @Optional() private readonly bus?: EventBusService,
  ) {}

  onModuleInit() {
    if (!this.bus) return;
    this.bus.on(DomainEvent.PERMIT_CLOSED, (e) => this.onPermitClosed(e));
    this.bus.on(DomainEvent.PERMIT_FIELDOS_UPDATED, (e) =>
      this.onFieldOsUpdate(e),
    );
    this.bus.on(DomainEvent.PERMIT_CSS_IMPACT, (e) => {
      this.logger.log(
        `CSS impact event contractor=${e.data?.contractorId} delta=${e.data?.cssDelta}`,
      );
    });
  }

  emitPermitEvent(
    name: DomainEventName,
    args: {
      permitId: string;
      companyId: number;
      projectId?: number;
      contractorId?: number | null;
      data?: Record<string, unknown>;
    },
  ) {
    this.bus?.emit({
      name,
      occurredAt: new Date().toISOString(),
      entityType: 'veripm_permit',
      entityId: args.permitId,
      companyId: args.companyId,
      projectId: args.projectId,
      data: {
        contractorId: args.contractorId ?? undefined,
        ...args.data,
        idempotencyKey: `${name}:${args.permitId}:${Date.now()}`,
      },
    });
  }

  private onPermitClosed(e: DomainEventPayload) {
    this.bus?.emit({
      name: DomainEvent.PERMIT_DASHBOARD_INVALIDATE,
      occurredAt: new Date().toISOString(),
      entityType: 'veripm_permit',
      entityId: e.entityId,
      companyId: e.companyId,
      projectId: e.projectId,
      data: { reason: 'permit_closed', ...e.data },
    });
    this.bus?.emit({
      name: DomainEvent.COMPLIANCE_RECALC,
      occurredAt: new Date().toISOString(),
      entityType: 'contractor',
      entityId: String(e.data?.contractorId ?? e.entityId),
      companyId: e.companyId,
      data: { source: 'permit_closed', permitId: e.entityId },
    });
  }

  private onFieldOsUpdate(e: DomainEventPayload) {
    this.bus?.emit({
      name: DomainEvent.PERMIT_DASHBOARD_INVALIDATE,
      occurredAt: new Date().toISOString(),
      entityType: 'veripm_permit',
      entityId: e.entityId,
      companyId: e.companyId,
      projectId: e.projectId,
      data: { reason: 'fieldos_webhook', ...e.data },
    });
  }
}
