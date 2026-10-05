import { Test, TestingModule } from '@nestjs/testing';
import { DomainEvent } from '../api-platform/events/domain-events';
import { PrismaService } from '../../prisma/prisma.service';
import { EventOutboxService } from './event-outbox.service';
import { EventBusMetricsService } from './event-bus-metrics.service';
import * as outboxDelegate from './event-outbox.prisma';

const outbox = {
  create: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
};

jest
  .spyOn(outboxDelegate, 'eventOutboxDelegate')
  .mockImplementation(() => outbox as never);

describe('EventOutboxService', () => {
  let service: EventOutboxService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventOutboxService,
        { provide: PrismaService, useValue: {} },
        EventBusMetricsService,
      ],
    }).compile();

    service = module.get(EventOutboxService);
  });

  it('enqueues domain events with topic metadata', async () => {
    outbox.create.mockResolvedValue({
      id: 'evt-1',
      eventName: DomainEvent.TRAINING_VERIFIED,
      topic: 'vera.training',
      status: 'PENDING',
      attempts: 0,
      maxAttempts: 5,
    });

    const row = await service.enqueue({
      name: DomainEvent.TRAINING_VERIFIED,
      occurredAt: new Date().toISOString(),
      entityType: 'training_record',
      entityId: 42,
      companyId: 1,
      data: { workerId: 7 },
    });

    expect(row?.eventName).toBe(DomainEvent.TRAINING_VERIFIED);
    expect(outbox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          topic: 'vera.training',
          eventName: DomainEvent.TRAINING_VERIFIED,
        }),
      }),
    );
  });

  it('marks published rows', async () => {
    outbox.update.mockResolvedValue({});
    await service.markPublished('evt-1');
    expect(outbox.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evt-1' },
        data: expect.objectContaining({ status: 'PUBLISHED' }),
      }),
    );
  });
});
