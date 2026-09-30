import { BadRequestError } from '../utils/errors';
import type { TrainingJobStatus } from '../types';

const TRANSITIONS: Record<TrainingJobStatus, TrainingJobStatus[]> = {
  queued: ['running', 'failed'],
  running: ['completed', 'failed'],
  completed: [],
  failed: ['queued'],
};

export class JobStatusTransitionEngine {
  canTransition(from: TrainingJobStatus, to: TrainingJobStatus): boolean {
    return TRANSITIONS[from]?.includes(to) ?? false;
  }

  assertTransition(from: TrainingJobStatus, to: TrainingJobStatus) {
    if (!this.canTransition(from, to)) {
      throw new BadRequestError(`Invalid status transition from ${from} to ${to}`);
    }
  }

  allowedNext(from: TrainingJobStatus): TrainingJobStatus[] {
    return TRANSITIONS[from] ?? [];
  }
}

export const jobStatusTransitionEngine = new JobStatusTransitionEngine();
