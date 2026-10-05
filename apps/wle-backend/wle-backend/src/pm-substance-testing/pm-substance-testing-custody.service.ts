import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmCustodyPartyRole,
  PmSubstanceTestStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SUBSTANCE_TEST_NOTIFICATION_TEMPLATES } from './substance-testing-notification.templates';

const STATUS_AFTER_TRANSFER: Partial<
  Record<PmCustodyPartyRole, PmSubstanceTestStatus>
> = {
  collector: 'collected',
  courier: 'in_transit',
  lab_technician: 'at_lab',
  mro: 'pending_mro',
};

@Injectable()
export class PmSubstanceTestingCustodyService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  async listTransfers(testEventId: string) {
    return this.prisma.pmSubstanceTestCustodyTransfer.findMany({
      where: { testEventId },
      orderBy: { sequenceNumber: 'asc' },
      include: { signature: true },
    });
  }

  async recordTransfer(
    testEventId: string,
    data: {
      fromRole: PmCustodyPartyRole;
      toRole: PmCustodyPartyRole;
      fromPartyName?: string;
      toPartyName?: string;
      locationNote?: string;
      notes?: string;
      transferredAt?: string;
      signature?: {
        signerName: string;
        signerRole: PmCustodyPartyRole;
        signatureData: string;
        signedByUserId?: number;
        ipAddress?: string;
      };
    },
    actorId?: number,
  ) {
    const event = await this.prisma.pmSubstanceTestEvent.findFirst({
      where: { id: testEventId, deletedAt: null },
      include: { worker: { select: { firstName: true, lastName: true } } },
    });
    if (!event) throw new NotFoundException('Test event not found');
    if (!data.signature?.signatureData) {
      throw new BadRequestException(
        'Digital signature required for custody transfer',
      );
    }

    const lastSeq = await this.prisma.pmSubstanceTestCustodyTransfer.aggregate({
      where: { testEventId },
      _max: { sequenceNumber: true },
    });
    const sequenceNumber = (lastSeq._max.sequenceNumber ?? 0) + 1;

    const signature = await this.prisma.pmSubstanceTestSignature.create({
      data: {
        testEventId,
        signerName: data.signature.signerName,
        signerRole: data.signature.signerRole,
        signatureData: data.signature.signatureData,
        signedByUserId: data.signature.signedByUserId ?? actorId,
        ipAddress: data.signature.ipAddress,
        signedAt: data.transferredAt
          ? new Date(data.transferredAt)
          : new Date(),
      },
    });

    const transfer = await this.prisma.pmSubstanceTestCustodyTransfer.create({
      data: {
        testEventId,
        sequenceNumber,
        fromRole: data.fromRole,
        toRole: data.toRole,
        fromPartyName: data.fromPartyName,
        toPartyName: data.toPartyName,
        locationNote: data.locationNote,
        notes: data.notes,
        transferredAt: data.transferredAt
          ? new Date(data.transferredAt)
          : new Date(),
        signatureId: signature.id,
      },
      include: { signature: true },
    });

    const nextStatus = STATUS_AFTER_TRANSFER[data.toRole];
    if (nextStatus) {
      const updates: Prisma.PmSubstanceTestEventUpdateInput = {
        status: nextStatus,
      };
      if (data.toRole === 'collector') {
        updates.collectedAt = transfer.transferredAt;
      }
      await this.prisma.pmSubstanceTestEvent.update({
        where: { id: testEventId },
        data: updates,
      });
    }

    if (this.notifications) {
      const workerName = `${event.worker.firstName} ${event.worker.lastName}`;
      const template = SUBSTANCE_TEST_NOTIFICATION_TEMPLATES.custodyTransfer({
        testEventId,
        workerName,
        testType: event.testType,
        fromRole: data.fromRole,
        toRole: data.toRole,
      });
      const safetyUsers = await this.prisma.user.findMany({
        where: {
          companyId: event.companyId,
          role: { in: ['SUPERVISOR', 'COMPANY_ADMIN', 'PROJECT_MANAGER'] },
        },
        select: { id: true },
        take: 15,
      });
      if (safetyUsers.length) {
        await this.notifications.notifyUsers({
          userIds: safetyUsers.map((u) => u.id),
          type: template.type,
          title: template.title,
          body: template.body,
          payload: template.metadata as Record<string, unknown>,
          dedupeKey: `substance-custody:${transfer.id}`,
          companyId: event.companyId,
        });
      }
    }

    return transfer;
  }

  async addAttachment(
    testEventId: string,
    data: {
      documentType?: string;
      fileName?: string;
      mimeType?: string;
      storageKey?: string;
      dataUrl?: string;
      custodyTransferId?: string;
      clientSyncId?: string;
    },
    uploadedByUserId?: number,
  ) {
    await this.ensureEvent(testEventId);
    return this.prisma.pmSubstanceTestAttachment.create({
      data: {
        testEventId,
        custodyTransferId: data.custodyTransferId,
        documentType: (data.documentType as never) ?? 'other',
        fileName: data.fileName,
        mimeType: data.mimeType,
        storageKey: data.storageKey,
        dataUrl: data.dataUrl,
        uploadedByUserId,
        clientSyncId: data.clientSyncId,
      },
    });
  }

  async listAttachments(testEventId: string) {
    return this.prisma.pmSubstanceTestAttachment.findMany({
      where: { testEventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listSignatures(testEventId: string) {
    return this.prisma.pmSubstanceTestSignature.findMany({
      where: { testEventId },
      orderBy: { signedAt: 'asc' },
    });
  }

  private async ensureEvent(testEventId: string) {
    const event = await this.prisma.pmSubstanceTestEvent.findFirst({
      where: { id: testEventId, deletedAt: null },
    });
    if (!event) throw new NotFoundException('Test event not found');
    return event;
  }
}
