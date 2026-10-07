import { Injectable, Logger } from '@nestjs/common';
import {
  CredentialLedgerActorType,
  CredentialLedgerEventType,
  TrainingValidationOutcome,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CredentialLedgerService } from './credential-ledger.service';

export type LedgerBackfillResult = {
  dryRun: boolean;
  scanned: number;
  recordsBackfilled: number;
  recordsSkipped: number;
  eventsCreated: number;
  errors: Array<{ credentialId: number; message: string }>;
};

@Injectable()
export class CredentialLedgerBackfillService {
  private readonly logger = new Logger(CredentialLedgerBackfillService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: CredentialLedgerService,
  ) {}

  /**
   * Reconstruct ledger events for training records that have no ledger history.
   * Idempotent per record: skips credentials that already have CREATED or IMPORTED.
   */
  async backfill(options?: {
    companyId?: number;
    limit?: number;
    dryRun?: boolean;
  }): Promise<LedgerBackfillResult> {
    const dryRun = options?.dryRun ?? false;
    const limit = options?.limit ?? 500;
    const result: LedgerBackfillResult = {
      dryRun,
      scanned: 0,
      recordsBackfilled: 0,
      recordsSkipped: 0,
      eventsCreated: 0,
      errors: [],
    };

    const records = await this.prisma.trainingRecord.findMany({
      where: options?.companyId ? { companyId: options.companyId } : undefined,
      include: {
        ledgerEvents: { select: { eventType: true } },
        validationResults: { orderBy: { validatedAt: 'asc' } },
      },
      orderBy: { id: 'asc' },
      take: limit,
    });

    for (const record of records) {
      result.scanned++;
      const existing = new Set(record.ledgerEvents.map((e) => e.eventType));
      if (
        existing.has(CredentialLedgerEventType.CREATED) ||
        existing.has(CredentialLedgerEventType.IMPORTED)
      ) {
        result.recordsSkipped++;
        continue;
      }

      const planned = this.planEventsForRecord(record, existing);
      if (planned.length === 0) {
        result.recordsSkipped++;
        continue;
      }

      if (dryRun) {
        result.recordsBackfilled++;
        result.eventsCreated += planned.length;
        continue;
      }

      try {
        for (const event of planned) {
          await this.ledger.append(event);
          result.eventsCreated++;
        }
        result.recordsBackfilled++;
      } catch (e) {
        result.errors.push({
          credentialId: record.id,
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }

    this.logger.log(
      JSON.stringify({ type: 'credential_ledger.backfill', ...result }),
    );
    return result;
  }

  private planEventsForRecord(
    record: {
      id: number;
      workerId: number;
      providerId: number | null;
      trainingProviderId: number | null;
      projectId: number | null;
      companyId: number | null;
      issuedAt: Date;
      expiresAt: Date | null;
      ingestionRunId: number | null;
      completedAt: Date | null;
      verifiedAt: Date | null;
      validationResults: Array<{
        id: number;
        outcome: TrainingValidationOutcome;
        validatedAt: Date;
        validatedBy: number | null;
      }>;
    },
    existing: Set<CredentialLedgerEventType>,
  ) {
    const base = {
      credentialId: record.id,
      workerId: record.workerId,
      providerId: record.providerId ?? record.trainingProviderId,
      projectId: record.projectId,
      companyId: record.companyId,
    };

    const events: Parameters<CredentialLedgerService['append']>[0][] = [];

    const originType = record.ingestionRunId
      ? CredentialLedgerEventType.IMPORTED
      : CredentialLedgerEventType.CREATED;
    events.push({
      ...base,
      eventType: originType,
      actorType: record.ingestionRunId
        ? CredentialLedgerActorType.SYSTEM
        : CredentialLedgerActorType.ADMIN,
      occurredAt: record.issuedAt,
      payload: {
        source: 'backfill',
        ingestionRunId: record.ingestionRunId,
      },
    });

    for (const v of record.validationResults) {
      if (
        v.outcome === TrainingValidationOutcome.APPROVED &&
        !existing.has(CredentialLedgerEventType.VERIFIED)
      ) {
        events.push({
          ...base,
          eventType: CredentialLedgerEventType.VERIFIED,
          actorId: v.validatedBy,
          actorType: CredentialLedgerActorType.SUPERVISOR,
          occurredAt: v.validatedAt,
          payload: {
            source: 'backfill',
            validationResultId: v.id,
          },
        });
      }
      if (
        v.outcome === TrainingValidationOutcome.REJECTED &&
        !existing.has(CredentialLedgerEventType.REVOKED)
      ) {
        events.push({
          ...base,
          eventType: CredentialLedgerEventType.REVOKED,
          actorId: v.validatedBy,
          actorType: CredentialLedgerActorType.SUPERVISOR,
          occurredAt: v.validatedAt,
          payload: {
            source: 'backfill',
            validationResultId: v.id,
          },
        });
      }
    }

    if (
      record.completedAt &&
      !existing.has(CredentialLedgerEventType.VERIFIED) &&
      !events.some((e) => e.eventType === CredentialLedgerEventType.VERIFIED)
    ) {
      events.push({
        ...base,
        eventType: CredentialLedgerEventType.VERIFIED,
        actorType: CredentialLedgerActorType.SYSTEM,
        occurredAt: record.completedAt,
        payload: { source: 'backfill', via: 'completedAt' },
      });
    }

    if (
      record.expiresAt &&
      record.expiresAt.getTime() < Date.now() &&
      !existing.has(CredentialLedgerEventType.EXPIRED)
    ) {
      events.push({
        ...base,
        eventType: CredentialLedgerEventType.EXPIRED,
        actorType: CredentialLedgerActorType.SYSTEM,
        occurredAt: record.expiresAt,
        payload: { source: 'backfill' },
      });
    }

    return events;
  }
}
