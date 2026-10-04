import { Injectable } from '@nestjs/common';
import { CredentialLedgerActorType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from './company-links.service';
import { TrainingWalletIntegrationService } from './training-wallet-integration.service';
import { CredentialLedgerService } from '../credential-ledger/credential-ledger.service';

export interface TrainingIngestInput {
  workerId?: number;
  workerEmail?: string;
  workerPhone?: string;
  equipmentId?: number;
  companyId?: number;
  projectId?: number;
  certificationId: number;
  providerId?: number;
  trainingProviderId?: number;
  courseId?: number;
  instructorId?: number;
  expiresAt?: Date;
  issuedAt?: Date;
  certificateNumber?: string;
  ingestionRunId?: number;
}

@Injectable()
export class TrainingPipelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyLinks: CompanyLinksService,
    private readonly walletIntegration: TrainingWalletIntegrationService,
    private readonly credentialLedger: CredentialLedgerService,
  ) {}

  async ingest(input: TrainingIngestInput) {
    const workerId = await this.resolveWorkerId(input);
    if (!workerId) {
      return { ok: false, error: 'WORKER_NOT_FOUND' };
    }

    if (input.companyId) {
      await this.companyLinks.linkWorker(workerId, input.companyId, {
        deactivateOtherCompanies: false,
      });
    }

    const record = await this.prisma.trainingRecord.create({
      data: {
        workerId,
        certificationId: input.certificationId,
        providerId: input.providerId,
        trainingProviderId: input.trainingProviderId,
        courseId: input.courseId,
        instructorId: input.instructorId,
        companyId: input.companyId,
        projectId: input.projectId,
        expiresAt: input.expiresAt,
        issuedAt: input.issuedAt ?? new Date(),
        certificateNumber: input.certificateNumber,
        ingestionRunId: input.ingestionRunId,
        completedAt: new Date(),
      },
      include: { certification: true },
    });

    const walletTraining = await this.walletIntegration.syncAfterTrainingRecord(
      record.id,
      input.equipmentId,
    );

    await this.credentialLedger.recordCredentialCreated({
      credentialId: record.id,
      workerId: record.workerId,
      providerId: record.providerId,
      trainingProviderId: record.trainingProviderId,
      projectId: record.projectId,
      companyId: record.companyId,
      actorType: input.trainingProviderId
        ? CredentialLedgerActorType.PROVIDER
        : CredentialLedgerActorType.SYSTEM,
      payload: {
        source: 'training_pipeline',
        ingestionRunId: input.ingestionRunId ?? null,
      },
    });

    return {
      ok: true,
      workerId,
      trainingRecord: record,
      walletTraining,
    };
  }

  private async resolveWorkerId(
    input: TrainingIngestInput,
  ): Promise<number | null> {
    if (input.workerId) return input.workerId;
    if (input.workerEmail) {
      const w = await this.prisma.worker.findFirst({
        where: { email: input.workerEmail.trim().toLowerCase() },
      });
      if (w) return w.id;
    }
    if (input.workerPhone) {
      const digits = input.workerPhone.replace(/\D/g, '');
      const w = await this.prisma.worker.findFirst({
        where: { phone: { contains: digits } },
      });
      if (w) return w.id;
    }
    return null;
  }
}
