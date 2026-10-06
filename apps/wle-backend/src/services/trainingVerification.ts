import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { RegulatoryComplianceStatus } from '@prisma/client';
import { CredentialLedgerActorType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../verification/verification.service';
import type { ValidateTrainingRecordOptions } from '../verification/types/training-record-verification.types';
import { TrainingPipelineService } from '../modules/vera-core/training-pipeline.service';
import { TrainingWalletIntegrationService } from '../modules/vera-core/training-wallet-integration.service';
import { TrainingStandardsComplianceService } from '../modules/training-standards-compliance/training-standards-compliance.service';
import { RegulatoryDecisionService } from '../modules/training-standards-compliance/regulatory/regulatory-decision.service';
import { TrainingCredentialNftCoordinatorService } from '../modules/training-credential-nft/training-credential-nft-coordinator.service';
import { CredentialLedgerService } from '../modules/credential-ledger/credential-ledger.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import {
  trainingVerifiedEvent,
  walletUpdatedEvent,
  workerTrainingCompletedEvent,
} from '../modules/vera-event-bus/publishers/vera-event-publishers';
import { NotificationsService } from '../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../notifications/notification-types';
import type {
  ProviderIngestPayload,
  VerifiedTrainingPropagation,
  VerifiedTrainingRecord,
  VerifyRecordOptions,
} from './training-verification.types';
import { verificationRunDelegate } from './training-verification.prisma';

/**
 * Vera Core — Training Verification Engine
 *
 * End-to-end pipeline:
 * 1. Provider ingest → training record
 * 2. Authenticity checks (provider, worker, certificate, completion)
 * 3. Regulatory + jurisdictional standards validation
 * 4. Expiry rule evaluation (structured + standards engines)
 * 5. Verified record persistence + audit run
 * 6. Blockchain credential mint scheduling
 * 7. Propagation: worker wallet, company compliance, project profile, union hall
 * 8. Event bus + supervisor notifications
 */
