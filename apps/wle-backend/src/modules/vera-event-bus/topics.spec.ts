import { DomainEvent } from '../api-platform/events/domain-events';
import {
  natsSubjectForEvent,
  partitionKeyForEvent,
  topicForEvent,
  VeraEventTopic,
} from './topics';

describe('Vera event topics', () => {
  it('maps training verified to training topic', () => {
    expect(topicForEvent(DomainEvent.TRAINING_VERIFIED)).toBe(
      VeraEventTopic.TRAINING,
    );
    expect(natsSubjectForEvent(DomainEvent.TRAINING_VERIFIED)).toContain(
      'vera.training',
    );
  });

  it('builds partition keys from company id', () => {
    expect(
      partitionKeyForEvent({
        companyId: 12,
        entityType: 'worker',
        entityId: 3,
      }),
    ).toBe('company:12');
  });

  it('maps wallet events to wallet topic', () => {
    expect(topicForEvent(DomainEvent.WALLET_UPDATED)).toBe(
      VeraEventTopic.WALLET,
    );
  });

  it('maps provider sync to provider topic', () => {
    expect(topicForEvent(DomainEvent.PROVIDER_SYNC_EVENT)).toBe(
      VeraEventTopic.PROVIDER,
    );
  });
});
