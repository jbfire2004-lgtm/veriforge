import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RegistryService {
  constructor(private readonly prisma: PrismaService) {}

  private token(prefix: string) {
    return `${prefix}-${randomBytes(8).toString('hex')}`;
  }

  async searchWorkers(query: {
    q?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
    limit?: number;
  }) {
    const limit = Math.min(query.limit ?? 25, 100);
    const where: Prisma.WorkerWhereInput = { AND: [] };
    const and = where.AND as Prisma.WorkerWhereInput[];

    if (query.phone) {
      and.push({
        phone: {
          contains: query.phone.replace(/\D/g, ''),
          mode: 'insensitive',
        },
      });
    }
    if (query.email) {
      and.push({
        email: {
          equals: query.email.trim().toLowerCase(),
          mode: 'insensitive',
        },
      });
    }
    if (query.dateOfBirth) {
      const dob = new Date(query.dateOfBirth);
      if (!Number.isNaN(dob.getTime())) {
        const next = new Date(dob);
        next.setDate(next.getDate() + 1);
        and.push({ dateOfBirth: { gte: dob, lt: next } });
      }
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q.replace(/\D/g, ''), mode: 'insensitive' } },
          { unionNumber: { contains: q, mode: 'insensitive' } },
        ],
      });
    }
    if (and.length === 0) delete where.AND;

    return this.prisma.worker.findMany({
      where,
      take: limit,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: {
        companyLinks: { where: { active: true }, include: { company: true } },
      },
    });
  }

  async findDuplicateWorkers(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const or: Prisma.WorkerWhereInput[] = [];
    if (worker.email) or.push({ email: worker.email });
    if (worker.phone) or.push({ phone: worker.phone });
    if (worker.dateOfBirth) {
      or.push({
        dateOfBirth: worker.dateOfBirth,
        firstName: { equals: worker.firstName, mode: 'insensitive' },
        lastName: { equals: worker.lastName, mode: 'insensitive' },
      });
    }
    if (or.length === 0) {
      or.push({
        firstName: { equals: worker.firstName, mode: 'insensitive' },
        lastName: { equals: worker.lastName, mode: 'insensitive' },
      });
    }

    return this.prisma.worker.findMany({
      where: { id: { not: workerId }, OR: or },
      take: 20,
    });
  }

  async mergeWorkers(
    survivorId: number,
    mergedId: number,
    mergedByUserId?: number,
    reason?: string,
  ) {
    if (survivorId === mergedId) {
      throw new BadRequestException('Cannot merge worker with itself');
    }
    const [survivor, merged] = await Promise.all([
      this.prisma.worker.findUnique({ where: { id: survivorId } }),
      this.prisma.worker.findUnique({ where: { id: mergedId } }),
    ]);
    if (!survivor || !merged) throw new NotFoundException('Worker not found');

    await this.prisma.$transaction(async (tx) => {
      await tx.trainingRecord.updateMany({
        where: { workerId: mergedId },
        data: { workerId: survivorId },
      });
      await tx.credential.updateMany({
        where: { workerId: mergedId },
        data: { workerId: survivorId },
      });
      await tx.companyLink.updateMany({
        where: { workerId: mergedId },
        data: { workerId: survivorId },
      });
      await tx.projectAssignment.updateMany({
        where: { workerId: mergedId },
        data: { workerId: survivorId },
      });
      await tx.unionMembership.updateMany({
        where: { workerId: mergedId },
        data: { workerId: survivorId },
      });
      await tx.worker.update({
        where: { id: survivorId },
        data: {
          email: survivor.email ?? merged.email,
          phone: survivor.phone ?? merged.phone,
          dateOfBirth: survivor.dateOfBirth ?? merged.dateOfBirth,
          unionNumber: survivor.unionNumber ?? merged.unionNumber,
          photoUrl: survivor.photoUrl ?? merged.photoUrl,
        },
      });
      await tx.workerMergeRecord.create({
        data: {
          survivorWorkerId: survivorId,
          mergedWorkerId: mergedId,
          mergedByUserId: mergedByUserId ?? null,
          reason: reason ?? null,
        },
      });
      await tx.worker.delete({ where: { id: mergedId } });
    });

    return this.getWorkerProfile(survivorId);
  }

  async getWorkerProfile(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        companyLinks: {
          orderBy: { startDate: 'desc' },
          include: { company: true },
        },
        unionMemberships: { include: { unionHall: true } },
        trainingRecords: {
          include: { certification: true },
          orderBy: { issuedAt: 'desc' },
        },
        competencyEvaluations: {
          include: { equipment: true },
          orderBy: { createdAt: 'desc' },
        },
        projectAssignments: {
          include: { project: true },
          orderBy: { assignedAt: 'desc' },
        },
        workerWalletItems: true,
      },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  async searchEquipment(query: {
    q?: string;
    serial?: string;
    assetTag?: string;
    qr?: string;
    limit?: number;
  }) {
    const limit = Math.min(query.limit ?? 25, 100);
    const where: Prisma.EquipmentWhereInput = { AND: [] };
    const and = where.AND as Prisma.EquipmentWhereInput[];

    if (query.serial)
      and.push({
        serialNumber: { contains: query.serial, mode: 'insensitive' },
      });
    if (query.assetTag)
      and.push({ assetTag: { contains: query.assetTag, mode: 'insensitive' } });
    if (query.qr) {
      and.push({
        OR: [
          { qrToken: query.qr },
          { id: Number.isFinite(Number(query.qr)) ? Number(query.qr) : -1 },
        ],
      });
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { serialNumber: { contains: q, mode: 'insensitive' } },
          { assetTag: { contains: q, mode: 'insensitive' } },
        ],
      });
    }
    if (and.length === 0) delete where.AND;

    return this.prisma.equipment.findMany({
      where,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        equipmentLinks: { where: { active: true }, include: { company: true } },
      },
    });
  }

  async mergeEquipment(
    survivorId: number,
    mergedId: number,
    mergedByUserId?: number,
    reason?: string,
  ) {
    if (survivorId === mergedId) {
      throw new BadRequestException('Cannot merge equipment with itself');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.inspection.updateMany({
        where: { equipmentId: mergedId },
        data: { equipmentId: survivorId },
      });
      await tx.equipmentLink.updateMany({
        where: { equipmentId: mergedId },
        data: { equipmentId: survivorId },
      });
      await tx.equipmentProjectAssignment.updateMany({
        where: { equipmentId: mergedId },
        data: { equipmentId: survivorId },
      });
      await tx.equipmentMergeRecord.create({
        data: {
          survivorEquipmentId: survivorId,
          mergedEquipmentId: mergedId,
          mergedByUserId: mergedByUserId ?? null,
          reason: reason ?? null,
        },
      });
      await tx.equipment.delete({ where: { id: mergedId } });
    });
    return this.getEquipmentProfile(survivorId);
  }

  async getEquipmentProfile(equipmentId: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        equipmentLinks: {
          orderBy: { startDate: 'desc' },
          include: {
            company: true,
            assignedWorkers: { include: { worker: true } },
          },
        },
        inspections: { orderBy: { createdAt: 'desc' }, take: 50 },
        trainingRequirements: { include: { certification: true } },
        competencyRequirements: { include: { certification: true } },
        projectAssignments: {
          include: { project: true },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');
    return equipment;
  }

  async ensureWorkerQrToken(workerId: number) {
    const w = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!w) throw new NotFoundException('Worker not found');
    if (w.qrToken) return w.qrToken;
    const qrToken = this.token('w');
    await this.prisma.worker.update({
      where: { id: workerId },
      data: { qrToken },
    });
    return qrToken;
  }

  async ensureEquipmentQrToken(equipmentId: number) {
    const e = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!e) throw new NotFoundException('Equipment not found');
    if (e.qrToken) return e.qrToken;
    const qrToken = this.token('e');
    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: { qrToken },
    });
    return qrToken;
  }
}
