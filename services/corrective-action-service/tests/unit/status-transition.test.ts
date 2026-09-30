import { describe, it, expect } from 'vitest';
import { statusTransitionEngine } from '../../src/engines/status-transition.engine';

describe('status transitions', () => {
  it('allows draft to open', () => {
    expect(statusTransitionEngine.canTransition('draft', 'open')).toBe(true);
  });

  it('blocks closed to open', () => {
    expect(statusTransitionEngine.canTransition('closed', 'open')).toBe(false);
  });

  it('allows verified to closed', () => {
    expect(statusTransitionEngine.canTransition('verified', 'closed')).toBe(true);
  });
});
