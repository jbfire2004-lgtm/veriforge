import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestigationsService {
  constructor(private prisma: PrismaService) {}

  async startInvestigation(incidentId: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.investigation.create({
      data: {
        incidentId,
        // status removed — not in Prisma model
      },
    });
  }

  async updateInvestigation(id: number, data: any) {
    return this.prisma.investigation.update({
      where: { id },
      data,
    });
  }

  async getInvestigation(id: number) {
    return this.prisma.investigation.findUnique({
      where: { id },
      include: { incident: true },
    });
  }

  async assignInvestigator(investigationId: number, investigatorId: number) {
    return this.prisma.investigation.update({
      where: { id: investigationId },
      data: { investigatorId },
    });
  }
}
