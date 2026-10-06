import { Injectable } from '@nestjs/common';
import { CailStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';

@Injectable()
export class VsiPresentationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: CailScopeService,
  ) {}

  async generateProjectBrief(projectId: number, actor: CailActor) {
    const cailWhere = this.scope.buildListWhere(actor, { projectId });

    const [cailTotal, verified, lessons, bboTotal, bboSafe, bySource] =
      await Promise.all([
        this.prisma.cailEntry.count({ where: { ...cailWhere, projectId } }),
        this.prisma.cailEntry.count({
          where: { ...cailWhere, projectId, status: CailStatus.verified },
        }),
        this.prisma.lessonsLearnedEntry.findMany({
          where: { projectId },
          orderBy: { publishedAt: 'desc' },
          take: 5,
          select: {
            title: true,
            summary: true,
            severity: true,
            sourceType: true,
          },
        }),
        this.prisma.bboObservation.count({ where: { projectId } }),
        this.prisma.bboObservation.count({
          where: { projectId, polarity: 'safe' },
        }),
        this.prisma.cailEntry.groupBy({
          by: ['sourceType'],
          where: { ...cailWhere, projectId },
          _count: true,
        }),
      ]);

    const positiveRatio = bboTotal > 0 ? bboSafe / bboTotal : 0;
    const sourceMix = Object.fromEntries(
      bySource.map((r) => [r.sourceType, r._count]),
    );

    const slides = [
      {
        title: 'Safety intelligence overview',
        bullets: [
          `${cailTotal} corrective actions tracked in CAIL`,
          `${verified} verified closures`,
          `${Math.round(
            positiveRatio * 100,
          )}% positive BBO ratio (${bboSafe}/${bboTotal})`,
        ],
      },
      {
        title: 'Source mix',
        bullets: Object.entries(sourceMix).map(
          ([k, v]) => `${k}: ${v} entries`,
        ),
      },
      {
        title: 'Recent lessons learned',
        bullets:
          lessons.length > 0
            ? lessons.map((l) => l.title)
            : ['No published lessons yet — verify CAIL entries to generate'],
      },
    ];

    const narrative = [
      `# Project ${projectId} — Safety Intelligence Brief`,
      ``,
      `This project has **${cailTotal}** CAIL entries with **${verified}** verified.`,
      `Behavior-based observations show a **${Math.round(
        positiveRatio * 100,
      )}%** positive (safe) rate.`,
      ``,
      lessons.length
        ? `## Highlights\n${lessons
            .map((l) => `- **${l.title}** (${l.sourceType})`)
            .join('\n')}`
        : `## Highlights\n- Focus on closing open corrective actions and verifying resolutions to build the lessons library.`,
    ].join('\n');

    return {
      projectId,
      generatedAt: new Date().toISOString(),
      slides,
      narrative,
    };
  }
}
