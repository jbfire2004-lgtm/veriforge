import type { IngestEventInput, ListEventsQuery } from '../types';
export declare const auditService: {
    assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string): void;
    ingestEvent(input: IngestEventInput, options?: {
        skipCompanyCheck?: boolean;
    }): Promise<{
        id: string;
        companyId: string;
        module: string;
        eventType: string;
        actorId: string;
        eventData: unknown;
        createdAt: string;
    }>;
    getEvent(companyId: string, eventId: string): Promise<{
        id: string;
        companyId: string;
        module: string;
        eventType: string;
        actorId: string;
        eventData: unknown;
        createdAt: string;
    }>;
    listEvents(query: ListEventsQuery): Promise<{
        events: {
            id: string;
            companyId: string;
            module: string;
            eventType: string;
            actorId: string;
            eventData: unknown;
            createdAt: string;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
};
