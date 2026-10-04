import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../auth/public.decorator';

/** Public endpoint with stricter rate limit (verify / QR / kiosk). */
export function PublicRateLimited(limit = 60, ttlMs = 60_000) {
  return applyDecorators(
    Public(),
    Throttle(limit, Math.max(1, Math.ceil(ttlMs / 1000))),
  );
}
