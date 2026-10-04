import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventBusService } from '../../../common/events/event-bus.service';
import {
  VendorAdapter,
  VendorConfig,
} from '../interfaces/vendor-adapter.interface';
import { VendorAvailability } from '../interfaces/vendor-availability.interface';
import { CalendlyAdapter } from '../adapters/calendly.adapter';
import { ThinkificAdapter } from '../adapters/thinkific.adapter';
import { AbsorbAdapter } from '../adapters/absorb.adapter';
import { GenericRESTAdapter } from '../adapters/generic-rest.adapter';
import { ManualEntryAdapter } from '../adapters/manual-entry.adapter';

export interface VendorSyncResult {
  vendorId: string;
  success: boolean;
  slots: number;
  error?: string;
}

@Injectable()
export class VendorSyncService {
  private readonly logger = new Logger(VendorSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBusService,
  ) {}

  /** Sync every configured vendor. */
  async syncAllVendors(): Promise<VendorSyncResult[]> {
    const configs = this.loadVendorConfigs();
    const results: VendorSyncResult[] = [];
    for (const config of configs) {
      results.push(await this.syncVendorConfig(config));
    }
    return results;
  }

  /** Sync a single vendor by id. */
  async syncVendor(vendorId: string): Promise<VendorSyncResult> {
    const config = this.getVendorConfig(vendorId);
    if (!config) {
      await this.writeSyncLog(vendorId, 'availability', false, {
        error: 'Vendor configuration not found',
      });
      throw new NotFoundException(
        `Vendor configuration not found: ${vendorId}`,
      );
    }
    return this.syncVendorConfig(config);
  }

  /** Resolve a vendor configuration by id. */
  getVendorConfig(vendorId: string): VendorConfig | undefined {
    return this.loadVendorConfigs().find((c) => c.vendorId === vendorId);
  }

  /** Instantiate the adapter implementation for a vendor configuration. */
  buildAdapter(config: VendorConfig): VendorAdapter {
    switch (config.type) {
      case 'calendly':
        return new CalendlyAdapter(config);
      case 'thinkific':
        return new ThinkificAdapter(config);
      case 'absorb':
        return new AbsorbAdapter(config);
      case 'rest':
        return new GenericRESTAdapter(config);
      case 'manual':
        return new ManualEntryAdapter(config);
      default:
        throw new Error(
          `Unsupported vendor adapter type: ${String(config.type)}`,
        );
    }
  }

  private async syncVendorConfig(
    config: VendorConfig,
  ): Promise<VendorSyncResult> {
    const adapter = this.buildAdapter(config);
    const certTypes =
      config.certTypes && config.certTypes.length > 0 ? config.certTypes : [];

    try {
      const slots: VendorAvailability[] = [];
      for (const certType of certTypes) {
        slots.push(...(await adapter.fetchAvailability(certType)));
      }

      await this.replaceCache(config.vendorId, slots);
      await this.writeSyncLog(config.vendorId, 'availability', true, {
        certTypes,
        slots: slots.length,
      });

      this.events.emit('vendor.synced', { vendorId: config.vendorId });
      return { vendorId: config.vendorId, success: true, slots: slots.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.writeSyncLog(config.vendorId, 'availability', false, {
        error: message,
      });
      this.logger.warn(`Vendor sync failed for ${config.vendorId}: ${message}`);
      return {
        vendorId: config.vendorId,
        success: false,
        slots: 0,
        error: message,
      };
    }
  }

  private async replaceCache(
    vendorId: string,
    slots: VendorAvailability[],
  ): Promise<void> {
    const now = new Date();
    const rows = slots
      .map((slot) => this.toCacheRow(vendorId, slot, now))
      .filter(
        (row): row is Prisma.vendor_availability_cacheCreateManyInput =>
          row !== null,
      );

    await this.prisma.$transaction([
      this.prisma.vendor_availability_cache.deleteMany({ where: { vendorId } }),
      ...(rows.length
        ? [this.prisma.vendor_availability_cache.createMany({ data: rows })]
        : []),
    ]);
  }

  private toCacheRow(
    vendorId: string,
    slot: VendorAvailability,
    syncedAt: Date,
  ): Prisma.vendor_availability_cacheCreateManyInput | null {
    const date = new Date(slot.date);
    if (Number.isNaN(date.getTime())) return null;
    return {
      vendorId,
      certType: slot.certType,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      seatsAvailable: slot.seatsAvailable,
      deliveryMode: slot.deliveryMode,
      rating: slot.rating ?? null,
      distanceKm: slot.distanceKm ?? null,
      lastSyncedAt: syncedAt,
    };
  }

  private async writeSyncLog(
    vendorId: string,
    syncType: string,
    success: boolean,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.prisma.vendor_sync_logs.create({
        data: {
          vendorId,
          syncType,
          success,
          payload: payload as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to write vendor sync log for ${vendorId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Vendor configurations are environment-driven (VENDOR_INTEGRATION_CONFIG = JSON
   * array of VendorConfig). Returns an empty registry when unset so the layer never
   * fabricates vendors.
   */
  private loadVendorConfigs(): VendorConfig[] {
    const raw = process.env.VENDOR_INTEGRATION_CONFIG;
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (entry): entry is VendorConfig =>
          !!entry &&
          typeof entry === 'object' &&
          typeof (entry as VendorConfig).vendorId === 'string' &&
          typeof (entry as VendorConfig).type === 'string',
      );
    } catch (error) {
      this.logger.error(
        `Invalid VENDOR_INTEGRATION_CONFIG: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }
  }
}
