import { Injectable, Optional } from '@nestjs/common';
import { CredentialLedgerActorType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import { CredentialLedgerService } from '../modules/credential-ledger/credential-ledger.service';
import { CreateTrainingRecordDto } from './dto/create-training-record.dto';
import { UpdateTrainingRecordDto } from './dto/update-training-record.dto';

@Injectable()
export class TrainingRecordsService {
  constructor(
    private prisma: PrismaService,
    private readonly credentialLedger: CredentialLedgerService,
    @Optional() private readonly events?: EventBusService,
  ) {}

  async create(data: CreateTrainingRecordDto) {
    const certNum =
      data.certificateNumber != null && data.certificateNumber.trim() !== ''
        ? data.certificateNumber.trim()
        : undefined;
    const rec = await this.prisma.trainingRecord.create({
      data: {
        worker: { connect: { id: data.workerId } },
        certification: { connect: { id: data.certificationId } },
        issuedAt: new Date(data.issuedAt),
        expiresAt: new Date(data.expiresAt),
        ...(certNum != null ? { certificateNumber: certNum } : {}),
        ...(data.providerId != null && Number.isFinite(data.providerId)
          ? { provider: { connect: { id: data.providerId } } }
          : {}),
      },
      include: {
        worker: true,
        certification: true,
        provider: true,
      },
    });
    await this.credentialLedger.recordCredentialCreated({
      credentialId: rec.id,
      workerId: rec.workerId,
      providerId: rec.providerId,
      companyId: rec.companyId,
      actorType: CredentialLedgerActorType.ADMIN,
      payload: { source: 'training_records_api' },
    });
    return rec;
  }

  findAll() {
    return this.prisma.trainingRecord.findMany({
      include: {
        worker: true,
        certification: true,
        provider: true,
      },
    });
  }

  findByWorker(workerId: number) {
    return this.prisma.trainingRecord.findMany({
      where: { workerId },
      include: {
        worker: true,
        certification: true,
        provider: true,
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async findOne(id: number) {
    const now = new Date();
    const row = await this.prisma.trainingRecord.findUnique({
      where: { id },
      include: {
        worker: { include: { company: true } },
        certification: true,
        provider: true,
      },
    });
    if (!row) return null;
    return {
      ...row,
      company: row.worker?.company ?? null,
      isValid: row.expiresAt != null && row.expiresAt > now,
    };
  }

  async update(id: number, data: UpdateTrainingRecordDto, actorId?: number) {
    let certificateNumber: string | null | undefined = undefined;
    if (data.certificateNumber !== undefined) {
      certificateNumber =
        data.certificateNumber.trim() === ''
          ? null
          : data.certificateNumber.trim();
    }
    let providerId: number | null | undefined = undefined;
    if (data.providerId !== undefined) {
      providerId =
        data.providerId === null || !Number.isFinite(data.providerId)
          ? null
          : data.providerId;
    }
    const updated = await this.prisma.trainingRecord.update({
      where: { id },
      data: {
        workerId: data.workerId ?? undefined,
        certificationId: data.certificationId ?? undefined,
        issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        ...(certificateNumber !== undefined ? { certificateNumber } : {}),
        ...(providerId !== undefined ? { providerId } : {}),
      },
      include: {
        worker: true,
        certification: true,
        provider: true,
      },
    });
    await this.credentialLedger.recordCredentialUpdated({
      credentialId: updated.id,
      workerId: updated.workerId,
      providerId: updated.providerId,
      companyId: updated.companyId,
      actorId: actorId ?? null,
      actorType: CredentialLedgerActorType.ADMIN,
      payload: { fields: data },
    });
    return updated;
  }

  markComplete(id: number) {
    return this.prisma.trainingRecord
      .update({
        where: { id },
        data: {
          completedAt: new Date(),
        },
        include: {
          worker: true,
          certification: true,
          provider: true,
        },
      })
      .then(async (record) => {
        await this.credentialLedger.recordCredentialVerified({
          credentialId: id,
          workerId: record.workerId,
          providerId: record.providerId,
          companyId: record.companyId ?? record.worker.companyId,
          payload: {
            source: 'mark_complete',
            completedAt: record.completedAt?.toISOString(),
          },
        });
        this.events?.emit({
          name: DomainEvent.TRAINING_VALIDATED,
          occurredAt: new Date().toISOString(),
          entityType: 'training',
          entityId: id,
          companyId: record.companyId ?? record.worker.companyId ?? undefined,
          data: { completedAt: record.completedAt?.toISOString() },
        });
        return record;
      });
  }

  remove(id: number) {
    return this.prisma.trainingRecord.delete({
      where: { id },
    });
  }
}
