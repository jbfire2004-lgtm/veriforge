import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupervisorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Global counts for supervisor home (no `:id` — avoids colliding with worker-scoped routes).
   */
  async globalDashboard() {
    const [totalWorkers, totalEquipment, signoffs] = await Promise.all([
      this.prisma.worker.count(),
      this.prisma.equipment.count(),
      this.prisma.digitalSignoff.findMany({
        select: { checklist: true },
      }),
    ]);

    let safeChecks = 0;
    let unsafeChecks = 0;
    for (const s of signoffs) {
      const c = s.checklist;
      if (c == null || typeof c !== 'object') {
        unsafeChecks++;
        continue;
      }
      const values = Object.values(c as Record<string, unknown>);
      const ok = values.length > 0 && values.every((v) => v === true);
      if (ok) safeChecks++;
      else unsafeChecks++;
    }

    return {
      totalWorkers,
      totalEquipment,
      safeChecks,
      unsafeChecks,
    };
  }

  async listSafetyStations() {
    return this.prisma.safetyStation.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // BASIC SUPERVISOR PROFILE
  async profile(supervisorId: number) {
    const supervisor = await this.prisma.worker.findUnique({
      where: { id: supervisorId },
      include: {
        company: true,
      },
    });

    if (!supervisor) throw new NotFoundException('Supervisor not found');

    return {
      id: supervisor.id,
      firstName: supervisor.firstName,
      lastName: supervisor.lastName,
      fullName: `${supervisor.firstName} ${supervisor.lastName}`,
      companyName: supervisor.company?.name ?? null,
    };
  }

  // OVERVIEW COUNTS FOR SUPERVISOR
  async overview(supervisorId: number) {
    // supervisorId DOES exist on DigitalSignoff, but NOT on Incident
    const [signoffs, incidents] = await Promise.all([
      this.prisma.digitalSignoff.count({
        where: { supervisorId },
      }),
      this.prisma.incident.count(), // no supervisor filter available
    ]);

    return {
      signoffs,
      incidents,
    };
  }

  // RECENT SIGNOFFS BY SUPERVISOR
  async recentSignoffs(supervisorId: number) {
    return this.prisma.digitalSignoff.findMany({
      where: { supervisorId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        worker: true,
        equipment: true,
        site: true,
      },
    });
  }

  // RECENT INCIDENTS (no supervisorId field exists)
  async recentIncidents(supervisorId: number) {
    return this.prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        worker: true,
        equipment: true,
        company: true,
      },
    });
  }

  // WORKERS UNDER SUPERVISOR (via company)
  async workersForCompany(supervisorId: number) {
    const supervisor = await this.prisma.worker.findUnique({
      where: { id: supervisorId },
      include: { company: true },
    });

    if (!supervisor || !supervisor.companyId)
      throw new NotFoundException('Supervisor or company not found');

    return this.prisma.worker.findMany({
      where: { companyId: supervisor.companyId },
      orderBy: { lastName: 'asc' },
    });
  }

  // TRAINING RISK SNAPSHOT FOR SUPERVISOR'S COMPANY
  async trainingRisk(supervisorId: number) {
    const supervisor = await this.prisma.worker.findUnique({
      where: { id: supervisorId },
      include: { company: true },
    });

    if (!supervisor || !supervisor.companyId)
      throw new NotFoundException('Supervisor or company not found');

    const now = new Date();

    const expiredTraining = await this.prisma.trainingRecord.count({
      where: {
        worker: { companyId: supervisor.companyId },
        expiresAt: { lte: now },
      },
    });

    const expiringSoon = await this.prisma.trainingRecord.count({
      where: {
        worker: { companyId: supervisor.companyId },
        expiresAt: {
          gt: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      expiredTraining,
      expiringSoon,
    };
  }
}
