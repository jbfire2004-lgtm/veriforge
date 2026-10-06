import { Injectable, Logger } from '@nestjs/common';
import type { DomainEventPayload } from '../api-platform/events/domain-events';
import { DomainEvent } from '../api-platform/events/domain-events';
import { AuditLogService } from '../../audit/audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  companyUsageDailyDelegate,
  providerSyncConfigDelegate,
  workerWalletBundleDelegate,
} from './vera-core-flow.prisma';

/**
 * Side effects for Vera Core domain events (audit, usage counters, offline markers).
 */
@Injectable()
export class VeraCoreFlowHandler {
  private readonly logger = new Logger(VeraCoreFlowHandler.name);

  constructor(
    private readonly audit: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  async handle(event: DomainEventPayload): Promise<void> {
    await this.audit.logAudit(
      event.actorId ? { id: event.actorId } : null,
      `event.${event.name}`,
      {
        type: event.entityType ?? 'domain_event',
        id: event.entityId ?? event.name,
        tenantId: event.companyId,
      },
      {
        projectId: event.projectId,
        occurredAt: event.occurredAt,
        companyId: event.companyId,
        data: event.data,
      },
    );

    if (event.companyId) {
      await this.bumpUsage(event.companyId, event.name);
    }

    switch (event.name) {
      case DomainEvent.TRAINING_VERIFIED:
        await this.onTrainingVerified(event);
        break;
      case DomainEvent.WALLET_UPDATED:
      case DomainEvent.WALLET_BUNDLE_SYNCED:
        await this.onWalletUpdated(event);
        break;
      case DomainEvent.PROVIDER_SYNC_EVENT:
      case DomainEvent.PROVIDER_SYNC_COMPLETED:
        await this.onProviderSync(event);
        break;
      case DomainEvent.WORKER_ASSIGNED_TO_PROJECT:
      case DomainEvent.WORKER_REMOVED_FROM_PROJECT:
        await this.onProjectAssignment(event);
        break;
      default:
        break;
    }

    this.logger.log(
      JSON.stringify({
        type: 'vera_core.flow.handled',
        event: event.name,
        entityId: event.entityId,
        companyId: event.companyId,
      }),
    );
  }

  private async onTrainingVerified(event: DomainEventPayload): Promise<void> {
    const trainingRecordId = event.entityId;
    if (trainingRecordId == null) return;
    await this.prisma.trainingVerificationRun.findFirst({
      where: { trainingRecordId: Number(trainingRecordId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async onWalletUpdated(event: DomainEventPayload): Promise<void> {
    const workerId = event.data?.workerId;
    if (typeof workerId !== 'number') return;
    const existing = await workerWalletBundleDelegate(this.prisma).findFirst({
      where: { workerId },
      orderBy: { version: 'desc' },
    });
    if (!existing) return;
    await workerWalletBundleDelegate(this.prisma).update({
      where: { id: existing.id },
      data: { syncedAt: new Date() },
    });
  }

  private async onProviderSync(event: DomainEventPayload): Promise<void> {
    const providerId = event.data?.providerId;
    if (typeof providerId !== 'number') return;
    await providerSyncConfigDelegate(this.prisma).updateMany({
      where: { providerId },
      data: { lastSyncAt: new Date() },
    });
  }

  private async onProjectAssignment(event: DomainEventPayload): Promise<void> {
    if (!event.companyId) return;
    await this.bumpUsage(event.companyId, 'project_events');
  }

  private async bumpUsage(companyId: number, eventName: string): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const field = this.usageFieldForEvent(eventName);
    if (!field) return;

    await companyUsageDailyDelegate(this.prisma).upsert({
      where: { companyId_date: { companyId, date: today } },
      create: { companyId, date: today, [field]: 1 },
      update: { [field]: { increment: 1 } },
    });
  }

  private usageFieldForEvent(eventName: string): string | null {
    if (eventName.includes('training') || eventName.includes('verification')) {
      return 'verificationEvents';
    }
    if (eventName.includes('project') || eventName.includes('assigned')) {
      return 'projectEvents';
    }
    if (eventName.includes('wallet')) return 'signoffEvents';
    return 'trainingEvents';
  }
}
