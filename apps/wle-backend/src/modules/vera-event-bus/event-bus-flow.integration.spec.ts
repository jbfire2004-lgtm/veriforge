import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import { EventOutboxService } from './event-outbox.service';
import { EventBusMetricsService } from './event-bus-metrics.service';
import { trainingVerifiedEvent } from './publishers/vera-event-publishers';
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

describe('Event bus emit → outbox integration', () => {
  let bus: EventBusService;
  let outboxService: EventOutboxService;
  let metrics: EventBusMetricsService;
  const emitHandler = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.VERA_EVENT_OUTBOX;

    outbox.create.mockResolvedValue({
      id: 'evt-flow-1',
      eventName: DomainEvent.TRAINING_VERIFIED,
      topic: 'vera.training',
      status: 'PENDING',
      attempts: 0,
      maxAttempts: 5,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventBusService,
        EventOutboxService,
        EventBusMetricsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    bus = module.get(EventBusService);
    outboxService = module.get(EventOutboxService);
    metrics = module.get(EventBusMetricsService);
    bus.bindOutbox(outboxService, metrics);
    bus.on(DomainEvent.TRAINING_VERIFIED, emitHandler);
  });

  it('enqueues and delivers in-process when emit is called', async () => {
    const event = trainingVerifiedEvent({
      trainingRecordId: 99,
      workerId: 7,
      companyId: 1,
      overallStatus: 'VERIFIED',
    });

    bus.emit(event);

    await new Promise((r) => setImmediate(r));

    expect(outbox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventName: DomainEvent.TRAINING_VERIFIED,
          topic: 'vera.training',
          partitionKey: 'company:1',
        }),
      }),
    );
    expect(emitHandler).toHaveBeenCalledWith(event);
    const snap = metrics.getSnapshot();
    expect(snap.emitted).toBeGreaterThanOrEqual(1);
    expect(snap.enqueued).toBeGreaterThanOrEqual(1);
  });

  it('skips outbox when VERA_EVENT_OUTBOX=0', () => {
    process.env.VERA_EVENT_OUTBOX = '0';

    bus.emit(
      trainingVerifiedEvent({
        trainingRecordId: 1,
        workerId: 2,
        companyId: 3,
        overallStatus: 'VERIFIED',
      }),
    );

    expect(outbox.create).not.toHaveBeenCalled();
    expect(emitHandler).toHaveBeenCalled();
  });
});
