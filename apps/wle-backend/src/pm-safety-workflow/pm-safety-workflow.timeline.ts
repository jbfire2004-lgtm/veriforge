import type { PmSafetyWorkflowEvent } from '@prisma/client';

export type TimelineEventSlice = Pick<
  PmSafetyWorkflowEvent,
  'id' | 'eventType' | 'payload' | 'createdAt'
>;

export class PmSafetyTimelineIntegrityError extends Error {
  constructor(
    message: string,
    public readonly detail?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PmSafetyTimelineIntegrityError';
  }
}

function payloadRecord(p: unknown): Record<string, unknown> | null {
  return p && typeof p === 'object' ? (p as Record<string, unknown>) : null;
}

/**
 * Validates:
 * - Events ordered by `id` have non-decreasing `createdAt`
 * - Each `STATUS_CHANGE` (non-initial) continues from the last known workflow status
 * - No consecutive duplicate transitions (same from/to/action)
 * - Final derived status matches `expectedFinalStatus`
 */
export function validatePmSafetyTimeline(
  events: TimelineEventSlice[],
  expectedFinalStatus: string,
): void {
  if (events.length === 0) {
    throw new PmSafetyTimelineIntegrityError('PM_SAFETY_TIMELINE_EMPTY');
  }

  const sorted = [...events].sort((a, b) => a.id - b.id);

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].createdAt.getTime() < sorted[i - 1].createdAt.getTime()) {
      throw new PmSafetyTimelineIntegrityError(
        'PM_SAFETY_TIMELINE_CREATED_AT_REGRESSION',
        {
          prevId: sorted[i - 1].id,
          id: sorted[i].id,
        },
      );
    }
  }

  let derivedStatus: string | null = null;
  let lastTransitionKey: string | null = null;

  for (const ev of sorted) {
    if (ev.eventType !== 'STATUS_CHANGE') {
      continue;
    }
    const pl = payloadRecord(ev.payload);
    if (!pl) {
      continue;
    }
    if (pl.initial === true && typeof pl.status === 'string') {
      derivedStatus = pl.status;
      lastTransitionKey = null;
      continue;
    }
    if (typeof pl.from === 'string' && typeof pl.to === 'string') {
      const action = typeof pl.action === 'string' ? pl.action : '';
      const key = `${pl.from}|${action}|${pl.to}`;
      if (lastTransitionKey === key) {
        throw new PmSafetyTimelineIntegrityError(
          'PM_SAFETY_TIMELINE_DUPLICATE_TRANSITION',
          { eventId: ev.id, key },
        );
      }
      lastTransitionKey = key;

      if (derivedStatus !== null && pl.from !== derivedStatus) {
        throw new PmSafetyTimelineIntegrityError(
          'PM_SAFETY_TIMELINE_STATUS_GAP',
          {
            eventId: ev.id,
            expectedFrom: derivedStatus,
            payloadFrom: pl.from,
          },
        );
      }
      derivedStatus = pl.to;
    }
  }

  if (derivedStatus !== expectedFinalStatus) {
    throw new PmSafetyTimelineIntegrityError(
      'PM_SAFETY_TIMELINE_FINAL_STATUS_MISMATCH',
      { derivedStatus, expectedFinalStatus },
    );
  }
}
