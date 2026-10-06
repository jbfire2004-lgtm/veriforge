import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { TrainingVerificationEngine } from '../../services/trainingVerification';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import { NotificationsService } from '../../notifications/notifications.service';
import { ProviderSyncEngineService } from './provider-sync-engine.service';

describe('ProviderSyncEngineService', () => {
  let service: ProviderSyncEngineService;

  const prisma = {
    trainingProvider: { findUnique: jest.fn() },
    providerSyncConfig: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    providerSyncRun: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    certification: { findFirst: jest.fn() },
    trainingRecord: { findFirst: jest.fn() },
  };

  const verificationEngine = { ingestAndVerify: jest.fn() };
  const audit = { logAudit: jest.fn() };
  const events = { emit: jest.fn() };
  const notifications = { notifyCompanySupervisors: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderSyncEngineService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: audit },
        { provide: TrainingVerificationEngine, useValue: verificationEngine },
        { provide: EventBusService, useValue: events },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get(ProviderSyncEngineService);
  });

  describe('handleWebhook', () => {
    it('processes completions and emits provider sync completed', async () => {
      prisma.providerSyncConfig.findUnique.mockResolvedValue({
        providerId: 3,
        enabled: true,
        webhookSecret: null,
      });
      prisma.providerSyncRun.create.mockResolvedValue({ id: 99 });
      prisma.certification.findFirst.mockResolvedValue({ id: 5 });
      verificationEngine.ingestAndVerify.mockResolvedValue({
        trainingRecordId: 42,
        overallStatus: 'VERIFIED',
      });
      prisma.providerSyncRun.update.mockResolvedValue({});
      prisma.providerSyncConfig.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.handleWebhook(3, {
        companyId: 1,
        completions: [
          {
            workerEmail: 'alex@example.com',
            certificationCode: 'FP-101',
            certificateNumber: 'CERT-1',
            issuedAt: '2026-05-01',
            expiresAt: '2027-05-01',
          },
        ],
      });

      expect(result.recordsVerified).toBe(1);
      expect(result.recordsPushed).toBe(1);
      expect(verificationEngine.ingestAndVerify).toHaveBeenCalledWith(
        expect.objectContaining({
          workerEmail: 'alex@example.com',
          companyId: 1,
          certificationId: 5,
          trainingProviderId: 3,
        }),
      );
      expect(events.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: DomainEvent.PROVIDER_COMPLETION_RECEIVED,
        }),
      );
      expect(events.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: DomainEvent.PROVIDER_SYNC_COMPLETED,
        }),
      );
      expect(notifications.notifyCompanySupervisors).toHaveBeenCalled();
    });

    it('rejects when provider sync is disabled', async () => {
      prisma.providerSyncConfig.findUnique.mockResolvedValue(null);

      await expect(
        service.handleWebhook(3, { companyId: 1, completions: [] }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('upsertSyncConfig', () => {
    it('creates config for an existing provider', async () => {
      prisma.trainingProvider.findUnique.mockResolvedValue({
        id: 3,
        name: 'LMS',
      });
      prisma.providerSyncConfig.upsert.mockResolvedValue({
        providerId: 3,
        syncMode: 'poll',
        enabled: true,
      });

      const row = await service.upsertSyncConfig(3, {
        syncMode: 'poll',
        pollUrl: 'https://lms.example.com/completions',
        pollIntervalMinutes: 30,
      });

      expect(row.providerId).toBe(3);
      expect(prisma.providerSyncConfig.upsert).toHaveBeenCalled();
      expect(audit.logAudit).toHaveBeenCalledWith(
        null,
        'provider_sync.config.update',
        { type: 'ProviderSyncConfig', id: 3 },
        expect.objectContaining({ enabled: true }),
      );
    });
  });
});
