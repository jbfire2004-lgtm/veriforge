import type { CorrectiveActionStatus } from '../types';

const TRANSITIONS: Record<CorrectiveActionStatus, CorrectiveActionStatus[]> = {
  draft: ['open', 'cancelled'],
  open: ['assigned', 'in_progress', 'cancelled'],
  assigned: ['in_progress', 'pending_verification', 'cancelled'],
  in_progress: ['pending_verification', 'cancelled'],
  pending_verification: ['verified', 'in_progress', 'cancelled'],
  verified: ['closed'],
  closed: [],
  cancelled: [],
};

export class StatusTransitionEngine {
  canTransition(from: CorrectiveActionStatus, to: CorrectiveActionStatus): boolean {
    return TRANSITIONS[from]?.includes(to) ?? false;
  }

  assertTransition(from: CorrectiveActionStatus, to: CorrectiveActionStatus) {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid status transition: ${from} → ${to}`);
    }
  }

  allowedNext(from: CorrectiveActionStatus): CorrectiveActionStatus[] {
    return TRANSITIONS[from] ?? [];
  }
}

export const statusTransitionEngine = new StatusTransitionEngine();
