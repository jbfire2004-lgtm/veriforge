import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegulatoryComplianceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../verification/verification.service';
import { TrainingPipelineService } from '../modules/vera-core/training-pipeline.service';
import { TrainingWalletIntegrationService } from '../modules/vera-core/training-wallet-integration.service';
import { TrainingStandardsComplianceService } from '../modules/training-standards-compliance/training-standards-compliance.service';
import { RegulatoryDecisionService } from '../modules/training-standards-compliance/regulatory/regulatory-decision.service';
import { TrainingCredentialNftCoordinatorService } from '../modules/training-credential-nft/training-credential-nft-coordinator.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import { NotificationsService } from '../notifications/notifications.service';
import { TrainingVerificationEngine } from './trainingVerification';
import * as prismaDelegate from './training-verification.prisma';

const verificationRuns = {
  create: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
};

jest
  .spyOn(prismaDelegate, 'verificationRunDelegate')
  .mockImplementation(() => verificationRuns as never);

describe('TrainingVerificationEngine', () => {
  let engine: TrainingVerificationEngine;

  const prisma = {
    trainingRecord: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    trainingVerificationRun: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    trainingCredentialNft: {
      findUnique: jest.fn(),
    },
  };

  const verification = {
    validateTrainingRecord: jest.fn(),
    completeTrainingVerification: jest.fn(),
  };

  const pipeline = { ingest: jest.fn() };
  const walletIntegration = { syncAfterTrainingRecord: jest.fn() };
  const standards = { validateTraining: jest.fn() };
  const regulatory = { verifyTrainingAgainstRegulations: jest.fn() };
  const nftCoordinator = { scheduleMintIfEligible: jest.fn() };
  const events = { emit: jest.fn() };
  const notifications = { notifyCompanySupervisors: jest.fn() };

  const baseRecord = {
    id: 42,
    workerId: 7,
    companyId: 1,
    projectId: 3,
    worker: {
      id: 7,
      firstName: 'Alex',
      lastName: 'Rivera',
      companyId: 1,
    },
    certification: { id: 5, name: 'Fall Protection', code: 'FP' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.trainingRecord.findUnique.mockResolvedValue(baseRecord);
    verification.validateTrainingRecord.mockResolvedValue({
      trainingRecordId: 42,
      overallStatus: 'VERIFIED',
      verifiedAt: '2026-06-08T12:00:00Z',
      summary: ['All checks passed'],
      checks: { expiry: { status: 'PASS' } },
      certification: baseRecord.certification,
      worker: baseRecord.worker,
    });
    standards.validateTraining.mockResolvedValue({
      outcome: 'APPROVED',
      score: 95,
      jurisdictionCode: 'ON',
      matchedStandardCodes: ['FP-ON'],
      missingStandardCodes: [],
      issues: [],
    });
    regulatory.verifyTrainingAgainstRegulations.mockResolvedValue({
      regulatoryComplianceStatus: RegulatoryComplianceStatus.COMPLIANT,
    });
    walletIntegration.syncAfterTrainingRecord.mockResolvedValue({});
    nftCoordinator.scheduleMintIfEligible.mockResolvedValue(undefined);
    prisma.trainingCredentialNft.findUnique.mockResolvedValue(null);
    verificationRuns.create.mockResolvedValue({ id: 99 });
    prisma.trainingRecord.findUnique
      .mockResolvedValueOnce(baseRecord)
      .mockResolvedValue({
        completedAt: new Date('2026-06-08T12:05:00Z'),
        verifiedAt: new Date('2026-06-08T12:00:00Z'),
        credentialNft: null,
      });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingVerificationEngine,
        { provide: PrismaService, useValue: prisma },
        { provide: VerificationService, useValue: verification },
        { provide: TrainingPipelineService, useValue: pipeline },
        {
          provide: TrainingWalletIntegrationService,
          useValue: walletIntegration,
        },
        { provide: TrainingStandardsComplianceService, useValue: standards },
        { provide: RegulatoryDecisionService, useValue: regulatory },
        {
          provide: TrainingCredentialNftCoordinatorService,
          useValue: nftCoordinator,
        },
        { provide: EventBusService, useValue: events },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    engine = module.get(TrainingVerificationEngine);
  });

  it('runs full verification on an existing record', async () => {
    const result = await engine.verifyRecord(42, {
      actorId: 10,
      finalize: false,
    });

    expect(result.trainingRecordId).toBe(42);
    expect(result.overallStatus).toBe('VERIFIED');
    expect(result.regulatoryStatus).toBe(RegulatoryComplianceStatus.COMPLIANT);
    expect(result.standardsOutcome).toBe('APPROVED');
    expect(result.propagation.wallet.synced).toBe(true);
    expect(verificationRuns.create).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith(
      expect.objectContaining({ name: DomainEvent.TRAINING_VERIFICATION_RUN }),
    );
  });

  it('notifies supervisors when verification is not VERIFIED', async () => {
    verification.validateTrainingRecord.mockResolvedValue({
      trainingRecordId: 42,
      overallStatus: 'ATTENTION',
      verifiedAt: '2026-06-08T12:00:00Z',
      summary: ['Provider mismatch'],
      checks: {},
      certification: baseRecord.certification,
      worker: baseRecord.worker,
    });

    const result = await engine.verifyRecord(42);

    expect(result.overallStatus).toBe('ATTENTION');
    expect(result.propagation.notifications.supervisorsNotified).toBe(true);
    expect(notifications.notifyCompanySupervisors).toHaveBeenCalled();
  });

  it('ingestAndVerify rejects when worker cannot be resolved', async () => {
    pipeline.ingest.mockResolvedValue({ ok: false, error: 'WORKER_NOT_FOUND' });

    await expect(
      engine.ingestAndVerify({ certificationId: 5, companyId: 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('ingestAndVerify emits training.uploaded and runs verification', async () => {
    pipeline.ingest.mockResolvedValue({
      ok: true,
      workerId: 7,
      trainingRecord: { id: 42, certification: baseRecord.certification },
    });
    prisma.trainingRecord.findUnique.mockReset();
    prisma.trainingRecord.findUnique
      .mockResolvedValueOnce(baseRecord)
      .mockResolvedValueOnce({ completedAt: new Date() })
      .mockResolvedValue({
        workerId: 7,
        companyId: 1,
        projectId: 3,
        walletItem: { id: 1 },
        credentialNft: null,
        unionHallReceipts: [],
      });

    await engine.ingestAndVerify(
      { certificationId: 5, companyId: 1, workerId: 7 },
      5,
    );

    expect(events.emit).toHaveBeenCalledWith(
      expect.objectContaining({ name: DomainEvent.TRAINING_UPLOADED }),
    );
    expect(verification.validateTrainingRecord).toHaveBeenCalledWith(42, {});
  });

  it('finalize calls completeTrainingVerification when VERIFIED', async () => {
    prisma.trainingRecord.findUnique.mockReset();
    prisma.trainingRecord.findUnique
      .mockResolvedValueOnce(baseRecord)
      .mockResolvedValueOnce({ completedAt: new Date() })
      .mockResolvedValue({
        workerId: 7,
        companyId: 1,
        projectId: 3,
        walletItem: { id: 1 },
        credentialNft: null,
        unionHallReceipts: [],
      });

    await engine.verifyRecord(42, { actorId: 3, finalize: true });

    expect(verification.completeTrainingVerification).toHaveBeenCalledWith(42, {
      userId: 3,
    });
  });

  it('getVerifiedRecord returns null when no runs exist', async () => {
    verificationRuns.findFirst.mockResolvedValue(null);
    const result = await engine.getVerifiedRecord(42);
    expect(result).toBeNull();
  });

  it('throws when record is missing', async () => {
    prisma.trainingRecord.findUnique.mockReset();
    prisma.trainingRecord.findUnique.mockResolvedValue(null);
    await expect(engine.verifyRecord(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
