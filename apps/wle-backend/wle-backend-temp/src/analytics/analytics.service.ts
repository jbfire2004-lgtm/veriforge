import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // SYSTEM OVERVIEW COUNTS
  // ---------------------------------------------------------
  async overview() {
    const [
      workers,
      equipment,
      companies,
      incidents,
      documents,
      safetyStations,
      trainingRecords,
      credentials,
    ] = await Promise.all([
      this.prisma.worker.count(),
      this.prisma.equipment.count(),
      this.prisma.company.count(),
      this.prisma.incident.count(),
      this.prisma.document.count(),
      this.prisma.safetyStation.count(),
      this.prisma.trainingRecord.count(),
      this.prisma.credential.count(),
    ]);

    return {
      workers,
      equipment,
      companies,
      incidents,
      documents,
      safetyStations,
      trainingRecords,
      credentials,
    };
  }

  // ---------------------------------------------------------
  // RECENT UPLOADS (TRAINING + CREDENTIALS + DOCUMENTS)
  // ---------------------------------------------------------
  async recent(limit = 5) {
    const take = Math.max(1, Math.min(limit, 25));

    const [trainingRecords, credentials, documents] = await Promise.all([
      this.prisma.trainingRecord.findMany({
        orderBy: { issuedAt: 'desc' },
        take,
        select: {
          id: true,
          issuedAt: true,
          expiresAt: true,
          certificateNumber: true,
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyId: true,
            },
          },
          certification: { select: { id: true, name: true } },
        },
      }),
      this.prisma.credential.findMany({
        orderBy: { issuedAt: 'desc' },
        take,
        select: {
          id: true,
          name: true,
          issuedAt: true,
          expiresAt: true,
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyId: true,
            },
          },
          certification: { select: { id: true, name: true } },
        },
      }),
      this.prisma.document.findMany({
        where: { deleted: false },
        orderBy: { createdAt: 'desc' },
        take,
        select: {
          id: true,
          name: true,
          type: true,
          url: true,
          createdAt: true,
          workerId: true,
          companyId: true,
          equipmentId: true,
        },
      }),
    ]);

    return {
      trainingRecords,
      credentials,
      documents,
    };
  }

  // ---------------------------------------------------------
  // INCIDENTS BY SEVERITY (LAST 30 DAYS)
  // ---------------------------------------------------------
  async incidentsBySeverity() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const grouped = await this.prisma.incident.groupBy({
      by: ['severity'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    });

    return grouped.map((g) => ({
      severity: g.severity,
      count: g._count._all,
    }));
  }

  // ---------------------------------------------------------
  // INCIDENTS TIMELINE (LAST 30 DAYS)
  // ---------------------------------------------------------
  async incidentsTimeline() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const incidents = await this.prisma.incident.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });

    const buckets: Record<string, number> = {};

    for (const i of incidents) {
      const key = i.createdAt.toISOString().slice(0, 10);
      buckets[key] = (buckets[key] || 0) + 1;
    }

    return Object.entries(buckets).map(([date, count]) => ({
      date,
      count,
    }));
  }

  // ---------------------------------------------------------
  // TRAINING EXPIRY SUMMARY
  // ---------------------------------------------------------
  async trainingExpirySummary() {
    const now = new Date();

    const expired = await this.prisma.trainingRecord.count({
      where: { expiresAt: { lte: now } },
    });

    const expiringSoon = await this.prisma.trainingRecord.count({
      where: {
        expiresAt: {
          gt: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      expired,
      expiringSoon,
    };
  }

  // ---------------------------------------------------------
  // COMPANY RISK RANKING (TOP 10)
  // ---------------------------------------------------------
  async companyRiskRanking() {
    const companies = await this.prisma.company.findMany({
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

    const now = new Date();

    const scored = companies.map((c) => {
      let score = 0;

      for (const w of c.workers) {
        score += w.trainingRecords.filter((t) => t.expiresAt <= now).length;
        score += w.credentials.filter((cr) => cr.expiresAt <= now).length;
        score += w.incidents.length * 2;
      }

      for (const e of c.equipment) {
        score += e.incidents.length * 2;
      }

      return {
        companyId: c.id,
        companyName: c.name,
        riskScore: score,
      };
    });

    scored.sort((a, b) => b.riskScore - a.riskScore);

    return scored.slice(0, 10);
  }

  // ---------------------------------------------------------
  // GLOBAL ANALYTICS (STEP 13)
  // ---------------------------------------------------------
  async global() {
    const companies = await this.prisma.company.findMany({
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

    const now = new Date();

    const allWorkers = companies.flatMap((c) => c.workers);
    const allEquipment = companies.flatMap((c) => c.equipment);
    const workerIncidents = allWorkers.flatMap((w) => w.incidents);
    const equipmentIncidents = allEquipment.flatMap((e) => e.incidents);

    const expiredTraining = allWorkers.filter((w) =>
      w.trainingRecords.some((t) => t.expiresAt <= now),
    ).length;

    const expiredCredentials = allWorkers.filter((w) =>
      w.credentials.some((c) => c.expiresAt <= now),
    ).length;

    // Trend (6 months)
    const months: string[] = [];
    const incidentTrend: number[] = [];
    const expiryTrend: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      months.push(month.toLocaleString('default', { month: 'short' }));

      incidentTrend.push(
        workerIncidents.filter(
          (inc) =>
            new Date(inc.createdAt) >= month &&
            new Date(inc.createdAt) < nextMonth,
        ).length +
          equipmentIncidents.filter(
            (inc) =>
              new Date(inc.createdAt) >= month &&
              new Date(inc.createdAt) < nextMonth,
          ).length,
      );

      expiryTrend.push(
        allWorkers.filter((w) =>
          w.trainingRecords.some(
            (t) =>
              t.expiresAt &&
              new Date(t.expiresAt) >= month &&
              new Date(t.expiresAt) < nextMonth,
          ),
        ).length,
      );
    }

    return {
      totalCompanies: companies.length,
      totalWorkers: allWorkers.length,
      totalEquipment: allEquipment.length,
      expiredTraining,
      expiredCredentials,
      workerIncidents: workerIncidents.length,
      equipmentIncidents: equipmentIncidents.length,
      months,
      incidentTrend,
      expiryTrend,
    };
  }
}
