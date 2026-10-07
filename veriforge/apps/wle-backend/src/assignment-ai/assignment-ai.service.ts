import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentAIService {
  constructor(private prisma: PrismaService) {}

  async suggest(data: {
    equipmentId?: number;
    siteId?: number;
    companyId: number;
  }) {
    const now = new Date();

    const workers = await this.prisma.worker.findMany({
      where: { companyId: data.companyId },
      include: {
        trainingRecords: true,
        incidents: true,
        assignments: { where: { endedAt: null } },
      },
    });

    let requiredCerts: number[] = [];

    if (data.equipmentId) {
      const req = await this.prisma.equipmentTrainingRequirement.findMany({
        where: { equipmentId: data.equipmentId },
      });
      requiredCerts = req.map((r) => r.certificationId);
    }

    const scored = workers.map((w) => {
      let score = 100;

      for (const cert of requiredCerts) {
        const has = w.trainingRecords.some((t) => t.certificationId === cert);
        if (!has) score -= 40;
      }

      const expired = w.trainingRecords.some(
        (t) => t.expiresAt && t.expiresAt <= now,
      );
      if (expired) score -= 50;

      const openIncidents = w.incidents.filter(
        (i) => i.status !== 'CLOSED',
      ).length;
      score -= openIncidents * 10;

      score -= w.assignments.length * 5;

      return { worker: w, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 5);
  }
}
