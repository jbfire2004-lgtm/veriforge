import type { IngestEventInput, ListEventsQuery } from '../types';
export declare const auditRepository: {
    /** Append-only insert — no update/delete methods. */
    insertEvent(input: IngestEventInput): Promise<{
        id: string;
        companyId: string;
        module: string;
        eventType: string;
        actorId: string;
        eventData: unknown;
        createdAt: string;
    }>;
    findById(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        module: string;
        eventType: string;
        actorId: string;
        eventData: unknown;
        createdAt: string;
    } | null>;
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
