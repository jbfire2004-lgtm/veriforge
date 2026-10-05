import type { AdoptionEventType } from './adoption-analytics.constants';
import { AdoptionEventQueueService } from './adoption-event-queue.service';
export type TrackEventInput = {
    companyId: number;
    userId?: number | null;
    event: AdoptionEventType | string;
    metadata?: Record<string, unknown>;
};
export declare class AdoptionEventService {
    private readonly queue;
    constructor(queue: AdoptionEventQueueService);
    track(input: TrackEventInput): void;
}
