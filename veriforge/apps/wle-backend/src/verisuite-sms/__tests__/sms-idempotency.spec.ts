import { SmsIdempotencyService } from '../common/sms-idempotency.service';

describe('SmsIdempotencyService', () => {
  it('replays cached response on duplicate Idempotency-Key', () => {
    const idem = new SmsIdempotencyService();
    const payload = { data: { id: '1' } };
    idem.remember(1, 'key-a', 'POST /flha', payload, 201);
    const hit = idem.peek(1, 'key-a', 'POST /flha');
    expect(hit).not.toBeNull();
    expect(hit?.response).toEqual(payload);
    expect(hit?.statusCode).toBe(201);
  });

  it('allows first use of a key', () => {
    const idem = new SmsIdempotencyService();
    expect(idem.peek(1, 'fresh', 'POST /actions')).toBeNull();
  });

  it('ignores missing key', () => {
    const idem = new SmsIdempotencyService();
    expect(idem.peek(1, undefined, 'POST /actions')).toBeNull();
  });
});
