import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../common/events/event-bus.service';

/**
 * Renewal-engine notification gateway. Methods are deterministic stubs that log
 * structured intents; replace `dispatch` with the platform push/email provider.
 * Also subscribes to domain events for follow-up notifications.
 */
@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly events: EventBusService) {}

  onModuleInit(): void {
    this.events.on('renewal.completed', (payload) =>
      this.dispatch('renewal.completed.followup', payload),
    );
    this.events.on('nft.issued', (payload) =>
      this.dispatch('nft.issued.followup', payload),
    );
  }

  async sendExpiringSoon(
    workerId: string | number,
    certificationId: string,
  ): Promise<void> {
    await this.dispatch('renewal.expiring_soon', { workerId, certificationId });
  }

  async sendBookingConfirmed(
    workerId: string | number,
    bookingId: string,
  ): Promise<void> {
    await this.dispatch('renewal.booking_confirmed', { workerId, bookingId });
  }

  async sendTrainingReminder(
    workerId: string | number,
    bookingId: string,
  ): Promise<void> {
    await this.dispatch('renewal.training_reminder', { workerId, bookingId });
  }

  async sendCompletionReceived(
    workerId: string | number,
    bookingId: string,
  ): Promise<void> {
    await this.dispatch('renewal.completion_received', { workerId, bookingId });
  }

  private async dispatch(event: string, data: unknown): Promise<void> {
    this.logger.log(
      JSON.stringify({ type: 'renewal.notification', event, data }),
    );
  }
}
