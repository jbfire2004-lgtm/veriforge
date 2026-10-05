import { PmSafetyHubDomain } from '@prisma/client';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { type DomainEventPayload } from '../modules/api-platform/events/domain-events';
export declare class SafetyEcosystemEventsService {
    private readonly eventBus?;
    private readonly logger;
    constructor(eventBus?: EventBusService);
    emit(payload: DomainEventPayload): void;
    invalidateHub(companyId: number, projectId?: number, data?: Record<string, unknown>): void;
    emitInvestigationUpdated(input: {
        eventId: string;
        companyId: number;
        projectId: number;
        status?: string;
        actorId?: number;
    }): void;
    emitCapaCreated(input: {
        actionId: string;
        companyId: number;
        projectId?: number;
        title?: string;
        actorId?: number;
        sourceModule?: string;
    }): void;
    emitCapaStatusChanged(input: {
        actionId: string;
        companyId: number;
        projectId?: number;
        status: string;
        actorId?: number;
    }): void;
    emitSubstanceTestCompleted(input: {
        testEventId: string;
        companyId: number;
        projectId?: number;
        outcome: string;
        workerId: number;
        actorId?: number;
    }): void;
    emitEvidenceIndexed(input: {
        companyId: number;
        projectId?: number;
        domain: PmSafetyHubDomain;
        sourceType: string;
        sourceId: string;
        attachmentId?: string;
        fileName?: string;
        actorId?: number;
    }): void;
    emitContractorPortalActivity(input: {
        dispatchId?: string;
        deficiencyId?: string;
        companyId: number;
        projectId?: number;
        activity: string;
        actorId?: number;
    }): void;
}
