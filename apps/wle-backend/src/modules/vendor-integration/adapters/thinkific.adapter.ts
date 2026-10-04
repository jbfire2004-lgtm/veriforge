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

export class ThinkificAdapter implements VendorAdapter {
  readonly vendorId: string;
  private readonly logger = new Logger(ThinkificAdapter.name);

  constructor(private readonly config: VendorConfig) {
    this.vendorId = config.vendorId;
  }

  async fetchAvailability(certType: string): Promise<VendorAvailability[]> {
    if (!this.config.apiKey || !this.config.subdomain) return [];

    const base =
      this.config.baseUrl ?? 'https://api.thinkific.com/api/public/v1';
    const url = `${base}/courses?query[certType]=${encodeURIComponent(
      certType,
    )}`;
    const raw = await this.httpGet(url);
    const items = this.extractCollection(raw, 'items');
    return items.map((item) => this.toAvailability(item, certType));
  }

  async confirmBooking(
    payload: ConfirmBookingPayload,
  ): Promise<ConfirmBookingResult> {
    if (this.config.apiKey && this.config.subdomain) {
      const base =
        this.config.baseUrl ?? 'https://api.thinkific.com/api/public/v1';
      const raw = await this.httpPost(`${base}/enrollments`, {
        user_id: payload.workerId,
        course_id: payload.certificationId,
        activated_at: `${payload.date}T${payload.time}`,
      });
      const code = this.readConfirmationCode(raw);
      if (code) return { confirmationCode: code };
    }
    return { confirmationCode: `THINKIFIC-${this.vendorId}-${randomUUID()}` };
  }

  private toAvailability(
    item: Record<string, unknown>,
    certType: string,
  ): VendorAvailability {
    const start = this.str(item, 'start_date') ?? new Date().toISOString();
    const startDate = new Date(start);
    const safeDate = Number.isNaN(startDate.getTime()) ? new Date() : startDate;

    return {
      vendorId: this.vendorId,
      certType,
      date: safeDate.toISOString().slice(0, 10),
      startTime: this.str(item, 'start_time') ?? '00:00',
      endTime: this.str(item, 'end_time') ?? '23:59',
      price: this.num(item, 'price') ?? this.config.defaultPrice ?? 0,
      seatsAvailable:
        this.int(item, 'seats_available') ?? this.config.defaultSeats ?? 999,
      // Thinkific courses are e-learning unless overridden.
      deliveryMode: normalizeDeliveryMode(
        item['delivery_mode'] ?? this.config.defaultDeliveryMode ?? 'online',
      ),
      rating: this.num(item, 'rating') ?? this.config.defaultRating,
      distanceKm: this.config.distanceKm,
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
      const code = r['id'] ?? r['confirmationCode'];
      if (typeof code === 'string' && code.length > 0) return code;
      if (typeof code === 'number') return String(code);
    }
    return null;
  }

  private async httpGet(url: string): Promise<unknown> {
    const res = await fetch(url, {
      headers: {
        'X-Auth-API-Key': this.config.apiKey ?? '',
        'X-Auth-Subdomain': this.config.subdomain ?? '',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Thinkific GET ${url} -> ${res.status}`);
    return res.json();
  }

  private async httpPost(url: string, body: unknown): Promise<unknown> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Auth-API-Key': this.config.apiKey ?? '',
        'X-Auth-Subdomain': this.config.subdomain ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Thinkific POST ${url} -> ${res.status}`);
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
