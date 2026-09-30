import { describe, it, expect } from 'vitest';
import { approvalEngine } from '../../src/engines/approval.engine';

describe('approval engine', () => {
  it('allows draft to pending_approval', () => {
    expect(approvalEngine.canTransition('draft', 'pending_approval')).toBe(true);
  });

  it('allows pending_approval to approved', () => {
    expect(approvalEngine.canTransition('pending_approval', 'approved')).toBe(true);
  });

  it('allows approved to active', () => {
    expect(approvalEngine.canTransition('approved', 'active')).toBe(true);
  });

  it('blocks closed to active', () => {
    expect(approvalEngine.canTransition('closed', 'active')).toBe(false);
  });

  it('maps rejected approval to draft', () => {
    expect(
      approvalEngine.outcomeToStatus({ outcome: 'rejected', role: 'supervisor' }),
    ).toBe('draft');
  });

  it('detects expired validity', () => {
    const past = new Date(Date.now() - 60_000);
    expect(approvalEngine.isExpired(past)).toBe(true);
  });

  it('lists allowed next from draft', () => {
    expect(approvalEngine.allowedNext('draft')).toContain('pending_approval');
  });
});
