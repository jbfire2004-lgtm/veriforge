import { Injectable, Optional } from '@nestjs/common';
import { EventBusService } from '../../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../../modules/api-platform/events/domain-events';
import type { DomainEventPayload } from '../../modules/api-platform/events/domain-events';

@Injectable()
export class VsiEventService {
  constructor(@Optional() private readonly bus?: EventBusService) {}

  emit(
    name: DomainEventPayload['name'],
    payload: Omit<DomainEventPayload, 'name' | 'occurredAt'> & {
      occurredAt?: string;
    },
  ) {
    if (!this.bus) return;
    const event: DomainEventPayload = {
      name,
      occurredAt: payload.occurredAt ?? new Date().toISOString(),
      actorId: payload.actorId,
      companyId: payload.companyId,
      projectId: payload.projectId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      data: payload.data,
    };
    this.bus.emit(event);
    if (name !== DomainEvent.VSI_DASHBOARD_INVALIDATE) {
      this.bus.emit({
        ...event,
        name: DomainEvent.VSI_DASHBOARD_INVALIDATE,
      });
    }
  }

  cailCreated(cail: {
    id: string;
    projectId: number;
    ownerCompanyId: number;
    sourceType: string;
    actorId?: number;
  }) {
    this.emit(DomainEvent.CAIL_CREATED, {
      projectId: cail.projectId,
      companyId: cail.ownerCompanyId,
      entityType: 'CailEntry',
      entityId: cail.id,
      actorId: cail.actorId,
      data: { sourceType: cail.sourceType },
    });
  }

  cailAssigned(cail: {
    id: string;
    projectId: number;
    ownerCompanyId: number;
    assignedUserId: number;
    actorId?: number;
  }) {
    this.emit(DomainEvent.CAIL_ASSIGNED, {
      projectId: cail.projectId,
      companyId: cail.ownerCompanyId,
      entityType: 'CailEntry',
      entityId: cail.id,
      actorId: cail.actorId,
      data: { assignedUserId: cail.assignedUserId },
    });
  }

  cailResolved(cail: {
    id: string;
    projectId: number;
    ownerCompanyId: number;
    actorId?: number;
  }) {
    this.emit(DomainEvent.CAIL_RESOLVED, {
      projectId: cail.projectId,
      companyId: cail.ownerCompanyId,
      entityType: 'CailEntry',
      entityId: cail.id,
      actorId: cail.actorId,
    });
  }

  cailVerified(cail: {
    id: string;
    projectId: number;
    ownerCompanyId: number;
    actorId?: number;
  }) {
    this.emit(DomainEvent.CAIL_VERIFIED, {
      projectId: cail.projectId,
      companyId: cail.ownerCompanyId,
      entityType: 'CailEntry',
      entityId: cail.id,
      actorId: cail.actorId,
    });
  }

  lessonPublished(lesson: {
    id: string;
    projectId: number;
    companyId: number;
    cailId: string;
  }) {
    this.emit(DomainEvent.LESSON_LEARNED_PUBLISHED, {
      projectId: lesson.projectId,
      companyId: lesson.companyId,
      entityType: 'LessonsLearnedEntry',
      entityId: lesson.id,
      data: { cailId: lesson.cailId },
    });
  }
}
