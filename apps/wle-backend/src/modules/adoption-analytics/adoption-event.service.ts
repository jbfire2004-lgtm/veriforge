import { Injectable } from '@nestjs/common';
import type { AdoptionEventType } from './adoption-analytics.constants';
import {
  AdoptionEventQueueService,
  type QueuedAnalyticsEvent,
} from './adoption-event-queue.service';

export type TrackEventInput = {
  companyId: number;
  userId?: number | null;
  event: AdoptionEventType | string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AdoptionEventService {
  constructor(private readonly queue: AdoptionEventQueueService) {}

  /** Non-blocking analytics event (queued batch insert). */
  track(input: TrackEventInput): void {
    if (!input.companyId) return;
    const payload: QueuedAnalyticsEvent = {
      companyId: input.companyId,
      userId: input.userId,
      eventType: input.event,
      metadata: input.metadata,
    };
    this.queue.enqueue(payload);
  }
}
