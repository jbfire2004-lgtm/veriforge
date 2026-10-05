import { Injectable } from '@nestjs/common';

export interface SmsIdemEntry {
  response: unknown;
  statusCode: number;
  expiresAt: number;
}

/** In-process Idempotency-Key store (24h) per Full API Spec. */
@Injectable()
export class SmsIdempotencyService {
  private readonly store = new Map<string, SmsIdemEntry>();
  private readonly ttlMs = 24 * 60 * 60_000;

  private key(companyId: number, idempotencyKey: string, route: string) {
    return `${companyId}|${route}|${idempotencyKey}`;
  }

  /**
   * Soft idempotency: return cached entry for replay, or null to proceed.
   * Clients retrying with the same key get the original response (not 409).
   */
  peek(
    companyId: number,
    idempotencyKey: string | undefined,
    route: string,
  ): SmsIdemEntry | null {
    if (!idempotencyKey) return null;
    this.purge();
    const hit = this.store.get(this.key(companyId, idempotencyKey, route));
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(this.key(companyId, idempotencyKey, route));
      return null;
    }
    return hit;
  }

  /** @deprecated Prefer peek() soft-replay; kept for callers that want explicit lookup. */
  getReplay(
    companyId: number,
    idempotencyKey: string | undefined,
    route: string,
  ): SmsIdemEntry | null {
    return this.peek(companyId, idempotencyKey, route);
  }

  remember(
    companyId: number,
    idempotencyKey: string | undefined,
    route: string,
    response: unknown,
    statusCode = 201,
  ) {
    if (!idempotencyKey) return;
    this.store.set(this.key(companyId, idempotencyKey, route), {
      response,
      statusCode,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  private purge() {
    const now = Date.now();
    for (const [k, v] of this.store) {
      if (v.expiresAt < now) this.store.delete(k);
    }
  }
}
