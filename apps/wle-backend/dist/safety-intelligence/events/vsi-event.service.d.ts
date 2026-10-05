import { EventBusService } from '../../modules/api-platform/events/event-bus.service';
import type { DomainEventPayload } from '../../modules/api-platform/events/domain-events';
export declare class VsiEventService {
    private readonly bus?;
    constructor(bus?: EventBusService);
    emit(name: DomainEventPayload['name'], payload: Omit<DomainEventPayload, 'name' | 'occurredAt'> & {
        occurredAt?: string;
    }): void;
    cailCreated(cail: {
        id: string;
        projectId: number;
        ownerCompanyId: number;
        sourceType: string;
        actorId?: number;
    }): void;
    cailAssigned(cail: {
        id: string;
        projectId: number;
        ownerCompanyId: number;
        assignedUserId: number;
        actorId?: number;
    }): void;
    cailResolved(cail: {
        id: string;
        projectId: number;
        ownerCompanyId: number;
        actorId?: number;
    }): void;
    cailVerified(cail: {
        id: string;
        projectId: number;
        ownerCompanyId: number;
        actorId?: number;
    }): void;
    lessonPublished(lesson: {
        id: string;
        projectId: number;
        companyId: number;
        cailId: string;
    }): void;
}
