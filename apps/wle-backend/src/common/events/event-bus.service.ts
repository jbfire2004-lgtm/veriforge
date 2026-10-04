import { Injectable, Logger } from '@nestjs/common';

export type DomainEventName =
  | 'renewal.expiring'
  | 'renewal.booked'
  | 'renewal.completed'
  | 'nft.issued'
  | 'vendor.synced';

export type EventHandler = (payload: unknown) => void | Promise<void>;

/** Minimal in-memory pub/sub for cross-service domain events (no infra). */
@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly handlers = new Map<string, Set<EventHandler>>();

  emit(eventName: DomainEventName | string, payload: unknown): void {
    const subscribers = this.handlers.get(eventName);
    this.logger.debug(`emit ${eventName} ${JSON.stringify(payload)}`);
    if (!subscribers || subscribers.size === 0) return;
    for (const handler of subscribers) {
      try {
        void Promise.resolve(handler(payload)).catch((error) =>
          this.logger.error(
            `Handler for ${eventName} rejected: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      } catch (error) {
        this.logger.error(
          `Handler for ${eventName} threw: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  on(eventName: DomainEventName | string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);
    return () => {
      this.handlers.get(eventName)?.delete(handler);
    };
  }
}
