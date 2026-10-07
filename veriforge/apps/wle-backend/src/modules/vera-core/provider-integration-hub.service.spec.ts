import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import { ProviderIntegrationHubService } from './provider-integration-hub.service';

describe('ProviderIntegrationHubService', () => {
  let service: ProviderIntegrationHubService;

  const events = { emit: jest.fn() };

  const prisma = {
    trainingProvider: { findMany: jest.fn() },
    trainingIngestionRun: { findMany: jest.fn() },
    trainingValidationResult: { findMany: jest.fn() },
    trainingRecord: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    unionHallTrainingReceipt: { count: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.trainingProvider.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Safety First Training',
        code: 'SFT',
        approvalStatus: 'APPROVED',
        active: true,
        complianceStatuses: [{ status: 'COMPLIANT' }],
        _count: { trainingRecords: 4 },
      },
    ]);
    prisma.trainingIngestionRun.findMany.mockResolvedValue([
      {
        id: 10,
        status: 'COMPLETED',
        sourceChannel: 'provider_portal',
        originalFilename: 'batch.csv',
        createdAt: new Date('2026-06-01T10:00:00Z'),
        completedAt: new Date('2026-06-01T10:05:00Z'),
        errorMessage: null,
        _count: { createdRecords: 3 },
      },
    ]);
    prisma.trainingValidationResult.findMany.mockResolvedValue([]);
    prisma.trainingRecord.count.mockResolvedValue(2);
    prisma.trainingRecord.groupBy.mockResolvedValue([
      {
        trainingProviderId: 1,
        _count: { id: 4 },
        _max: { issuedAt: new Date('2026-06-01T09:00:00Z') },
      },
    ]);
    prisma.unionHallTrainingReceipt.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderIntegrationHubService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventBusService, useValue: events },
      ],
    }).compile();

    service = module.get(ProviderIntegrationHubService);
  });

  it('aggregates provider hub summary for a company', async () => {
    const summary = await service.getSummary(7);

    expect(summary.companyId).toBe(7);
    expect(summary.providers).toHaveLength(1);
    expect(summary.providers[0]).toMatchObject({
      id: 1,
      name: 'Safety First Training',
      complianceStatus: 'COMPLIANT',
      recordCount90d: 4,
    });
    expect(summary.metrics.recordsFromProviders90d).toBe(4);
    expect(summary.metrics.pendingVerification).toBe(2);
    expect(summary.channels).toHaveLength(4);
    expect(summary.eventFlow.length).toBeGreaterThan(0);

    expect(events.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: DomainEvent.PROVIDER_HUB_SUMMARY,
        companyId: 7,
        entityType: 'provider_hub',
      }),
    );
  });

  it('queries latest provider compliance without company filter', async () => {
    await service.getSummary(1);

    expect(prisma.trainingProvider.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          complianceStatuses: { orderBy: { assessedAt: 'desc' }, take: 1 },
        }),
      }),
    );
  });
});
