import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteAccessService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // CHECK ACCESS
  // ---------------------------------------------------------
  async checkAccess(workerId: number, siteId: number) {
    const access = await this.prisma.workerSiteAccess.findFirst({
      where: { workerId, siteId },
    });

    if (!access) {
      return {
        workerId,
        siteId,
        approved: false,
        reason: 'No site access record found',
      };
    }

    return {
      workerId,
      siteId,
      approved: access.approved,
      reason: access.notes ?? null,
    };
  }

  // ---------------------------------------------------------
  // APPROVE ACCESS
  // ---------------------------------------------------------
  async approve(workerId: number, siteId: number, notes?: string) {
    return this.prisma.workerSiteAccess.upsert({
      where: {
        workerId_siteId: { workerId, siteId },
      },
      update: {
        approved: true,
        notes: notes ?? null,
      },
      create: {
        workerId,
        siteId,
        approved: true,
        notes: notes ?? null,
      },
    });
  }

  // ---------------------------------------------------------
  // DENY ACCESS
  // ---------------------------------------------------------
  async deny(workerId: number, siteId: number, notes?: string) {
    return this.prisma.workerSiteAccess.upsert({
      where: {
        workerId_siteId: { workerId, siteId },
      },
      update: {
        approved: false,
        notes: notes ?? null,
      },
      create: {
        workerId,
        siteId,
        approved: false,
        notes: notes ?? null,
      },
    });
  }

  // ---------------------------------------------------------
  // LIST ACCESS FOR WORKER
  // ---------------------------------------------------------
  async listForWorker(workerId: number) {
    return this.prisma.workerSiteAccess.findMany({
      where: { workerId },
      include: { site: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // LIST ACCESS FOR SITE
  // ---------------------------------------------------------
  async listForSite(siteId: number) {
    return this.prisma.workerSiteAccess.findMany({
      where: { siteId },
      include: { worker: true },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
