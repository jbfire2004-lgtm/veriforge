import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // CERTIFICATIONS
  // ---------------------------------------------------------
  async listCertifications() {
    return this.prisma.certification.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCertification(data: {
    name: string;
    code: string;
    description?: string;
  }) {
    return this.prisma.certification.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description ?? null,
      },
    });
  }

  // ---------------------------------------------------------
  // TRAINING RECORDS
  // ---------------------------------------------------------
  async addRecord(data: {
    workerId: number;
    certificationId: number;
    issuedAt?: Date;
    expiresAt?: Date;
  }) {
    return this.prisma.trainingRecord.create({
      data: {
        workerId: data.workerId,
        certificationId: data.certificationId,
        issuedAt: data.issuedAt ?? new Date(),
        expiresAt: data.expiresAt ?? null,
      },
      include: {
        worker: true,
        certification: true,
      },
    });
  }

  async updateRecord(
    id: number,
    data: Partial<{
      issuedAt: Date;
      expiresAt: Date | null;
    }>,
  ) {
    const existing = await this.prisma.trainingRecord.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Training record not found');

    return this.prisma.trainingRecord.update({
      where: { id },
      data: {
        issuedAt: data.issuedAt ?? existing.issuedAt,
        expiresAt:
          data.expiresAt !== undefined ? data.expiresAt : existing.expiresAt,
      },
      include: {
        worker: true,
        certification: true,
      },
    });
  }

  async removeRecord(id: number) {
    const existing = await this.prisma.trainingRecord.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Training record not found');

    await this.prisma.trainingRecord.delete({ where: { id } });
    return { status: 'ok', deletedId: id };
  }

  // ---------------------------------------------------------
  // WORKER‑CENTRIC VIEWS
  // ---------------------------------------------------------
  async recordsForWorker(workerId: number) {
    return this.prisma.trainingRecord.findMany({
      where: { workerId },
      include: {
        certification: true,
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async summaryForWorker(workerId: number) {
    const records = await this.recordsForWorker(workerId);
    const now = new Date();

    const expired = records.filter(
      (r) => r.expiresAt && r.expiresAt <= now,
    ).length;

    const expiringSoon = records.filter(
      (r) =>
        r.expiresAt &&
        r.expiresAt > now &&
        r.expiresAt <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    ).length;

    return {
      workerId,
      total: records.length,
      expired,
      expiringSoon,
      records,
    };
  }

  // ---------------------------------------------------------
  // COMPANY‑LEVEL RISK VIEW
  // ---------------------------------------------------------
  /**
   * All training records with `isValid` (expiresAt in the future) for admin dashboards.
   */
  async listAllRecordsWithCompliance() {
    const now = new Date();
    const records = await this.prisma.trainingRecord.findMany({
      include: {
        worker: { include: { company: true } },
        certification: true,
      },
      orderBy: { id: 'asc' },
    });
    return records.map((r) => ({
      ...r,
      isValid: r.expiresAt != null && r.expiresAt > now,
    }));
  }

  async summaryForCompany(companyId: number) {
    const now = new Date();

    const total = await this.prisma.trainingRecord.count({
      where: { worker: { companyId } },
    });

    const expired = await this.prisma.trainingRecord.count({
      where: {
        worker: { companyId },
        expiresAt: { lte: now },
      },
    });

    const expiringSoon = await this.prisma.trainingRecord.count({
      where: {
        worker: { companyId },
        expiresAt: {
          gt: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      companyId,
      total,
      expired,
      expiringSoon,
    };
  }
}
