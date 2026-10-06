import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ConfirmBookingPayload,
  ConfirmBookingResult,
  VendorAdapter,
  VendorConfig,
} from '../interfaces/vendor-adapter.interface';
import {
  normalizeDeliveryMode,
  VendorAvailability,
} from '../interfaces/vendor-availability.interface';

export class GenericRESTAdapter implements VendorAdapter {
  readonly vendorId: string;
  private readonly logger = new Logger(GenericRESTAdapter.name);

  constructor(private readonly config: VendorConfig) {
    this.vendorId = config.vendorId;
  }

  async fetchAvailability(certType: string): Promise<VendorAvailability[]> {
    if (!this.config.baseUrl) return [];

    const url = `${
      this.config.baseUrl
    }/availability?certType=${encodeURIComponent(certType)}`;
    const raw = await this.httpGet(url);
    const items = this.extractCollection(raw, 'data');
    return items.map((item) => this.toAvailability(item, certType));
  }

  async confirmBooking(
    payload: ConfirmBookingPayload,
  ): Promise<ConfirmBookingResult> {
    if (this.config.baseUrl) {
      const raw = await this.httpPost(`${this.config.baseUrl}/bookings`, {
        workerId: payload.workerId,
        certificationId: payload.certificationId,
        date: payload.date,
        time: payload.time,
      });
      const code = this.readConfirmationCode(raw);
      if (code) return { confirmationCode: code };
    }
    return { confirmationCode: `REST-${this.vendorId}-${randomUUID()}` };
  }

  private toAvailability(
    item: Record<string, unknown>,
    certType: string,
  ): VendorAvailability {
    const date =
      this.str(item, 'date') ?? new Date().toISOString().slice(0, 10);
    return {
      vendorId: this.vendorId,
      certType: this.str(item, 'certType') ?? certType,
      date: date.length >= 10 ? date.slice(0, 10) : date,
      startTime: this.str(item, 'startTime') ?? '00:00',
      endTime: this.str(item, 'endTime') ?? '23:59',
      price: this.num(item, 'price') ?? this.config.defaultPrice ?? 0,
      seatsAvailable:
        this.int(item, 'seatsAvailable') ?? this.config.defaultSeats ?? 0,
      deliveryMode: normalizeDeliveryMode(
        item['deliveryMode'] ?? this.config.defaultDeliveryMode ?? 'in_person',
      ),
      rating: this.num(item, 'rating') ?? this.config.defaultRating,
      distanceKm: this.num(item, 'distanceKm') ?? this.config.distanceKm,
    };
  }

  private extractCollection(
    raw: unknown,
    key: string,
  ): Record<string, unknown>[] {
    if (Array.isArray(raw)) return raw as Record<string, unknown>[];
    if (raw && typeof raw === 'object') {
      const value = (raw as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as Record<string, unknown>[];
    }
    return [];
  }

  private readConfirmationCode(raw: unknown): string | null {
    if (raw && typeof raw === 'object') {
      const r = raw as Record<string, unknown>;
      const code = r['confirmationCode'] ?? r['id'] ?? r['bookingId'];
      if (typeof code === 'string' && code.length > 0) return code;
      if (typeof code === 'number') return String(code);
    }
    return null;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...(extra ?? {}) };
    if (this.config.apiToken)
      headers.Authorization = `Bearer ${this.config.apiToken}`;
    else if (this.config.apiKey) headers['X-Api-Key'] = this.config.apiKey;
    return headers;
  }

  private async httpGet(url: string): Promise<unknown> {
    const res = await fetch(url, {
      headers: this.buildHeaders(),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`REST GET ${url} -> ${res.status}`);
    return res.json();
  }

  private async httpPost(url: string, body: unknown): Promise<unknown> {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`REST POST ${url} -> ${res.status}`);
    return res.json();
  }

  private str(item: Record<string, unknown>, key: string): string | undefined {
    const value = item[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private num(item: Record<string, unknown>, key: string): number | undefined {
    const value = item[key];
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : undefined;
  }

  private int(item: Record<string, unknown>, key: string): number | undefined {
    const value = this.num(item, key);
    return value == null ? undefined : Math.trunc(value);
  }
}
