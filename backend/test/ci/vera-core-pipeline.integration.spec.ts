/**
 * Vera Core end-to-end pipeline: training verification emit → event bus → audit.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EventBusService } from '../../src/modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../../src/modules/api-platform/events/domain-events';
import { EventOutboxService } from '../../src/modules/vera-event-bus/event-outbox.service';
import { EventBusMetricsService } from '../../src/modules/vera-event-bus/event-bus-metrics.service';
import { VeraCoreFlowHandler } from '../../src/modules/vera-event-bus/vera-core-flow.handler';
import { AuditLogService } from '../../src/audit/audit-log.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as outboxDelegate from '../../src/modules/vera-event-bus/event-outbox.prisma';

const outbox = {
  create: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  updateMany: jest.fn(),
};

const prisma = {
  trainingVerificationRun: { findFirst: jest.fn().mockResolvedValue(null) },
  workerWalletBundle: {
    findFirst: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
  },
  providerSyncConfig: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
  companyUsageDaily: {
    upsert: jest.fn().mockResolvedValue({}),
  },
  auditLog: { create: jest.fn() },
};

jest
  .spyOn(outboxDelegate, 'eventOutboxDelegate')
  .mockImplementation(() => outbox as never);

describe('Vera Core pipeline integration', () => {
  let bus: EventBusService;
  let flow: VeraCoreFlowHandler;

  beforeEach(async () => {
    jest.clearAllMocks();
    outbox.create.mockResolvedValue({ id: 'evt-1', status: 'PENDING' });

    const audit = {
      logAudit: jest.fn().mockResolvedValue({ id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventBusService,
        EventOutboxService,
        EventBusMetricsService,
        VeraCoreFlowHandler,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: audit },
      ],
    }).compile();

    bus = module.get(EventBusService);
    flow = module.get(VeraCoreFlowHandler);
    const outboxService = module.get(EventOutboxService);
    const metrics = module.get(EventBusMetricsService);
    bus.bindOutbox(outboxService, metrics);
  });

  it('emits training verified → outbox + flow handler audit', async () => {
    const event = {
      name: DomainEvent.TRAINING_VERIFIED,
      occurredAt: new Date().toISOString(),
      companyId: 1,
      entityType: 'training_record',
      entityId: 42,
      data: { workerId: 7, overallStatus: 'VERIFIED' },
    };

    bus.emit(event);
    await flow.handle(event);
    await new Promise((r) => setImmediate(r));

    expect(outbox.create).toHaveBeenCalled();
    expect(prisma.companyUsageDaily.upsert).toHaveBeenCalled();
  });
});
