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

export class CalendlyAdapter implements VendorAdapter {
  readonly vendorId: string;
  private readonly logger = new Logger(CalendlyAdapter.name);

  constructor(private readonly config: VendorConfig) {
    this.vendorId = config.vendorId;
  }

  async fetchAvailability(certType: string): Promise<VendorAvailability[]> {
    if (!this.config.baseUrl || !this.config.apiToken) return [];

    const url = new URL(`${this.config.baseUrl}/event_type_available_times`);
    url.searchParams.set('cert_type', certType);
    if (this.config.organizationUri) {
      url.searchParams.set('organization', this.config.organizationUri);
    }

    const raw = await this.httpGet(url.toString());
    const items = this.extractCollection(raw, 'collection');
    return items
      .map((item) => this.toAvailability(item, certType))
      .filter((slot): slot is VendorAvailability => slot !== null);
  }

  async confirmBooking(
    payload: ConfirmBookingPayload,
  ): Promise<ConfirmBookingResult> {
    if (this.config.baseUrl && this.config.apiToken) {
      const raw = await this.httpPost(
        `${this.config.baseUrl}/scheduled_events`,
        {
          invitee: payload.workerId,
          certificationId: payload.certificationId,
          start_time: `${payload.date}T${payload.time}`,
        },
      );
      const code = this.readConfirmationCode(raw);
      if (code) return { confirmationCode: code };
    }
    return { confirmationCode: `CALENDLY-${this.vendorId}-${randomUUID()}` };
  }

  private toAvailability(
    item: Record<string, unknown>,
    certType: string,
  ): VendorAvailability | null {
    const start = this.str(item, 'start_time') ?? this.str(item, 'startTime');
    if (!start) return null;
    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) return null;
    const end =
      this.str(item, 'end_time') ?? this.str(item, 'endTime') ?? start;
    const endDate = new Date(end);

    return {
      vendorId: this.vendorId,
      certType,
      date: startDate.toISOString().slice(0, 10),
      startTime: startDate.toISOString().slice(11, 16),
      endTime: (Number.isNaN(endDate.getTime()) ? startDate : endDate)
        .toISOString()
        .slice(11, 16),
      price: this.num(item, 'price') ?? this.config.defaultPrice ?? 0,
      seatsAvailable:
        this.int(item, 'spots_available') ??
        this.int(item, 'seatsAvailable') ??
        this.config.defaultSeats ??
        1,
      deliveryMode: normalizeDeliveryMode(
        item['location_type'] ?? this.config.defaultDeliveryMode ?? 'in_person',
      ),
      rating: this.config.defaultRating,
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
      const resource = (r['resource'] as Record<string, unknown>) ?? r;
      const code = resource['uri'] ?? resource['uuid'] ?? r['confirmationCode'];
      if (typeof code === 'string' && code.length > 0) return code;
    }
    return null;
  }

  private async httpGet(url: string): Promise<unknown> {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.config.apiToken}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Calendly GET ${url} -> ${res.status}`);
    return res.json();
  }

  private async httpPost(url: string, body: unknown): Promise<unknown> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Calendly POST ${url} -> ${res.status}`);
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
