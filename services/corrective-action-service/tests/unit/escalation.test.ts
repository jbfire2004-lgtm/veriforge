import { describe, it, expect } from 'vitest';
import { escalationEngine } from '../../src/engines/escalation.engine';

describe('escalation engine', () => {
  it('escalates overdue critical items', () => {
    const past = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const r = escalationEngine.evaluate({
      dueDate: past,
      severity: 'critical',
      status: 'open',
    });
    expect(r).not.toBeNull();
    expect(r!.level).toBeGreaterThanOrEqual(4);
  });

  it('skips closed items', () => {
    const r = escalationEngine.evaluate({
      severity: 'high',
      status: 'closed',
    });
    expect(r).toBeNull();
  });
});
