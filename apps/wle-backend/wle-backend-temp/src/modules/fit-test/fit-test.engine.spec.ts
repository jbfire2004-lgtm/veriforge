import {
  computeFitTestExpiresAt,
  evaluateFitTest,
  FIT_TEST_DEFAULT_VALIDITY_YEARS,
  fitTestReadinessScore,
  resolveFitTestValidityYears,
} from './fit-test.engine';

describe('FitTestEngine', () => {
  it('uses one-year validity by default', () => {
    expect(FIT_TEST_DEFAULT_VALIDITY_YEARS).toBe(1);

    expect(resolveFitTestValidityYears()).toBe(1);

    expect(resolveFitTestValidityYears(2)).toBe(2);

    expect(resolveFitTestValidityYears(0)).toBe(1);
  });

  it('computes expiry from performed date and validity years', () => {
    const performedAt = new Date('2026-01-15T12:00:00Z');

    const expiresAt = computeFitTestExpiresAt(performedAt, 1);

    expect(expiresAt.getFullYear()).toBe(2027);

    expect(expiresAt.getMonth()).toBe(performedAt.getMonth());
  });

  it('marks PASS with computed expiry when missing', () => {
    const performedAt = new Date('2026-06-01T12:00:00Z');

    const r = evaluateFitTest({ result: 'PASS', performedAt });

    expect(r.pass).toBe(true);

    expect(r.statusLabel).toBe('PASS');

    expect(r.expiresAt).not.toBeNull();

    expect(r.expiresAt!.getFullYear()).toBe(2027);
  });

  it('honors custom validity years for PASS', () => {
    const performedAt = new Date('2026-06-01T12:00:00Z');

    const r = evaluateFitTest({
      result: 'PASS',
      performedAt,
      validityYears: 2,
    });

    expect(r.expiresAt!.getFullYear()).toBe(2028);
  });

  it('marks EXPIRED when pass result is past expiry', () => {
    const performedAt = new Date('2024-01-01T12:00:00Z');

    const r = evaluateFitTest({ result: 'PASS', performedAt });

    expect(r.expired).toBe(true);

    expect(r.statusLabel).toBe('EXPIRED');

    expect(r.pass).toBe(false);
  });

  it('flags expiring soon within 30 days', () => {
    const performedAt = new Date();

    performedAt.setFullYear(performedAt.getFullYear() - 1);

    performedAt.setDate(performedAt.getDate() + 15);

    const r = evaluateFitTest({ result: 'PASS', performedAt });

    expect(r.expiringSoon).toBe(true);

    expect(r.pass).toBe(true);
  });

  it('marks FAIL and CONDITIONAL outcomes', () => {
    const fail = evaluateFitTest({ result: 'FAIL', performedAt: new Date() });

    expect(fail.pass).toBe(false);

    expect(fail.statusLabel).toBe('FAIL');

    const conditional = evaluateFitTest({
      result: 'CONDITIONAL',

      performedAt: new Date(),
    });

    expect(conditional.pass).toBe(false);

    expect(conditional.statusLabel).toBe('CONDITIONAL');
  });

  it('scores readiness from evaluation', () => {
    const pass = evaluateFitTest({ result: 'PASS', performedAt: new Date() });

    expect(fitTestReadinessScore({ hasRun: true, evaluation: pass })).toBe(100);

    const fail = evaluateFitTest({ result: 'FAIL', performedAt: new Date() });

    expect(fitTestReadinessScore({ hasRun: true, evaluation: fail })).toBe(0);

    const conditional = evaluateFitTest({
      result: 'CONDITIONAL',

      performedAt: new Date(),
    });

    expect(
      fitTestReadinessScore({ hasRun: true, evaluation: conditional }),
    ).toBe(50);
  });
});
