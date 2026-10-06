import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPublicQrToken } from './public-token.util';

export type ResolvedWorkerRef = {
  workerId: number;
  qrToken: string | null;
  viaToken: boolean;
};

export type ResolvedEquipmentRef = {
  equipmentId: number;
  qrToken: string | null;
  viaToken: boolean;
};

/**
 * Resolves public verify/QR references.
 * Prefer unguessable `qrToken`; legacy numeric ids are supported but discouraged.
 */
@Injectable()
export class PublicTokenResolver {
  constructor(private readonly prisma: PrismaService) {}

  async resolveWorkerRef(ref: string): Promise<ResolvedWorkerRef> {
    const trimmed = ref.trim();
    if (!trimmed) throw new NotFoundException('Worker not found');

    if (isPublicQrToken(trimmed)) {
      const worker = await this.prisma.worker.findFirst({
        where: { qrToken: trimmed },
        select: { id: true, qrToken: true },
      });
      if (!worker) throw new NotFoundException('Worker not found');
      return {
        workerId: worker.id,
        qrToken: worker.qrToken,
        viaToken: true,
      };
    }

    const numeric = Number(trimmed);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      throw new NotFoundException('Worker not found');
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: numeric },
      select: { id: true, qrToken: true },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return {
      workerId: worker.id,
      qrToken: worker.qrToken,
      viaToken: false,
    };
  }

  async resolveEquipmentRef(ref: string): Promise<ResolvedEquipmentRef> {
    const trimmed = ref.trim();
    if (!trimmed) throw new NotFoundException('Equipment not found');

    if (isPublicQrToken(trimmed)) {
      const equipment = await this.prisma.equipment.findFirst({
        where: { qrToken: trimmed },
        select: { id: true, qrToken: true },
      });
      if (!equipment) throw new NotFoundException('Equipment not found');
      return {
        equipmentId: equipment.id,
        qrToken: equipment.qrToken,
        viaToken: true,
      };
    }

    const numeric = Number(trimmed);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      throw new NotFoundException('Equipment not found');
    }

    const equipment = await this.prisma.equipment.findUnique({
      where: { id: numeric },
      select: { id: true, qrToken: true },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');
    return {
      equipmentId: equipment.id,
      qrToken: equipment.qrToken,
      viaToken: false,
    };
  }

  async ensureWorkerToken(workerId: number): Promise<string> {
    const row = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: { qrToken: true },
    });
    if (!row) throw new NotFoundException('Worker not found');
    if (row.qrToken) return row.qrToken;
    const { randomUUID } = await import('crypto');
    const token = `w-${randomUUID()}`;
    await this.prisma.worker.update({
      where: { id: workerId },
      data: { qrToken: token },
    });
    return token;
  }

  async ensureEquipmentToken(equipmentId: number): Promise<string> {
    const row = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { qrToken: true },
    });
    if (!row) throw new NotFoundException('Equipment not found');
    if (row.qrToken) return row.qrToken;
    const { randomUUID } = await import('crypto');
    const token = `e-${randomUUID()}`;
    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: { qrToken: token },
    });
    return token;
  }
}
