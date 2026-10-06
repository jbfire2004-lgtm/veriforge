import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type ProjectLearningItem = {
  description: string;
  category?: string;
  controlType?: string;
  count: number;
  reason: string;
};

export type ProjectLearnings = {
  hazards: ProjectLearningItem[];
  controls: ProjectLearningItem[];
  approvedFormCount: number;
};

@Injectable()
export class JhaLibraryLearningService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectLearnings(
    projectId: number,
    limit = 15,
  ): Promise<ProjectLearnings> {
    const approved = await this.prisma.jhaFlha.findMany({
      where: { projectId, status: { in: ['APPROVED', 'LOCKED'] } },
      select: {
        hazards: { select: { description: true, category: true } },
        controls: { select: { description: true, controlType: true } },
      },
      take: 200,
      orderBy: { approvedAt: 'desc' },
    });

    const hazardCounts = new Map<string, ProjectLearningItem>();
    const controlCounts = new Map<string, ProjectLearningItem>();

    for (const form of approved) {
      for (const h of form.hazards) {
        const key = h.description.toLowerCase().trim();
        const existing = hazardCounts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          hazardCounts.set(key, {
            description: h.description,
            category: h.category ?? undefined,
            count: 1,
            reason: 'Used on approved forms for this project',
          });
        }
      }
      for (const c of form.controls) {
        const key = c.description.toLowerCase().trim();
        const existing = controlCounts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          controlCounts.set(key, {
            description: c.description,
            controlType: c.controlType,
            count: 1,
            reason: 'Used on approved forms for this project',
          });
        }
      }
    }

    const sortByCount = (a: ProjectLearningItem, b: ProjectLearningItem) =>
      b.count - a.count;

    return {
      approvedFormCount: approved.length,
      hazards: Array.from(hazardCounts.values())
        .sort(sortByCount)
        .slice(0, limit),
      controls: Array.from(controlCounts.values())
        .sort(sortByCount)
        .slice(0, limit),
    };
  }

  /** Promote custom hazards/controls from an approved form into the company library. */
  async promoteFromApprovedJha(
    jhaFlhaId: string,
  ): Promise<{ hazardsAdded: number; controlsAdded: number }> {
    const row = await this.prisma.jhaFlha.findUnique({
      where: { id: jhaFlhaId },
      include: { hazards: true, controls: true },
    });
    if (!row) return { hazardsAdded: 0, controlsAdded: 0 };

    let hazardsAdded = 0;
    let controlsAdded = 0;

    for (const h of row.hazards) {
      if (h.libraryEntryId) continue;
      const exists = await this.prisma.hazardLibraryEntry.findFirst({
        where: {
          companyId: row.companyId,
          projectId: row.projectId,
          description: h.description,
        },
      });
      if (!exists) {
        await this.prisma.hazardLibraryEntry.create({
          data: {
            companyId: row.companyId,
            projectId: row.projectId,
            category: h.category ?? 'Field',
            description: h.description,
            defaultSeverity: h.severity,
            defaultLikelihood: h.likelihood,
            defaultEnergyTypes: (h.energyTypes ?? []) as Prisma.InputJsonValue,
          },
        });
        hazardsAdded += 1;
      }
    }

    for (const c of row.controls) {
      if (c.libraryEntryId) continue;
      const hazard = c.hazardId
        ? row.hazards.find((h) => h.id === c.hazardId)
        : undefined;
      const exists = await this.prisma.controlLibraryEntry.findFirst({
        where: {
          companyId: row.companyId,
          projectId: row.projectId,
          description: c.description,
        },
      });
      if (!exists) {
        await this.prisma.controlLibraryEntry.create({
          data: {
            companyId: row.companyId,
            projectId: row.projectId,
            controlType: c.controlType,
            description: c.description,
            hazardCategories: (hazard?.category
              ? [hazard.category]
              : []) as Prisma.InputJsonValue,
            ppeRequired: c.ppeRequired,
          },
        });
        controlsAdded += 1;
      }
    }

    return { hazardsAdded, controlsAdded };
  }
}
