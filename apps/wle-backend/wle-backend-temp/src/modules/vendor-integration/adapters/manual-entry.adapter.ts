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

/** Availability is operator-curated and supplied directly via vendor config. */
export class ManualEntryAdapter implements VendorAdapter {
  readonly vendorId: string;
  private readonly logger = new Logger(ManualEntryAdapter.name);

  constructor(private readonly config: VendorConfig) {
    this.vendorId = config.vendorId;
  }

  async fetchAvailability(certType: string): Promise<VendorAvailability[]> {
    const entries = this.config.manualAvailability ?? [];
    return entries
      .filter((slot) => slot.certType === certType)
      .map((slot) => ({
        vendorId: this.vendorId,
        certType,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: Number.isFinite(slot.price)
          ? slot.price
          : this.config.defaultPrice ?? 0,
        seatsAvailable: Math.max(0, Math.trunc(slot.seatsAvailable ?? 0)),
        deliveryMode: normalizeDeliveryMode(
          slot.deliveryMode ?? this.config.defaultDeliveryMode ?? 'in_person',
        ),
        rating: slot.rating ?? this.config.defaultRating,
        distanceKm: slot.distanceKm ?? this.config.distanceKm,
      }));
  }

  async confirmBooking(
    _payload: ConfirmBookingPayload,
  ): Promise<ConfirmBookingResult> {
    return { confirmationCode: `MANUAL-${this.vendorId}-${randomUUID()}` };
  }
}
