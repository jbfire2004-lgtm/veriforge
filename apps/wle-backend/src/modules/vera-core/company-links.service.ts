import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { OrientationLinkingService } from '../orientation/orientation-linking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InactivationService } from './inactivation.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CompanyLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inactivation: InactivationService,
    @Optional() private readonly orientationLinking?: OrientationLinkingService,
  ) {}

  async listByCompany(companyId: number, activeOnly = true) {
    return this.prisma.companyLink.findMany({
      where: { companyId, ...(activeOnly ? { active: true } : {}) },
      include: { worker: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async linkWorker(
    workerId: number,
    companyId: number,
    opts?: {
      role?: string;
      trade?: string;
      deactivateOtherCompanies?: boolean;
    },
  ) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    if (opts?.deactivateOtherCompanies !== false) {
      const otherLinks = await this.prisma.companyLink.findMany({
        where: { workerId, active: true, companyId: { not: companyId } },
      });
      for (const link of otherLinks) {
        await this.inactivation.deactivateWorkerAtCompany(
          workerId,
          link.companyId,
          'NEW_COMPANY_LINK',
        );
      }
    }

    const existing = await this.prisma.companyLink.findFirst({
      where: { workerId, companyId, active: true },
    });
    if (existing) return existing;

    const link = await this.prisma.companyLink.create({
      data: {
        workerId,
        companyId,
        active: true,
        role: opts?.role,
        trade: opts?.trade,
      },
      include: { worker: true, company: true },
    });

    await this.prisma.worker.update({
      where: { id: workerId },
      data: { companyId },
    });

    if (!worker.qrToken) {
      await this.prisma.worker.update({
        where: { id: workerId },
        data: { qrToken: `w-${randomBytes(8).toString('hex')}` },
      });
    }

    if (this.orientationLinking) {
      void this.orientationLinking.onCompanyLinkCreated(workerId, companyId);
    }
    return link;
  }

  async linkByQrToken(qrToken: string, companyId: number, assignedBy?: number) {
    const worker = await this.prisma.worker.findFirst({
      where: {
        qrToken,
      },
    });
    if (!worker) throw new NotFoundException('Worker not found for QR');
    return this.linkWorker(worker.id, companyId);
  }

  async endAssignment(workerId: number, companyId: number) {
    return this.inactivation.deactivateWorkerAtCompany(
      workerId,
      companyId,
      'END_ASSIGNMENT',
    );
  }

  async activate(workerId: number, companyId: number) {
    const link = await this.prisma.companyLink.findFirst({
      where: { workerId, companyId },
      orderBy: { startDate: 'desc' },
    });
    if (!link) {
      return this.linkWorker(workerId, companyId);
    }
    return this.prisma.companyLink.update({
      where: { id: link.id },
      data: { active: true, endDate: null, startDate: new Date() },
      include: { worker: true, company: true },
    });
  }
}
