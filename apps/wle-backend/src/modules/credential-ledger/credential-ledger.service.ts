import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import {
  CredentialLedgerActorType,
  CredentialLedgerEventType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CredentialLedgerEventView,
  LedgerAppendInput,
  RecordCredentialContext,
} from './credential-ledger.types';

@Injectable()
export class CredentialLedgerService {
  private readonly logger = new Logger(CredentialLedgerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Append-only write — the only way ledger rows are created. */
  async append(input: LedgerAppendInput): Promise<CredentialLedgerEventView> {
    const row = await this.prisma.credentialLedgerEvent.create({
      data: {
        eventType: input.eventType,
        credentialId: input.credentialId,
        actorId: input.actorId ?? null,
        actorType: input.actorType ?? CredentialLedgerActorType.SYSTEM,
        workerId: input.workerId ?? null,
        providerId: input.providerId ?? null,
        projectId: input.projectId ?? null,
        companyId: input.companyId ?? null,
        correlationId: input.correlationId ?? null,
        payload: (input.payload ?? {}) as object,
        ...(input.occurredAt ? { occurredAt: input.occurredAt } : {}),
      },
    });

    this.logger.log(
      JSON.stringify({
        type: 'credential_ledger.append',
        eventId: row.id,
        eventType: row.eventType,
        credentialId: row.credentialId,
        correlationId: row.correlationId,
      }),
    );

    return this.toView(row);
  }

  async recordCredentialCreated(ctx: RecordCredentialContext) {
    return this.append({
      eventType: CredentialLedgerEventType.CREATED,
      credentialId: ctx.credentialId,
      actorId: ctx.actorId,
      actorType: ctx.actorType ?? CredentialLedgerActorType.SYSTEM,
      workerId: ctx.workerId,
      providerId: ctx.providerId ?? ctx.trainingProviderId,
      projectId: ctx.projectId,
      companyId: ctx.companyId,
      correlationId: ctx.correlationId,
      payload: { source: 'create', ...ctx.payload },
    });
  }

  async recordCredentialImported(ctx: RecordCredentialContext) {
    return this.append({
      eventType: CredentialLedgerEventType.IMPORTED,
      credentialId: ctx.credentialId,
      actorId: ctx.actorId,
      actorType: ctx.actorType ?? CredentialLedgerActorType.SYSTEM,
      workerId: ctx.workerId,
      providerId: ctx.providerId ?? ctx.trainingProviderId,
      projectId: ctx.projectId,
      companyId: ctx.companyId,
      correlationId: ctx.correlationId,
      payload: { source: 'import', ...ctx.payload },
    });
  }

  async recordCredentialUpdated(ctx: RecordCredentialContext) {
    return this.append({
      eventType: CredentialLedgerEventType.UPDATED,
      credentialId: ctx.credentialId,
      actorId: ctx.actorId,
      actorType: ctx.actorType ?? CredentialLedgerActorType.ADMIN,
      workerId: ctx.workerId,
      providerId: ctx.providerId ?? ctx.trainingProviderId,
      projectId: ctx.projectId,
      companyId: ctx.companyId,
      correlationId: ctx.correlationId,
      payload: ctx.payload,
    });
  }

  async recordCredentialCorrected(ctx: RecordCredentialContext) {
    return this.append({
      eventType: CredentialLedgerEventType.CORRECTED,
      credentialId: ctx.credentialId,
      actorId: ctx.actorId,
      actorType: ctx.actorType ?? CredentialLedgerActorType.SUPERVISOR,
      workerId: ctx.workerId,
      providerId: ctx.providerId ?? ctx.trainingProviderId,
      projectId: ctx.projectId,
      companyId: ctx.companyId,
      correlationId: ctx.correlationId,
      payload: ctx.payload,
    });
  }

  async recordCredentialVerified(ctx: RecordCredentialContext) {
    return this.append({
      eventType: CredentialLedgerEventType.VERIFIED,
      credentialId: ctx.credentialId,
      actorId: ctx.actorId,
      actorType: ctx.actorType ?? CredentialLedgerActorType.SUPERVISOR,
      workerId: ctx.workerId,
      providerId: ctx.providerId ?? ctx.trainingProviderId,
      projectId: ctx.projectId,
      companyId: ctx.companyId,
      correlationId: ctx.correlationId,
      payload: ctx.payload,
    });
  }

  async recordCredentialRevoked(ctx: RecordCredentialContext) {
    return this.append({
      eventType: CredentialLedgerEventType.REVOKED,
      credentialId: ctx.credentialId,
      actorId: ctx.actorId,
      actorType: ctx.actorType ?? CredentialLedgerActorType.SUPERVISOR,
      workerId: ctx.workerId,
      providerId: ctx.providerId ?? ctx.trainingProviderId,
      projectId: ctx.projectId,
      companyId: ctx.companyId,
      correlationId: ctx.correlationId,
      payload: ctx.payload,
    });
  }

  async recordCredentialExpired(ctx: RecordCredentialContext) {
    return this.append({
      eventType: CredentialLedgerEventType.EXPIRED,
      credentialId: ctx.credentialId,
      actorType: CredentialLedgerActorType.SYSTEM,
      workerId: ctx.workerId,
      providerId: ctx.providerId ?? ctx.trainingProviderId,
      projectId: ctx.projectId,
      companyId: ctx.companyId,
      correlationId: ctx.correlationId,
      payload: ctx.payload,
    });
  }

  async listByCredential(credentialId: number, limit = 100) {
    const rows = await this.prisma.credentialLedgerEvent.findMany({
      where: { credentialId },
      orderBy: { occurredAt: 'asc' },
      take: limit,
    });
    return rows.map((r) => this.toView(r));
  }

  /** Guard against accidental mutation — called from Prisma middleware. */
  assertImmutableOperation(model: string | undefined, action: string): void {
    if (model !== 'CredentialLedgerEvent') return;
    if (
      action === 'update' ||
      action === 'updateMany' ||
      action === 'delete' ||
      action === 'deleteMany' ||
      action === 'upsert'
    ) {
      throw new ForbiddenException(
        'CredentialLedgerEvent rows are immutable and cannot be modified',
      );
    }
  }

  private toView(row: {
    id: number;
    occurredAt: Date;
    actorId: number | null;
    actorType: CredentialLedgerActorType;
    eventType: CredentialLedgerEventType;
    credentialId: number;
    workerId: number | null;
    providerId: number | null;
    projectId: number | null;
    companyId: number | null;
    correlationId: string | null;
    payload: unknown;
  }): CredentialLedgerEventView {
    return {
      id: row.id,
      occurredAt: row.occurredAt.toISOString(),
      actorId: row.actorId,
      actorType: row.actorType,
      eventType: row.eventType,
      credentialId: row.credentialId,
      workerId: row.workerId,
      providerId: row.providerId,
      projectId: row.projectId,
      companyId: row.companyId,
      correlationId: row.correlationId,
      payload:
        row.payload != null && typeof row.payload === 'object'
          ? (row.payload as Record<string, unknown>)
          : {},
    };
  }
}
