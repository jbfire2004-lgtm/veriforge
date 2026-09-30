import { describe, it, expect } from 'vitest';
import { schedulingEngine } from '../../src/engines/scheduling.engine';

describe('scheduling engine', () => {
  it('detects worker double-booking', () => {
    const workerId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const conflicts = schedulingEngine.detectConflicts([
      {
        id: 'a',
        workerId,
        startTime: new Date('2026-06-01T08:00:00Z'),
        endTime: new Date('2026-06-01T12:00:00Z'),
      },
      {
        id: 'b',
        workerId,
        startTime: new Date('2026-06-01T10:00:00Z'),
        endTime: new Date('2026-06-01T14:00:00Z'),
      },
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].resource).toBe('worker');
  });

  it('returns no conflicts for non-overlapping slots', () => {
    const workerId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const conflicts = schedulingEngine.detectConflicts([
      {
        id: 'a',
        workerId,
        startTime: new Date('2026-06-01T08:00:00Z'),
        endTime: new Date('2026-06-01T10:00:00Z'),
      },
      {
        id: 'b',
        workerId,
        startTime: new Date('2026-06-01T10:00:00Z'),
        endTime: new Date('2026-06-01T12:00:00Z'),
      },
    ]);

    expect(conflicts).toHaveLength(0);
  });

  it('detects equipment conflicts', () => {
    const equipmentId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const conflicts = schedulingEngine.detectConflicts([
      {
        id: 'a',
        equipmentId,
        startTime: new Date('2026-06-02T08:00:00Z'),
        endTime: new Date('2026-06-02T16:00:00Z'),
      },
      {
        id: 'b',
        equipmentId,
        startTime: new Date('2026-06-02T12:00:00Z'),
        endTime: new Date('2026-06-02T18:00:00Z'),
      },
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].resource).toBe('equipment');
  });
});
