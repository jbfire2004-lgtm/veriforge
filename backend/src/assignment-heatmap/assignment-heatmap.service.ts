import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentHeatmapService {
  constructor(private prisma: PrismaService) {}

  async siteHeatmap() {
    const sites = await this.prisma.site.findMany({
      include: {
        assignments: {
          where: { endedAt: null },
          include: {
            worker: {
              include: { trainingRecords: true, incidents: true },
            },
            equipment: true,
          },
        },
      },
    });

    const now = new Date();

    return sites.map((s) => {
      let risk = 0;

      for (const a of s.assignments) {
        const expired = a.worker.trainingRecords.some(
          (t) => t.expiresAt && t.expiresAt <= now,
        );
        if (expired) risk += 20;

        const openIncidents = a.worker.incidents.filter(
          (i) => i.status !== 'CLOSED',
        ).length;
        risk += openIncidents * 10;

        if (a.equipment && a.equipment.safetyStatus !== 'OK') {
          risk += 30;
        }
      }

      return {
        siteId: s.id,
        siteName: s.name,
        risk,
        workers: s.assignments.length,
      };
    });
  }
}
