import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // ADMIN LOGIN
  // ---------------------------------------------------------
  async login(email: string, password: string) {
    const admin = await this.prisma.user.findUnique({ where: { email } });

    if (!admin || admin.role !== 'ADMIN') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
  }

  // ---------------------------------------------------------
  // ADMIN DASHBOARD METRICS
  // ---------------------------------------------------------
  async dashboard() {
    const [
      workerCount,
      equipmentCount,
      companyCount,
      incidentCount,
      documentCount,
      stationCount,
    ] = await Promise.all([
      this.prisma.worker.count(),
      this.prisma.equipment.count(),
      this.prisma.company.count(),
      this.prisma.incident.count(),
      this.prisma.document.count(),
      this.prisma.safetyStation.count(),
    ]);

    return {
      totals: {
        workers: workerCount,
        equipment: equipmentCount,
        companies: companyCount,
        incidents: incidentCount,
        documents: documentCount,
        safetyStations: stationCount,
      },
    };
  }

  // ---------------------------------------------------------
  // RECENT ACTIVITY FEED
  // ---------------------------------------------------------
  async recentActivity() {
    const incidents = await this.prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        worker: true,
        equipment: true,
        company: true,
      },
    });

    const documents = await this.prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        worker: true,
        equipment: true,
        company: true,
      },
    });

    return {
      incidents,
      documents,
    };
  }

  // ---------------------------------------------------------
  // SYSTEM COMPLIANCE SNAPSHOT
  // ---------------------------------------------------------
  async complianceSnapshot() {
    const now = new Date();

    const expiredTraining = await this.prisma.trainingRecord.count({
      where: { expiresAt: { lte: now } },
    });

    const expiredCredentials = await this.prisma.credential.count({
      where: { expiresAt: { lte: now } },
    });

    const workerIncidents = await this.prisma.incident.count({
      where: { workerId: { not: null } },
    });

    const equipmentIncidents = await this.prisma.incident.count({
      where: { equipmentId: { not: null } },
    });

    return {
      expiredTraining,
      expiredCredentials,
      workerIncidents,
      equipmentIncidents,
    };
  }
}
