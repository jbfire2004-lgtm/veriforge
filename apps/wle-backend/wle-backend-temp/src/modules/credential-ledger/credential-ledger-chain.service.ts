import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CredentialLedgerEventType,
  TrainingValidationOutcome,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CredentialLedgerService } from './credential-ledger.service';
import type {
  CredentialLifecycleStatus,
  VerificationChainResponse,
} from './credential-ledger.types';

@Injectable()
export class CredentialLedgerChainService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: CredentialLedgerService,
  ) {}

  async resolveVerificationChain(
    credentialId: number,
  ): Promise<VerificationChainResponse> {
    const record = await this.prisma.trainingRecord.findUnique({
      where: { id: credentialId },
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        provider: { select: { id: true, name: true } },
        trainingProvider: { select: { id: true, name: true } },
        certification: { select: { id: true, name: true, code: true } },
        validationResults: {
          orderBy: { validatedAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!record) {
      throw new NotFoundException('Credential not found');
    }

    const events = await this.ledger.listByCredential(credentialId);
    const latestValidation = record.validationResults[0]?.outcome ?? null;
    const status = this.resolveStatus(record, events, latestValidation);

    return {
      credentialId: record.id,
      status,
      worker: record.worker,
      provider: record.provider,
      trainingProvider: record.trainingProvider,
      certification: record.certification,
      issuedAt: record.issuedAt?.toISOString() ?? null,
      expiresAt: record.expiresAt?.toISOString() ?? null,
      certificateNumber: record.certificateNumber,
      latestValidationOutcome: latestValidation,
      events,
    };
  }

  resolveStatus(
    record: {
      expiresAt: Date | null;
      lastVerificationStatus: string | null;
    },
    events: Array<{ eventType: CredentialLedgerEventType }>,
    latestValidation: TrainingValidationOutcome | null,
  ): CredentialLifecycleStatus {
    const hasRevoked = events.some(
      (e) => e.eventType === CredentialLedgerEventType.REVOKED,
    );
    if (hasRevoked || latestValidation === TrainingValidationOutcome.REJECTED) {
      return 'revoked';
    }
    if (latestValidation === TrainingValidationOutcome.NEEDS_REVIEW) {
      return 'needs_review';
    }
    if (latestValidation === TrainingValidationOutcome.PENDING) {
      return 'pending';
    }
    const expiredByDate =
      record.expiresAt != null && record.expiresAt.getTime() < Date.now();
    const hasExpiredEvent = events.some(
      (e) => e.eventType === CredentialLedgerEventType.EXPIRED,
    );
    if (expiredByDate || hasExpiredEvent) {
      return 'expired';
    }
    if (record.lastVerificationStatus === 'INVALID') {
      return 'revoked';
    }
    return 'valid';
  }
}
