/**
 * Unit tests for expiry / gating helpers — delegates to shared validation module.
 * @deprecated Prefer orientation-validation.spec.ts for new cases.
 */
import {
  bumpMinorVersion,
  computeExpiresOn,
} from '../orientation-validation';

function gatingStatus(input: {
  missingArrival: boolean;
  missingDispatch: boolean;
  missingAssignment: boolean;
  missingAny: boolean;
}): 'allowed' | 'blocked' | 'warning' {
  if (input.missingArrival || input.missingDispatch) return 'blocked';
  if (input.missingAssignment || input.missingAny) return 'warning';
  return 'allowed';
}

describe('VeriForge orientation helpers', () => {
  it('computes expiresOn from durationDays', () => {
    const completed = new Date('2026-01-01T00:00:00.000Z');
    const expires = computeExpiresOn(completed, { durationDays: 365 });
    expect(expires?.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('returns null expiresOn when no duration', () => {
    expect(computeExpiresOn(new Date(), {})).toBeNull();
  });

  it('blocks on arrival/dispatch gaps', () => {
    expect(
      gatingStatus({
        missingArrival: true,
        missingDispatch: false,
        missingAssignment: false,
        missingAny: true,
      }),
    ).toBe('blocked');
  });

  it('warns on assignment-only gaps', () => {
    expect(
      gatingStatus({
        missingArrival: false,
        missingDispatch: false,
        missingAssignment: true,
        missingAny: true,
      }),
    ).toBe('warning');
  });

  it('bumps minor version', () => {
    expect(bumpMinorVersion('1.0')).toBe('1.1');
    expect(bumpMinorVersion('2.9')).toBe('2.10');
  });
});
