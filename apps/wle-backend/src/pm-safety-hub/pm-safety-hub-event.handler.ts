import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PmSafetyHubDomain } from '@prisma/client';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import {
  DomainEvent,
  type DomainEventPayload,
} from '../modules/api-platform/events/domain-events';
import { HUB_INVALIDATION_EVENTS } from './safety-hub.constants';
import { PmSafetyHubDashboardService } from './pm-safety-hub-dashboard.service';
import { PmSafetyHubEvidenceService } from './pm-safety-hub-evidence.service';

@Injectable()
export class PmSafetyHubEventHandler implements OnModuleInit {
  private readonly logger = new Logger(PmSafetyHubEventHandler.name);

  constructor(
    private readonly bus: EventBusService,
    private readonly dashboard: PmSafetyHubDashboardService,
    private readonly evidence: PmSafetyHubEvidenceService,
  ) {}

  onModuleInit() {
    for (const name of HUB_INVALIDATION_EVENTS) {
      this.bus.on(name, (payload) => void this.onDomainEvent(name, payload));
    }
    this.logger.log(
      `Safety Hub listener registered for ${HUB_INVALIDATION_EVENTS.length} events`,
    );
  }

  private async onDomainEvent(eventName: string, payload: DomainEventPayload) {
    if (!payload.companyId) return;

    if (eventName === DomainEvent.SAFETY_HUB_INVALIDATE) {
      try {
        await this.dashboard.buildSnapshot({
          companyId: payload.companyId,
          projectId: payload.projectId,
        });
      } catch (err) {
        this.logger.warn(
          `Hub invalidate refresh failed: ${(err as Error).message}`,
        );
      }
      return;
    }

    const domain = this.mapDomain(eventName, payload);

    await this.dashboard.logEvent({
      companyId: payload.companyId,
      projectId: payload.projectId,
      eventName,
      domain,
      entityType: payload.entityType,
      entityId: payload.entityId != null ? String(payload.entityId) : undefined,
      actorId: payload.actorId,
      payload: payload.data,
    });

    if (eventName === DomainEvent.SAFETY_EVIDENCE_INDEXED && payload.data) {
      const d = payload.data as Record<string, unknown>;
      await this.evidence.indexEvidence({
        companyId: payload.companyId,
        projectId: payload.projectId,
        domain:
          (d.domain as PmSafetyHubDomain) ??
          PmSafetyHubDomain.corrective_action,
        sourceType: String(d.sourceType ?? payload.entityType ?? 'unknown'),
        sourceId: String(d.sourceId ?? payload.entityId ?? ''),
        attachmentId: d.attachmentId as string | undefined,
        fileName: d.fileName as string | undefined,
        mimeType: d.mimeType as string | undefined,
        storageKey: d.storageKey as string | undefined,
        thumbnailDataUrl: d.thumbnailDataUrl as string | undefined,
        title: d.title as string | undefined,
        uploadedByUserId: payload.actorId,
      });
    }

    try {
      await this.dashboard.buildSnapshot({
        companyId: payload.companyId,
        projectId: payload.projectId,
      });
    } catch (err) {
      this.logger.warn(
        `Hub snapshot refresh failed: ${(err as Error).message}`,
      );
    }
  }

  private mapDomain(
    eventName: string,
    payload: DomainEventPayload,
  ): PmSafetyHubDomain | undefined {
    if (eventName.includes('cail') || eventName.includes('capa')) {
      return PmSafetyHubDomain.corrective_action;
    }
    if (eventName.includes('inspection')) return PmSafetyHubDomain.inspection;
    if (eventName.includes('investigation'))
      return PmSafetyHubDomain.investigation;
    if (eventName.includes('substance'))
      return PmSafetyHubDomain.substance_testing;
    if (eventName.includes('contractor')) return PmSafetyHubDomain.contractor;
    if (payload.entityType === 'equipment') return PmSafetyHubDomain.equipment;
    if (payload.entityType === 'training') return PmSafetyHubDomain.competency;
    return undefined;
  }
}