@Injectable()
export class TrainingVerificationEngine {
  private readonly logger = new Logger(TrainingVerificationEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly verification: VerificationService,
    private readonly pipeline: TrainingPipelineService,
    private readonly walletIntegration: TrainingWalletIntegrationService,
    private readonly standards: TrainingStandardsComplianceService,
    private readonly regulatory: RegulatoryDecisionService,
    private readonly nftCoordinator: TrainingCredentialNftCoordinatorService,
    private readonly credentialLedger: CredentialLedgerService,
    private readonly events: EventBusService,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  /** Ingest provider payload then run the full verification engine. */
  async ingestAndVerify(
    payload: ProviderIngestPayload,
    actorId?: number,
  ): Promise<VerifiedTrainingRecord> {
    this.logger.log(
      JSON.stringify({
        type: 'training_verification.ingest.start',
        companyId: payload.companyId ?? null,
        certificationId: payload.certificationId,
        trainingProviderId: payload.trainingProviderId ?? null,
      }),
    );

    const ingest = await this.pipeline.ingest({
      workerId: payload.workerId,
      workerEmail: payload.workerEmail,
      workerPhone: payload.workerPhone,
      equipmentId: payload.equipmentId,
      companyId: payload.companyId,
      projectId: payload.projectId,
      certificationId: payload.certificationId,
      providerId: payload.providerId,
      trainingProviderId: payload.trainingProviderId,
      courseId: payload.courseId,
      instructorId: payload.instructorId,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
      issuedAt: payload.issuedAt ? new Date(payload.issuedAt) : undefined,
      certificateNumber: payload.certificateNumber,
      ingestionRunId: payload.ingestionRunId,
    });

    if (!ingest.ok || !ingest.trainingRecord) {
      throw new BadRequestException(
        ingest.error ?? 'Provider ingest failed — worker not resolved',
      );
    }

    this.events.emit({
      name: DomainEvent.TRAINING_UPLOADED,
      occurredAt: new Date().toISOString(),
      companyId: payload.companyId,
      projectId: payload.projectId,
      entityType: 'training_record',
      entityId: ingest.trainingRecord.id,
      actorId,
      data: {
        source: 'training_verification_engine',
        trainingProviderId: payload.trainingProviderId ?? null,
      },
    });

    this.events.emit(
      workerTrainingCompletedEvent({
        trainingRecordId: ingest.trainingRecord.id,
        workerId: ingest.trainingRecord.workerId,
        companyId: payload.companyId,
        projectId: payload.projectId,
        certificationId: payload.certificationId,
        actorId,
      }),
    );

    return this.verifyRecord(ingest.trainingRecord.id, {
      jurisdictionCode: payload.jurisdictionCode,
      actorId,
      finalize: true,
    });
  }

  /** Run authenticity + regulatory + jurisdictional validation on an existing record. */
  async verifyRecord(
    trainingRecordId: number,
    options?: VerifyRecordOptions,
  ): Promise<VerifiedTrainingRecord> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      include: {
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyId: true,
          },
        },
        certification: { select: { id: true, name: true, code: true } },
      },
    });
    if (!record?.worker) {
      throw new NotFoundException('Training record not found');
    }

    const validateOptions: ValidateTrainingRecordOptions = {
      expectedWorkerId: options?.expectedWorkerId,
      expectedCompanyId: options?.expectedCompanyId,
      expectedTrainingType: options?.expectedTrainingType,
      expectedCertificateNumber: options?.expectedCertificateNumber,
      expectedProvider: options?.expectedProvider,
    };

    const authenticity = await this.verification.validateTrainingRecord(
      trainingRecordId,
      validateOptions,
    );

    const standardsReport = await this.standards.validateTraining(
      trainingRecordId,
      options?.jurisdictionCode,
      options?.actorId,
    );

    let regulatoryStatus: string | null = null;
    try {
      const regulatoryDecision =
        await this.regulatory.verifyTrainingAgainstRegulations(
          trainingRecordId,
          options?.actorId,
        );
      regulatoryStatus = regulatoryDecision.regulatoryComplianceStatus;
    } catch (e) {
      this.logger.warn(
        `Regulatory alignment failed for record ${trainingRecordId}: ${e}`,
      );
      regulatoryStatus = RegulatoryComplianceStatus.NON_COMPLIANT;
    }

    let propagation: VerifiedTrainingPropagation = {
      wallet: { synced: false, workerId: record.workerId },
      company: { refreshed: false, companyId: record.companyId },
      project: {
        projectId: record.projectId,
        companyId: record.companyId,
      },
      unionHall: { receiptsEnsured: false },
      credentialNft: { scheduled: false, mintStatus: null, nftTokenId: null },
      notifications: { supervisorsNotified: false },
    };

    if (authenticity.overallStatus !== 'VERIFIED') {
      propagation = await this.propagatePartialRecord(
        trainingRecordId,
        record.worker.companyId,
        authenticity.overallStatus,
        authenticity.summary.join(' '),
        options?.actorId,
      );
    } else if (options?.finalize) {
      await this.verification.completeTrainingVerification(
        trainingRecordId,
        options.actorId != null ? { userId: options.actorId } : null,
      );
      propagation = await this.readPropagationStatus(
        trainingRecordId,
        record.worker.companyId,
      );
    } else {
      propagation = await this.propagateVerifiedRecord(
        trainingRecordId,
        record.worker.companyId,
        options?.actorId,
      );
    }

    const refreshed = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      select: { completedAt: true },
    });

    const runs = verificationRunDelegate(this.prisma);
    const run = await runs.create({
      data: {
        trainingRecordId,
        overallStatus: authenticity.overallStatus,
        authenticityStatus: authenticity.overallStatus,
        regulatoryStatus,
        standardsOutcome: standardsReport.outcome,
        jurisdictionCode: standardsReport.jurisdictionCode,
        checks: JSON.parse(
          JSON.stringify({
            authenticity: authenticity.checks,
            standards: {
              outcome: standardsReport.outcome,
              score: standardsReport.score,
              matchedStandardCodes: standardsReport.matchedStandardCodes,
              missingStandardCodes: standardsReport.missingStandardCodes,
              issues: standardsReport.issues,
            },
          }),
        ),
        propagation: JSON.parse(JSON.stringify(propagation)),
        actorId: options?.actorId,
      },
    });

    const companyId = record.companyId ?? record.worker.companyId ?? undefined;
    this.events.emit({
      name: DomainEvent.TRAINING_VERIFICATION_RUN,
      occurredAt: new Date().toISOString(),
      companyId,
      projectId: record.projectId ?? undefined,
      entityType: 'training_verification_run',
      entityId: run.id,
      actorId: options?.actorId,
      data: {
        trainingRecordId,
        overallStatus: authenticity.overallStatus,
        regulatoryStatus,
        standardsOutcome: standardsReport.outcome,
      },
    });

    if (authenticity.overallStatus === 'VERIFIED') {
      await this.credentialLedger.recordCredentialVerified({
        credentialId: trainingRecordId,
        workerId: record.worker.id,
        providerId: record.providerId,
        projectId: record.projectId,
        companyId: companyId ?? null,
        actorId: options?.actorId ?? null,
        actorType: options?.actorId
          ? CredentialLedgerActorType.SUPERVISOR
          : CredentialLedgerActorType.SYSTEM,
        payload: {
          source: 'training_verification_engine',
          engineRunId: run.id,
          overallStatus: authenticity.overallStatus,
          standardsOutcome: standardsReport.outcome,
        },
      });
      this.events.emit(
        trainingVerifiedEvent({
          trainingRecordId,
          workerId: record.worker.id,
          companyId: companyId ?? undefined,
          projectId: record.projectId ?? undefined,
          overallStatus: authenticity.overallStatus,
          actorId: options?.actorId,
        }),
      );
    } else if (
      record.expiresAt != null &&
      record.expiresAt.getTime() < Date.now()
    ) {
      await this.credentialLedger.recordCredentialExpired({
        credentialId: trainingRecordId,
        workerId: record.worker.id,
        providerId: record.providerId,
        projectId: record.projectId,
        companyId: companyId ?? null,
        payload: {
          source: 'training_verification_engine',
          engineRunId: run.id,
          expiresAt: record.expiresAt.toISOString(),
        },
      });
    }

    this.logger.log(
      JSON.stringify({
        type: 'training_verification.run.complete',
        runId: run.id,
        trainingRecordId,
        overallStatus: authenticity.overallStatus,
      }),
    );

    return {
      engineRunId: run.id,
      trainingRecordId,
      overallStatus: authenticity.overallStatus,
      authenticityStatus: authenticity.overallStatus,
      regulatoryStatus,
      standardsOutcome: standardsReport.outcome,
      jurisdictionCode: standardsReport.jurisdictionCode,
      verifiedAt: authenticity.verifiedAt,
      completedAt: refreshed?.completedAt?.toISOString() ?? null,
      checks: {
        authenticity: authenticity.checks,
        standards: standardsReport,
      },
      propagation,
      worker: {
        id: record.worker.id,
        firstName: record.worker.firstName,
        lastName: record.worker.lastName,
        companyId: record.worker.companyId,
      },
      certification: {
        id: record.certification.id,
        name: record.certification.name,
        code: record.certification.code,
      },
    };
  }

  async getVerifiedRecord(
    trainingRecordId: number,
  ): Promise<VerifiedTrainingRecord | null> {
    const run = await verificationRunDelegate(this.prisma).findFirst({
      where: { trainingRecordId },
      orderBy: { createdAt: 'desc' },
      include: {
        trainingRecord: {
          include: {
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyId: true,
              },
            },
            certification: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });
    if (!run?.trainingRecord?.worker) return null;

    const checks =
      run.checks != null && typeof run.checks === 'object'
        ? (run.checks as Record<string, unknown>)
        : {};
    const propagation =
      run.propagation != null && typeof run.propagation === 'object'
        ? (run.propagation as VerifiedTrainingPropagation)
        : {
            wallet: { synced: false, workerId: run.trainingRecord.workerId },
            company: {
              refreshed: false,
              companyId: run.trainingRecord.companyId,
            },
            project: {
              projectId: run.trainingRecord.projectId,
              companyId: run.trainingRecord.companyId,
            },
            unionHall: { receiptsEnsured: false },
            credentialNft: {
              scheduled: false,
              mintStatus: null,
              nftTokenId: null,
            },
            notifications: { supervisorsNotified: false },
          };

    return {
      engineRunId: run.id,
      trainingRecordId: run.trainingRecordId,
      overallStatus:
        run.overallStatus as VerifiedTrainingRecord['overallStatus'],
      authenticityStatus:
        run.authenticityStatus as VerifiedTrainingRecord['authenticityStatus'],
      regulatoryStatus: run.regulatoryStatus,
      standardsOutcome: run.standardsOutcome,
      jurisdictionCode: run.jurisdictionCode,
      verifiedAt:
        run.trainingRecord.verifiedAt?.toISOString() ??
        run.createdAt.toISOString(),
      completedAt: run.trainingRecord.completedAt?.toISOString() ?? null,
      checks,
      propagation,
      worker: {
        id: run.trainingRecord.worker.id,
        firstName: run.trainingRecord.worker.firstName,
        lastName: run.trainingRecord.worker.lastName,
        companyId: run.trainingRecord.worker.companyId,
      },
      certification: {
        id: run.trainingRecord.certification.id,
        name: run.trainingRecord.certification.name,
        code: run.trainingRecord.certification.code,
      },
    };
  }

  async listVerificationRuns(trainingRecordId: number, limit = 20) {
    return verificationRunDelegate(this.prisma).findMany({
      where: { trainingRecordId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async propagateVerifiedRecord(
    trainingRecordId: number,
    workerCompanyId: number | null,
    actorId?: number,
  ): Promise<VerifiedTrainingPropagation> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      select: {
        workerId: true,
        companyId: true,
        projectId: true,
      },
    });
    if (!record) {
      throw new NotFoundException('Training record not found');
    }

    const propagation: VerifiedTrainingPropagation = {
      wallet: { synced: false, workerId: record.workerId },
      company: {
        refreshed: false,
        companyId: record.companyId ?? workerCompanyId,
      },
      project: { projectId: record.projectId, companyId: record.companyId },
      unionHall: { receiptsEnsured: false },
      credentialNft: { scheduled: false, mintStatus: null, nftTokenId: null },
      notifications: { supervisorsNotified: false },
    };

    try {
      await this.walletIntegration.syncAfterTrainingRecord(trainingRecordId);
      propagation.wallet.synced = true;
      this.events.emit({
        name: DomainEvent.WALLET_SYNCED,
        occurredAt: new Date().toISOString(),
        companyId: record.companyId ?? workerCompanyId ?? undefined,
        projectId: record.projectId ?? undefined,
        entityType: 'training_record',
        entityId: trainingRecordId,
        actorId,
        data: { workerId: record.workerId },
      });
      this.events.emit(
        walletUpdatedEvent({
          workerId: record.workerId,
          companyId: record.companyId ?? workerCompanyId ?? undefined,
          reason: 'training_verification',
          trainingRecordId,
        }),
      );
    } catch (e) {
      propagation.wallet.error =
        e instanceof Error ? e.message : 'Wallet sync failed';
      this.logger.warn(`Wallet sync failed: ${propagation.wallet.error}`);
    }

    propagation.company.refreshed = propagation.wallet.synced;
    propagation.unionHall.receiptsEnsured = propagation.wallet.synced;

    try {
      await this.nftCoordinator.scheduleMintIfEligible(trainingRecordId);
      propagation.credentialNft.scheduled = true;
      const nft = await this.prisma.trainingCredentialNft.findUnique({
        where: { trainingRecordId },
        select: { mintStatus: true, nftTokenId: true },
      });
      propagation.credentialNft.mintStatus = nft?.mintStatus ?? 'PENDING_MINT';
      propagation.credentialNft.nftTokenId = nft?.nftTokenId ?? null;
      if (nft?.mintStatus === 'MINTED') {
        this.events.emit({
          name: DomainEvent.TRAINING_CREDENTIAL_MINTED,
          occurredAt: new Date().toISOString(),
          companyId: record.companyId ?? workerCompanyId ?? undefined,
          entityType: 'training_credential_nft',
          entityId: trainingRecordId,
          data: { nftTokenId: nft.nftTokenId },
        });
      }
    } catch (e) {
      propagation.credentialNft.error =
        e instanceof Error ? e.message : 'NFT schedule failed';
      this.logger.warn(
        `NFT schedule failed: ${propagation.credentialNft.error}`,
      );
    }

    const companyId = record.companyId ?? workerCompanyId;
    if (companyId) {
      this.events.emit({
        name: DomainEvent.COMPLIANCE_RECALC,
        occurredAt: new Date().toISOString(),
        companyId,
        projectId: record.projectId ?? undefined,
        entityType: 'company',
        entityId: companyId,
        data: { reason: 'training_verification_engine', trainingRecordId },
      });
    }

    return propagation;
  }

  private async readPropagationStatus(
    trainingRecordId: number,
    workerCompanyId: number | null,
  ): Promise<VerifiedTrainingPropagation> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: trainingRecordId },
      select: {
        workerId: true,
        companyId: true,
        projectId: true,
        walletItem: { select: { id: true } },
        credentialNft: { select: { mintStatus: true, nftTokenId: true } },
        unionHallReceipts: { select: { id: true }, take: 1 },
      },
    });

    return {
      wallet: {
        synced: Boolean(record?.walletItem),
        workerId: record?.workerId ?? null,
      },
      company: {
        refreshed: Boolean(record?.walletItem),
        companyId: record?.companyId ?? workerCompanyId,
      },
      project: {
        projectId: record?.projectId ?? null,
        companyId: record?.companyId ?? null,
      },
      unionHall: {
        receiptsEnsured: (record?.unionHallReceipts?.length ?? 0) > 0,
      },
      credentialNft: {
        scheduled: Boolean(record?.credentialNft),
        mintStatus: record?.credentialNft?.mintStatus ?? null,
        nftTokenId: record?.credentialNft?.nftTokenId ?? null,
      },
      notifications: { supervisorsNotified: false },
    };
  }

  private async propagatePartialRecord(
    trainingRecordId: number,
    workerCompanyId: number | null,
    overallStatus: string,
    summary: string,
    actorId?: number,
  ): Promise<VerifiedTrainingPropagation> {
    const companyId = workerCompanyId;
    let supervisorsNotified = false;

    if (companyId && this.notifications) {
      await this.notifications.notifyCompanySupervisors(companyId, {
        type: NOTIFICATION_TYPES.TRAINING_VERIFICATION_ATTENTION,
        title: 'Training verification needs review',
        body: `Record #${trainingRecordId} — ${overallStatus}. ${summary}`,
        payload: { trainingRecordId, overallStatus },
        dedupeKey: `tve-attention:${trainingRecordId}:${overallStatus}`,
        companyId,
      });
      supervisorsNotified = true;
    }

    this.events.emit({
      name: DomainEvent.TRAINING_VERIFICATION_ATTENTION,
      occurredAt: new Date().toISOString(),
      companyId: companyId ?? undefined,
      entityType: 'training_record',
      entityId: trainingRecordId,
      actorId,
      data: { overallStatus, summary },
    });

    return {
      wallet: { synced: false, workerId: null },
      company: { refreshed: false, companyId },
      project: { projectId: null, companyId },
      unionHall: { receiptsEnsured: false },
      credentialNft: { scheduled: false, mintStatus: null, nftTokenId: null },
      notifications: { supervisorsNotified },
    };
  }
}
