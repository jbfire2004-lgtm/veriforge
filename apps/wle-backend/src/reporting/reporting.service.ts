import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceService } from '../compliance/compliance.service';

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    private compliance: ComplianceService,
  ) {}

  // ---------------------------------------------------------
  // SYSTEM OVERVIEW REPORT
  // ---------------------------------------------------------
  async systemOverview() {
    const [
      workers,
      equipment,
      companies,
      sites,
      incidents,
      signoffs,
      expiredTraining,
    ] = await Promise.all([
      this.prisma.worker.count(),
      this.prisma.equipment.count(),
      this.prisma.company.count(),
      this.prisma.site.count(),
      this.prisma.incident.count(),
      this.prisma.digitalSignoff.count(),
      this.prisma.trainingRecord.count({
        where: { expiresAt: { lte: new Date() } },
      }),
    ]);

    return {
      totals: {
        workers,
        equipment,
        companies,
        sites,
        incidents,
        signoffs,
        expiredTraining,
      },
    };
  }

  // ---------------------------------------------------------
  // INCIDENT REPORTING
  // ---------------------------------------------------------
  async incidentSummary() {
    const last90 = new Date();
    last90.setDate(last90.getDate() - 90);

    const [total, last90Count, bySeverity] = await Promise.all([
      this.prisma.incident.count(),
      this.prisma.incident.count({
        where: { createdAt: { gte: last90 } },
      }),
      this.prisma.incident.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),
    ]);

    return {
      total,
      last90Days: last90Count,
      bySeverity,
    };
  }

  // ---------------------------------------------------------
  // TRAINING EXPIRY REPORT
  // ---------------------------------------------------------
  async trainingExpiryReport() {
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);

    const [expired, expiringSoon] = await Promise.all([
      this.prisma.trainingRecord.findMany({
        where: { expiresAt: { lte: now } },
        include: { worker: true, certification: true },
      }),
      this.prisma.trainingRecord.findMany({
        where: {
          expiresAt: {
            gt: now,
            lte: soon,
          },
        },
        include: { worker: true, certification: true },
      }),
    ]);

    return {
      expiredCount: expired.length,
      expiringSoonCount: expiringSoon.length,
      expired,
      expiringSoon,
    };
  }

  // ---------------------------------------------------------
  // COMPANY RISK REPORT
  // ---------------------------------------------------------
  async companyRisk(companyId: number) {
    const compliance = await this.compliance.companyCompliance(companyId);

    const incidents = await this.prisma.incident.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      include: {
        trainingRecords: true,
        credentials: true,
      },
    });

    return {
      compliance,
      incidents,
      workers,
    };
  }

  // ---------------------------------------------------------
  // SITE SAFETY REPORT
  // ---------------------------------------------------------
  async siteSafetyReport(siteId: number) {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      include: {
        workerSiteAccess: {
          include: { worker: true },
        },
        digitalSignoff: true,
      },
    });

    const compliance = await this.compliance.siteCompliance(siteId);

    return {
      site,
      compliance,
      workersOnSite: site.workerSiteAccess.length,
      signoffs: site.digitalSignoff.length,
    };
  }

  // ---------------------------------------------------------
  // EQUIPMENT HEALTH REPORT
  // ---------------------------------------------------------
  async equipmentHealth() {
    const equipment = await this.prisma.equipment.findMany({
      include: {
        incidents: true,
        digitalSignoff: true,
      },
    });

    return equipment.map((e) => ({
      id: e.id,
      name: e.name,
      serialNumber: e.serialNumber,
      incidents: e.incidents.length,
      signoffs: e.digitalSignoff.length,
      status: e.safetyStatus,
    }));
  }

  // ---------------------------------------------------------
  // WORKER SAFETY REPORT
  // ---------------------------------------------------------
  async workerSafety(workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        trainingRecords: { include: { certification: true } },
        credentials: true,
        incidents: true,
        digitalSignoff: true,
      },
    });

    const compliance = await this.compliance.workerCompliance(workerId);

    return {
      worker,
      compliance,
      incidents: worker.incidents,
      signoffs: worker.digitalSignoff,
      training: worker.trainingRecords,
    };
  }
}
