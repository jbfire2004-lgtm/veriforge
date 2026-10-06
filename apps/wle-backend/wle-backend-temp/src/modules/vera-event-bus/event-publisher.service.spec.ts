import { Test, TestingModule } from '@nestjs/testing';
import { DomainEvent } from '../api-platform/events/domain-events';
import { EventPublisherService } from './event-publisher.service';
import { EventOutboxService } from './event-outbox.service';
import { EventDlqService } from './event-dlq.service';
import { NatsEventTransport } from './transport/nats.transport';
import { KafkaEventTransport } from './transport/kafka.transport';
import type { EventOutboxRow } from './event-outbox.prisma';

const sampleEvent = {
  name: DomainEvent.TRAINING_VERIFIED,
  occurredAt: '2026-06-09T12:00:00.000Z',
  companyId: 1,
  entityType: 'training_record',
  entityId: 42,
  data: { workerId: 7 },
};

function outboxRow(overrides: Partial<EventOutboxRow> = {}): EventOutboxRow {
  return {
    id: 'outbox-1',
    eventName: DomainEvent.TRAINING_VERIFIED,
    topic: 'vera.training',
    natsSubject: 'vera.training.training_verified',
    partitionKey: 'company:1',
    payload: sampleEvent,
    status: 'PENDING',
    attempts: 0,
    maxAttempts: 5,
    nextRetryAt: null,
    lastError: null,
    publishedAt: null,
    idempotencyKey: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('EventPublisherService', () => {
  let publisher: EventPublisherService;
  let outbox: jest.Mocked<
    Pick<EventOutboxService, 'claimBatch' | 'markPublished' | 'markFailed'>
  >;
  let dlq: jest.Mocked<Pick<EventDlqService, 'moveFromOutbox'>>;
  let nats: { name: string; isEnabled: jest.Mock; publish: jest.Mock };
  let kafka: { name: string; isEnabled: jest.Mock; publish: jest.Mock };

  beforeEach(async () => {
    outbox = {
      claimBatch: jest.fn(),
      markPublished: jest.fn().mockResolvedValue(undefined),
      markFailed: jest.fn(),
    };
    dlq = {
      moveFromOutbox: jest.fn().mockResolvedValue(undefined),
    };
    nats = {
      name: 'nats',
      isEnabled: jest.fn().mockReturnValue(false),
      publish: jest.fn().mockResolvedValue(undefined),
    };
    kafka = {
      name: 'kafka',
      isEnabled: jest.fn().mockReturnValue(false),
      publish: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventPublisherService,
        { provide: EventOutboxService, useValue: outbox },
        { provide: EventDlqService, useValue: dlq },
        { provide: NatsEventTransport, useValue: nats },
        { provide: KafkaEventTransport, useValue: kafka },
      ],
    }).compile();

    publisher = module.get(EventPublisherService);
  });

  it('marks outbox rows published when no transports are enabled', async () => {
    outbox.claimBatch.mockResolvedValue([outboxRow()]);

    const result = await publisher.publishPendingBatch();

    expect(result).toEqual({ published: 1, failed: 0, dlq: 0 });
    expect(outbox.markPublished).toHaveBeenCalledWith('outbox-1');
    expect(nats.publish).not.toHaveBeenCalled();
  });

  it('publishes to enabled transports then marks published', async () => {
    nats.isEnabled.mockReturnValue(true);
    kafka.isEnabled.mockReturnValue(true);
    outbox.claimBatch.mockResolvedValue([outboxRow()]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventPublisherService,
        { provide: EventOutboxService, useValue: outbox },
        { provide: EventDlqService, useValue: dlq },
        { provide: NatsEventTransport, useValue: nats },
        { provide: KafkaEventTransport, useValue: kafka },
      ],
    }).compile();
    publisher = module.get(EventPublisherService);

    const result = await publisher.publishPendingBatch();

    expect(result).toEqual({ published: 1, failed: 0, dlq: 0 });
    expect(nats.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        outboxId: 'outbox-1',
        topic: 'vera.training',
        event: sampleEvent,
      }),
    );
    expect(kafka.publish).toHaveBeenCalled();
    expect(outbox.markPublished).toHaveBeenCalledWith('outbox-1');
  });

  it('schedules retry when publish fails with attempts remaining', async () => {
    nats.isEnabled.mockReturnValue(true);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventPublisherService,
        { provide: EventOutboxService, useValue: outbox },
        { provide: EventDlqService, useValue: dlq },
        { provide: NatsEventTransport, useValue: nats },
        { provide: KafkaEventTransport, useValue: kafka },
      ],
    }).compile();
    publisher = module.get(EventPublisherService);

    nats.publish.mockRejectedValue(new Error('NATS connection refused'));
    outbox.claimBatch.mockResolvedValue([outboxRow({ attempts: 1 })]);
    outbox.markFailed.mockResolvedValue('retry');

    const result = await publisher.publishPendingBatch();

    expect(result).toEqual({ published: 0, failed: 1, dlq: 0 });
    expect(outbox.markFailed).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'outbox-1' }),
      'NATS connection refused',
      expect.any(Date),
    );
    expect(dlq.moveFromOutbox).not.toHaveBeenCalled();
  });

  it('moves exhausted rows to DLQ', async () => {
    nats.isEnabled.mockReturnValue(true);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventPublisherService,
        { provide: EventOutboxService, useValue: outbox },
        { provide: EventDlqService, useValue: dlq },
        { provide: NatsEventTransport, useValue: nats },
        { provide: KafkaEventTransport, useValue: kafka },
      ],
    }).compile();
    publisher = module.get(EventPublisherService);

    nats.publish.mockRejectedValue(new Error('broker down'));
    const row = outboxRow({ attempts: 4, maxAttempts: 5 });
    outbox.claimBatch.mockResolvedValue([row]);
    outbox.markFailed.mockResolvedValue('dlq');

    const result = await publisher.publishPendingBatch();

    expect(result).toEqual({ published: 0, failed: 0, dlq: 1 });
    expect(dlq.moveFromOutbox).toHaveBeenCalledWith(
      row,
      'broker down',
      'publisher',
    );
  });
});
