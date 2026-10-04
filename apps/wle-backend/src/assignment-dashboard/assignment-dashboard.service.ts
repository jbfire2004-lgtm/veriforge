import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentDashboardService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // SYSTEM‑WIDE ASSIGNMENT OVERVIEW
  // ---------------------------------------------------------
  async overview() {
    const [active, workers, equipment, sites] = await Promise.all([
      this.prisma.workerAssignment.count({ where: { endedAt: null } }),
      this.prisma.worker.count(),
      this.prisma.equipment.count(),
      this.prisma.site.count(),
    ]);

    return {
      activeAssignments: active,
      totalWorkers: workers,
      totalEquipment: equipment,
      totalSites: sites,
    };
  }

  // ---------------------------------------------------------
  // ACTIVE ASSIGNMENTS WITH RISK FLAGS
  // ---------------------------------------------------------
  async activeAssignments() {
    const now = new Date();

    const assignments = await this.prisma.workerAssignment.findMany({
      where: { endedAt: null },
      include: {
        worker: {
          include: {
            trainingRecords: true,
            incidents: true,
          },
        },
        equipment: true,
        site: true,
        company: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => {
      const expiredTraining = a.worker.trainingRecords.some(
        (t) => t.expiresAt && t.expiresAt <= now,
      );

      const openIncidents = a.worker.incidents.filter(
        (i) => i.status !== 'CLOSED',
      ).length;

      const equipmentUnsafe = a.equipment && a.equipment.safetyStatus !== 'OK';

      return {
        ...a,
        risk: {
          expiredTraining,
          openIncidents,
          equipmentUnsafe,
        },
      };
    });
  }

  // ---------------------------------------------------------
  // WORKER LOAD VIEW
  // ---------------------------------------------------------
  async workerLoad() {
    const workers = await this.prisma.worker.findMany({
      include: {
        assignments: {
          where: { endedAt: null },
          include: { equipment: true, site: true },
        },
      },
    });

    return workers.map((w) => ({
      id: w.id,
      name: `${w.firstName} ${w.lastName}`,
      activeAssignments: w.assignments.length,
      assignments: w.assignments,
    }));
  }

  // ---------------------------------------------------------
  // EQUIPMENT UTILIZATION
  // ---------------------------------------------------------
  async equipmentUtilization() {
    const equipment = await this.prisma.equipment.findMany({
      include: {
        assignments: {
          where: { endedAt: null },
          include: { worker: true },
        },
      },
    });

    return equipment.map((e) => ({
      id: e.id,
      name: e.name,
      serialNumber: e.serialNumber,
      safetyStatus: e.safetyStatus,
      assigned: e.assignments.length > 0,
      assignedWorkers: e.assignments.map((a) => a.worker),
    }));
  }

  // ---------------------------------------------------------
  // SITE STAFFING LEVELS
  // ---------------------------------------------------------
  async siteStaffing() {
    const sites = await this.prisma.site.findMany({
      include: {
        assignments: {
          where: { endedAt: null },
          include: { worker: true },
        },
      },
    });

    return sites.map((s) => ({
      id: s.id,
      name: s.name,
      activeWorkers: s.assignments.length,
      workers: s.assignments.map((a) => a.worker),
    }));
  }

  // ---------------------------------------------------------
  // COMPANY‑WIDE ASSIGNMENT MAP
  // ---------------------------------------------------------
  async companyAssignments(companyId: number) {
    const assignments = await this.prisma.workerAssignment.findMany({
      where: { companyId, endedAt: null },
      include: {
        worker: true,
        equipment: true,
        site: true,
      },
    });

    return {
      companyId,
      total: assignments.length,
      assignments,
    };
  }
}
