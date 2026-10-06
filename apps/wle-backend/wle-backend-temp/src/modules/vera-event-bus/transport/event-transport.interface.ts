import type { DomainEventPayload } from '../../api-platform/events/domain-events';

export type PublishedMessage = {
  outboxId: string;
  topic: string;
  natsSubject: string;
  partitionKey: string;
  event: DomainEventPayload;
};

export interface EventTransport {
  readonly name: string;
  publish(message: PublishedMessage): Promise<void>;
  isEnabled(): boolean;
}
