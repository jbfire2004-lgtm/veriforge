import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../../audit/audit-actions';
import { resolvePublicBaseUrl } from '../../../config/public-base-url';

@Injectable()
export class OrientationDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async assign(input: {
    workerId: number;
    orientationId: string;
    companyId: number;
    assignedById: number;
  }) {
    const orientation = await this.prisma.orientationDefinition.findUnique({
      where: { id: input.orientationId },
    });
    if (!orientation) {
      throw new NotFoundException('Orientation definition not found');
    }
    if (orientation.companyId !== input.companyId) {
      throw new BadRequestException(
        'orientationId does not belong to companyId',
      );
    }
    if (!orientation.isPublished) {
      throw new BadRequestException(
        'Only published orientations can be assigned for delivery',
      );
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: input.workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const publicBase = resolvePublicBaseUrl();
    const deepLink = `${publicBase}/onboarding/orientation/${orientation.id}?workerId=${worker.id}`;

    const walletPayload = {
      cardType: 'orientation',
      title: orientation.title,
      orientationId: orientation.id,
      version: orientation.version,
      workerId: worker.id,
      companyId: input.companyId,
      deepLink,
      status: 'assigned',
      issuedAt: new Date().toISOString(),
    };

    const row = await this.prisma.orientationDeliveryLink.upsert({
      where: {
        workerId_orientationId: {
          workerId: input.workerId,
          orientationId: input.orientationId,
        },
      },
      create: {
        workerId: input.workerId,
        orientationId: input.orientationId,
        companyId: input.companyId,
        deepLink,
        walletPayload: walletPayload as Prisma.InputJsonValue,
        assignedById: input.assignedById,
      },
      update: {
        deepLink,
        walletPayload: walletPayload as Prisma.InputJsonValue,
        assignedById: input.assignedById,
      },
    });

    await this.auditLog.logAudit(
      { id: input.assignedById, companyId: input.companyId },
      AuditAction.ORIENTATION_DELIVERY_ASSIGNED,
      {
        type: AuditEntityType.ORIENTATION_DELIVERY,
        id: row.id,
        tenantId: input.companyId,
      },
      { workerId: input.workerId, orientationId: input.orientationId },
    );

    return {
      deliveryId: row.id,
      deepLink: row.deepLink,
      walletCard: walletPayload,
      orientation: {
        id: orientation.id,
        title: orientation.title,
        version: orientation.version,
      },
    };
  }

  async listLinks(workerId: number) {
    const rows = await this.prisma.orientationDeliveryLink.findMany({
      where: { workerId },
      include: {
        orientation: {
          select: { id: true, title: true, version: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      workerId,
      appDeepLinks: rows.map((r) => ({
        orientationId: r.orientationId,
        title: r.orientation.title,
        deepLink: r.deepLink,
        assignedAt: r.createdAt,
      })),
      walletCards: rows.map((r) => r.walletPayload),
    };
  }
}
