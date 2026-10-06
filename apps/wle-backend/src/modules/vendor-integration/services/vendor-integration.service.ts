import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { VendorSyncService } from './vendor-sync.service';
import {
  normalizeDeliveryMode,
  VendorAvailability,
} from '../interfaces/vendor-availability.interface';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface ConfirmBookingInput {
  vendorId: string;
  workerId: string | number;
  certificationId: string;
  date: string;
  time: string;
}

@Injectable()
export class VendorIntegrationService {
  private readonly logger = new Logger(VendorIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vendorSync: VendorSyncService,
  ) {}

  /** Return cached availability for a cert type, refreshing stale vendors first. */
  async getAvailabilityForCertType(
    certType: string,
  ): Promise<VendorAvailability[]> {
    let rows = await this.prisma.vendor_availability_cache.findMany({
      where: { certType },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    if (rows.length === 0) {
      await this.vendorSync.syncAllVendors();
    } else {
      const threshold = new Date(Date.now() - CACHE_TTL_MS);
      const staleVendorIds = [
        ...new Set(
          rows
            .filter((row) => row.lastSyncedAt < threshold)
            .map((row) => row.vendorId),
        ),
      ];
      for (const vendorId of staleVendorIds) {
        try {
          await this.vendorSync.syncVendor(vendorId);
        } catch (error) {
          this.logger.warn(
            `Stale-cache resync failed for ${vendorId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    }

    rows = await this.prisma.vendor_availability_cache.findMany({
      where: { certType },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return rows.map((row) => this.toVendorAvailability(row));
  }

  /** Confirm a booking with the originating vendor and return the confirmation code. */
  async confirmBooking(
    payload: ConfirmBookingInput,
  ): Promise<{ confirmationCode: string }> {
    const config = this.vendorSync.getVendorConfig(payload.vendorId);
    if (!config) {
      throw new NotFoundException(
        `Vendor configuration not found: ${payload.vendorId}`,
      );
    }
    const adapter = this.vendorSync.buildAdapter(config);
    return adapter.confirmBooking({
      workerId: payload.workerId,
      certificationId: payload.certificationId,
      date: payload.date,
      time: payload.time,
    });
  }

  private toVendorAvailability(row: {
    vendorId: string;
    certType: string;
    date: Date;
    startTime: string;
    endTime: string;
    price: number;
    seatsAvailable: number;
    deliveryMode: string;
    rating: number | null;
    distanceKm: number | null;
  }): VendorAvailability {
    return {
      vendorId: row.vendorId,
      certType: row.certType,
      date: row.date.toISOString().slice(0, 10),
      startTime: row.startTime,
      endTime: row.endTime,
      price: row.price,
      seatsAvailable: row.seatsAvailable,
      deliveryMode: normalizeDeliveryMode(row.deliveryMode),
      rating: row.rating ?? undefined,
      distanceKm: row.distanceKm ?? undefined,
    };
  }
}
