import { SmsAnonymizationService } from '../common/sms-anonymization.service';
import { SMS_K_ANONYMITY } from '../constants';

describe('SmsAnonymizationService', () => {
  const anon = new SmsAnonymizationService();

  it('uses k=5', () => {
    expect(anon.k).toBe(SMS_K_ANONYMITY);
  });

  it('suppresses competency cells below k', () => {
    const suppressed = anon.suppressIfBelowK({
      headcount: 3,
      coveragePct: 90,
      riskIndex: 70,
    });
    expect(suppressed.suppressed).toBe(true);
    expect((suppressed as { coveragePct: unknown }).coveragePct).toBeNull();
  });

  it('keeps cells at or above k', () => {
    const ok = anon.suppressIfBelowK({ headcount: 5, coveragePct: 88 });
    expect(ok.suppressed).toBe(false);
  });

  it('redacts emails and phones for LLM prompts', () => {
    const { text, ok } = anon.redactForLlm(
      'Contact jane.doe@example.com at 403-555-1212',
    );
    expect(text).toContain('[REDACTED]');
    expect(text).not.toContain('jane.doe@example.com');
    expect(ok).toBe(true);
  });

  it('redacts display names', () => {
    expect(anon.redactDisplayName('Jordan Blake')).toMatch(/J\.\s\*{4}/);
  });

  it('builds suppressed benchmark snapshot when cohort_n < k', () => {
    const snap = anon.buildBenchmarkSnapshot({
      industryCode: 'construction',
      regionScope: 'country:CA',
      metricKey: 'incident_rate_per_200k',
      entityValue: 1.2,
      p50: 1.5,
      cohortN: 3,
    });
    expect(snap.suppressed).toBe(true);
    expect(snap.industryP50).toBeNull();
    expect(snap.betterThanIndustry).toBeNull();
  });

  it('never exposes peer company ids in benchmark snapshot', () => {
    const snap = anon.buildBenchmarkSnapshot({
      industryCode: 'construction',
      regionScope: 'global',
      metricKey: 'incident_rate_per_200k',
      entityValue: 1.0,
      p50: 1.4,
      cohortN: 12,
    });
    expect(snap.suppressed).toBe(false);
    expect(JSON.stringify(snap)).not.toMatch(/company_id|companyId/i);
  });

  it('hashes worker analytics keys without plaintext id', () => {
    const key = anon.workerAnalyticsKey(42, 'tenant-salt');
    expect(key).toHaveLength(32);
    expect(key).not.toContain('42');
  });
});
