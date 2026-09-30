import { describe, it, expect } from 'vitest';
import { jobStatusTransitionEngine } from '../../src/engines/job-status-transition.engine';

describe('job status transitions', () => {
  it('allows queued to running', () => {
    expect(jobStatusTransitionEngine.canTransition('queued', 'running')).toBe(true);
  });
  it('blocks completed to running', () => {
    expect(jobStatusTransitionEngine.canTransition('completed', 'running')).toBe(false);
  });
  it('allows failed to queued retry', () => {
    expect(jobStatusTransitionEngine.canTransition('failed', 'queued')).toBe(true);
  });
});
