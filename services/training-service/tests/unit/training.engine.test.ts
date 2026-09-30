import { describe, it, expect } from 'vitest';
import { expiryEngine, competencyEngine } from '../../src/engines/training.engine';

describe('expiry engine', () => {
  it('computes expiry from completion date', () => {
    const completion = new Date('2026-06-15T12:00:00.000Z');
    const expiry = expiryEngine.computeExpiry(completion, 365);
    const diffDays = Math.round((expiry.getTime() - completion.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(365);
  });

  it('detects expired training', () => {
    const past = new Date('2020-01-01T00:00:00.000Z');
    expect(expiryEngine.isExpired(past)).toBe(true);
  });
});

describe('competency engine', () => {
  it('scores advanced level higher than basic', () => {
    expect(competencyEngine.scoreFromLevel('advanced')).toBeGreaterThan(
      competencyEngine.scoreFromLevel('basic'),
    );
  });

  it('aggregates competency scores', () => {
    const score = competencyEngine.aggregate([
      { competencyScore: 90, status: 'verified' },
      { competencyScore: 70, status: 'completed' },
    ]);
    expect(score).toBe(80);
  });
});
