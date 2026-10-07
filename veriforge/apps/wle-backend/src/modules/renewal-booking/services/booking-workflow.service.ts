import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  BookingDeliveryMode,
  BookingStatus,
  VendorSource,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventBusService } from '../../../common/events/event-bus.service';
import { CertificationService } from './certification.service';
import { NotificationService } from './notification.service';
import { NftReissueService } from './nft-reissue.service';
import { VendorIntegrationService } from '../../vendor-integration/services/vendor-integration.service';
import { VendorSyncService } from '../../vendor-integration/services/vendor-sync.service';
import {
  VendorAdapterType,
  VendorConfig,
} from '../../vendor-integration/interfaces/vendor-adapter.interface';
import { VendorDeliveryMode } from '../../vendor-integration/interfaces/vendor-availability.interface';
import { BookRenewalDto } from '../dto/book-renewal.dto';
import { ConfirmVendorBookingDto } from '../dto/confirm-vendor-booking.dto';

export interface BookingSummary {
  bookingId: string;
  status: BookingStatus;
  certType: string;
  vendorId: string;
  vendorConfirmationCode: string | null;
  scheduledStart: string;
  scheduledEnd: string;
}

const VENDOR_SOURCE_BY_TYPE: Record<VendorAdapterType, VendorSource> = {
  calendly: VendorSource.CALENDLY,
  thinkific: VendorSource.THINKIFIC,
  absorb: VendorSource.ABSORB,
  rest: VendorSource.REST,
  manual: VendorSource.MANUAL,
};

const DELIVERY_MODE_BY_VENDOR: Record<VendorDeliveryMode, BookingDeliveryMode> =
  {
    online: BookingDeliveryMode.ONLINE_SELF_PACED,
    in_person: BookingDeliveryMode.IN_PERSON,
    blended: BookingDeliveryMode.HYBRID,
  };

@Injectable()
export class BookingWorkflowService {
  private readonly logger = new Logger(BookingWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly certifications: CertificationService,
    private readonly vendors: VendorIntegrationService,
    private readonly vendorSync: VendorSyncService,
    private readonly notifications: NotificationService,
    private readonly nftReissue: NftReissueService,
    private readonly events: EventBusService,
  ) {}

  /** Create a booking, confirm with the vendor, notify, and emit `renewal.booked`. */
  async bookRenewal(dto: BookRenewalDto): Promise<BookingSummary> {
    const workerId = Number(dto.workerId);
    const cert = await this.certifications.getCertificationById(
      dto.certificationId,
    );
    const certType = cert?.certType ?? 'UNKNOWN';

    const scheduledStart = this.combineDateTime(dto.date, dto.time);
    const scheduledEnd = new Date(
      scheduledStart.getTime() + 2 * 60 * 60 * 1000,
    );

    const config = this.vendorSync.getVendorConfig(dto.vendorId);
    const slots = await this.vendors.getAvailabilityForCertType(certType);
    const slot = slots.find(
      (s) => s.vendorId === dto.vendorId && s.date === dto.date,
    );

    const booking = await this.prisma.bookingRecord.create({
      data: {
        workerId,
        certType,
        certificationId: dto.certificationId,
        vendorId: dto.vendorId,
        vendorName: config?.name ?? dto.vendorId,
        vendorSource: this.resolveVendorSource(config),
        deliveryMode: this.resolveDeliveryMode(slot?.deliveryMode),
        externalRef: `${dto.vendorId}:${dto.date}:${dto.time}`,
        scheduledStart,
        scheduledEnd,
        price: slot?.price ?? null,
        status: BookingStatus.PENDING,
      },
    });

    const confirmation = await this.vendors.confirmBooking({
      vendorId: dto.vendorId,
      workerId: dto.workerId,
      certificationId: dto.certificationId,
      date: dto.date,
      time: dto.time,
    });

    const updated = await this.prisma.bookingRecord.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
        confirmationCode: confirmation.confirmationCode,
      },
    });

    await this.notifications.sendBookingConfirmed(dto.workerId, updated.id);
    this.events.emit('renewal.booked', { bookingId: updated.id });

    return this.toSummary(updated);
  }

  /** Apply a vendor confirmation/rejection; on confirmation, treat as completion. */
  async handleVendorConfirmation(
    dto: ConfirmVendorBookingDto,
  ): Promise<{ ok: true }> {
    const booking = await this.prisma.bookingRecord.findUnique({
      where: { id: dto.bookingId },
    });
    if (!booking)
      throw new NotFoundException(`Booking not found: ${dto.bookingId}`);

    if (dto.status === 'rejected') {
      await this.prisma.bookingRecord.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          confirmationCode: dto.vendorConfirmationCode,
          cancelledAt: new Date(),
          cancellationReason: 'Vendor rejected booking',
        },
      });
      return { ok: true };
    }

    await this.prisma.bookingRecord.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.COMPLETED,
        confirmationCode: dto.vendorConfirmationCode,
        completedAt: new Date(),
      },
    });

    await this.nftReissue.handleTrainingCompletion(booking.id);
    await this.notifications.sendCompletionReceived(
      String(booking.workerId),
      booking.id,
    );
    this.events.emit('renewal.completed', { bookingId: booking.id });

    return { ok: true };
  }

  private resolveVendorSource(config?: VendorConfig): VendorSource {
    if (config && config.type in VENDOR_SOURCE_BY_TYPE) {
      return VENDOR_SOURCE_BY_TYPE[config.type];
    }
    return VendorSource.REST;
  }

  private resolveDeliveryMode(mode?: VendorDeliveryMode): BookingDeliveryMode {
    return mode ? DELIVERY_MODE_BY_VENDOR[mode] : BookingDeliveryMode.IN_PERSON;
  }

  private combineDateTime(date: string, time: string): Date {
    const parsed = new Date(
      `${date}T${time.length === 5 ? `${time}:00` : time}`,
    );
    if (Number.isNaN(parsed.getTime())) {
      this.logger.warn(`Invalid date/time ${date} ${time}; defaulting to now`);
      return new Date();
    }
    return parsed;
  }

  private toSummary(booking: {
    id: string;
    status: BookingStatus;
    certType: string;
    vendorId: string;
    confirmationCode: string | null;
    scheduledStart: Date;
    scheduledEnd: Date;
  }): BookingSummary {
    return {
      bookingId: booking.id,
      status: booking.status,
      certType: booking.certType,
      vendorId: booking.vendorId,
      vendorConfirmationCode: booking.confirmationCode,
      scheduledStart: booking.scheduledStart.toISOString(),
      scheduledEnd: booking.scheduledEnd.toISOString(),
    };
  }
}
