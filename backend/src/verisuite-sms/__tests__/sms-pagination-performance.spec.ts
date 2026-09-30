import { SmsException } from '../common/sms-errors';
import {
  parseDateRange,
  parseMulti,
  parseSmsPage,
  paginatedResult,
} from '../common/sms-pagination';
import { SmsPerformanceCache } from '../common/sms-performance-cache';
import { SMS_PAGE_DEFAULT, SMS_PAGE_MAX } from '../constants';

describe('SMS pagination & filters', () => {
  it('defaults limit to 25 and caps at 100', () => {
    expect(parseSmsPage({}).take).toBe(SMS_PAGE_DEFAULT);
    expect(parseSmsPage({ limit: '500' }).take).toBe(SMS_PAGE_MAX);
  });

  it('rejects invalid cursors', () => {
    expect(() => parseSmsPage({ cursor: 'x'.repeat(201) })).toThrow(SmsException);
  });

  it('returns nextCursor only when page is full', () => {
    const full = paginatedResult(
      Array.from({ length: 25 }, (_, i) => ({ id: `id-${i}` })),
      25,
    );
    expect(full.nextCursor).toBe('id-24');
    const short = paginatedResult([{ id: 'a' }], 25);
    expect(short.nextCursor).toBeNull();
  });

  it('validates date ranges and max 366 days', () => {
    expect(() =>
      parseDateRange('2024-01-01', '2023-01-01'),
    ).toThrow(SmsException);
    expect(() =>
      parseDateRange('2024-01-01', '2025-12-31'),
    ).toThrow(SmsException);
    const ok = parseDateRange('2024-01-01', '2024-06-01');
    expect(ok.gte).toBeInstanceOf(Date);
  });

  it('parses multi-value OR filters', () => {
    expect(parseMulti('a,b,c')).toEqual(['a', 'b', 'c']);
    expect(parseMulti(['x', 'y'])).toEqual(['x', 'y']);
  });
});

describe('SMS performance cache', () => {
  it('caches and serves within TTL', async () => {
    const cache = new SmsPerformanceCache();
    let calls = 0;
    const first = await cache.wrap('k1', async () => {
      calls += 1;
      return { n: 1 };
    });
    const second = await cache.wrap('k1', async () => {
      calls += 1;
      return { n: 2 };
    });
    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(second.data).toEqual({ n: 1 });
    expect(calls).toBe(1);
  });

  it('invalidates by prefix', async () => {
    const cache = new SmsPerformanceCache();
    await cache.wrap('sms:agg:1:a', async () => 1);
    cache.invalidatePrefix('sms:agg:1:');
    const again = await cache.wrap('sms:agg:1:a', async () => 2);
    expect(again.cached).toBe(false);
    expect(again.data).toBe(2);
  });

  it('meets warm-path budget envelope (cache hit << 400ms)', async () => {
    const cache = new SmsPerformanceCache();
    await cache.wrap('perf', async () => ({ ok: true }));
    const t0 = Date.now();
    for (let i = 0; i < 1000; i += 1) {
      await cache.wrap('perf', async () => ({ ok: true }));
    }
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeLessThan(400);
  });
});
