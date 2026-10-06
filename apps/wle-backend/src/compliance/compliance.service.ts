import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // WORKER COMPLIANCE
  // ---------------------------------------------------------
  async workerCompliance(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        trainingRecords: true,
        credentials: true,
        incidents: true,
      },
    });

    if (!worker) throw new NotFoundException('Worker not found');

    const now = new Date();

    const expiredTraining = worker.trainingRecords.filter(
      (t) => t.expiresAt && t.expiresAt <= now,
    ).length;

    const expiredCredentials = worker.credentials.filter(
      (c) => c.expiresAt && c.expiresAt <= now,
    ).length;

    const recentIncidents = worker.incidents.filter((i) => {
      const since = new Date();
      since.setDate(since.getDate() - 90);
      return i.createdAt >= since;
    }).length;

    let score = 100;
    score -= expiredTraining * 10;
    score -= expiredCredentials * 10;
    score -= recentIncidents * 5;
    if (score < 0) score = 0;

    return {
      workerId,
      score,
      breakdown: {
        expiredTraining,
        expiredCredentials,
        recentIncidents,
      },
    };
  }

  // ---------------------------------------------------------
  // COMPANY COMPLIANCE
  // ---------------------------------------------------------
  async companyCompliance(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        workers: {
          include: {
            trainingRecords: true,
            credentials: true,
            incidents: true,
          },
        },
        equipment: {
          include: {
            incidents: true,
          },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    const now = new Date();

    const totalWorkers = company.workers.length;
    const totalEquipment = company.equipment.length;

    let expiredTraining = 0;
    let expiredCredentials = 0;
    let workerIncidents = 0;
    let equipmentIncidents = 0;

    const since = new Date();
    since.setDate(since.getDate() - 90);

    for (const w of company.workers) {
      expiredTraining += w.trainingRecords.filter(
        (t) => t.expiresAt && t.expiresAt <= now,
      ).length;

      expiredCredentials += w.credentials.filter(
        (c) => c.expiresAt && c.expiresAt <= now,
      ).length;

      workerIncidents += w.incidents.filter((i) => i.createdAt >= since).length;
    }

    for (const e of company.equipment) {
      equipmentIncidents += e.incidents.filter(
        (i) => i.createdAt >= since,
      ).length;
    }

    let score = 100;
    score -= expiredTraining * 2;
    score -= expiredCredentials * 2;
    score -= workerIncidents * 1;
    score -= equipmentIncidents * 1;
    if (score < 0) score = 0;

    return {
      companyId,
      score,
      breakdown: {
        totalWorkers,
        totalEquipment,
        expiredTraining,
        expiredCredentials,
        workerIncidents,
        equipmentIncidents,
      },
    };
  }

  // ---------------------------------------------------------
  // SITE COMPLIANCE
  // ---------------------------------------------------------
  async siteCompliance(siteId: number) {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      include: {
        workerSiteAccess: {
          include: { worker: { include: { trainingRecords: true } } },
        },
        digitalSignoff: true,
      },
    });

    if (!site) throw new NotFoundException('Site not found');

    const now = new Date();

    const workersOnSite = site.workerSiteAccess.length;
    let expiredTrainingOnSite = 0;

    for (const access of site.workerSiteAccess) {
      expiredTrainingOnSite += access.worker.trainingRecords.filter(
        (t) => t.expiresAt && t.expiresAt <= now,
      ).length;
    }

    const recentSignoffs = site.digitalSignoff.length;

    let score = 100;
    score -= expiredTrainingOnSite * 3;
    score += recentSignoffs * 1;
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    return {
      siteId,
      score,
      breakdown: {
        workersOnSite,
        expiredTrainingOnSite,
        recentSignoffs,
      },
    };
  }
}
