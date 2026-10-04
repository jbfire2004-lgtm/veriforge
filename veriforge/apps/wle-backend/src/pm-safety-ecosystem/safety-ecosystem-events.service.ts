import { Injectable, Logger, Optional } from '@nestjs/common';
import { PmSafetyHubDomain } from '@prisma/client';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import {
  DomainEvent,
  type DomainEventPayload,
} from '../modules/api-platform/events/domain-events';

@Injectable()
export class SafetyEcosystemEventsService {
  private readonly logger = new Logger(SafetyEcosystemEventsService.name);

  constructor(@Optional() private readonly eventBus?: EventBusService) {}

  emit(payload: DomainEventPayload) {
    if (!this.eventBus) return;
    this.eventBus.emit(payload);
    this.logger.debug(
      `Ecosystem event ${payload.name} company=${payload.companyId}`,
    );
  }

  invalidateHub(
    companyId: number,
    projectId?: number,
    data?: Record<string, unknown>,
  ) {
    this.emit({
      name: DomainEvent.SAFETY_HUB_INVALIDATE,
      occurredAt: new Date().toISOString(),
      companyId,
      projectId,
      data,
    });
  }

  emitInvestigationUpdated(input: {
    eventId: string;
    companyId: number;
    projectId: number;
    status?: string;
    actorId?: number;
  }) {
    this.emit({
      name: DomainEvent.INVESTIGATION_UPDATED,
      occurredAt: new Date().toISOString(),
      companyId: input.companyId,
      projectId: input.projectId,
      entityType: 'investigation',
      entityId: input.eventId,
      actorId: input.actorId,
      data: { status: input.status, domain: PmSafetyHubDomain.investigation },
    });
  }

  emitCapaCreated(input: {
    actionId: string;
    companyId: number;
    projectId?: number;
    title?: string;
    actorId?: number;
    sourceModule?: string;
  }) {
    this.emit({
      name: DomainEvent.CAPA_CREATED,
      occurredAt: new Date().toISOString(),
      companyId: input.companyId,
      projectId: input.projectId,
      entityType: 'corrective_action',
      entityId: input.actionId,
      actorId: input.actorId,
      data: {
        title: input.title,
        sourceModule: input.sourceModule,
        domain: PmSafetyHubDomain.corrective_action,
      },
    });
  }

  emitCapaStatusChanged(input: {
    actionId: string;
    companyId: number;
    projectId?: number;
    status: string;
    actorId?: number;
  }) {
    this.emit({
      name: DomainEvent.CAPA_STATUS_CHANGED,
      occurredAt: new Date().toISOString(),
      companyId: input.companyId,
      projectId: input.projectId,
      entityType: 'corrective_action',
      entityId: input.actionId,
      actorId: input.actorId,
      data: {
        status: input.status,
        domain: PmSafetyHubDomain.corrective_action,
      },
    });
  }

  emitSubstanceTestCompleted(input: {
    testEventId: string;
    companyId: number;
    projectId?: number;
    outcome: string;
    workerId: number;
    actorId?: number;
  }) {
    this.emit({
      name: DomainEvent.SUBSTANCE_TEST_COMPLETED,
      occurredAt: new Date().toISOString(),
      companyId: input.companyId,
      projectId: input.projectId,
      entityType: 'substance_test',
      entityId: input.testEventId,
      actorId: input.actorId,
      data: {
        outcome: input.outcome,
        workerId: input.workerId,
        domain: PmSafetyHubDomain.substance_testing,
      },
    });
  }

  emitEvidenceIndexed(input: {
    companyId: number;
    projectId?: number;
    domain: PmSafetyHubDomain;
    sourceType: string;
    sourceId: string;
    attachmentId?: string;
    fileName?: string;
    actorId?: number;
  }) {
    this.emit({
      name: DomainEvent.SAFETY_EVIDENCE_INDEXED,
      occurredAt: new Date().toISOString(),
      companyId: input.companyId,
      projectId: input.projectId,
      actorId: input.actorId,
      entityType: input.sourceType,
      entityId: input.sourceId,
      data: {
        domain: input.domain,
        attachmentId: input.attachmentId,
        fileName: input.fileName,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
      },
    });
  }

  emitContractorPortalActivity(input: {
    dispatchId?: string;
    deficiencyId?: string;
    companyId: number;
    projectId?: number;
    activity: string;
    actorId?: number;
  }) {
    this.invalidateHub(input.companyId, input.projectId, {
      activity: input.activity,
      dispatchId: input.dispatchId,
      deficiencyId: input.deficiencyId,
    });
  }
}
