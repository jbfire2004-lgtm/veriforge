import { Injectable } from '@nestjs/common';
import { Prisma, TopicLibraryCategoryCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_TOPIC_CATEGORIES } from './pm-safety-meetings.constants';
import { TopicSuggestEngine } from './topic-suggest.engine';

@Injectable()
export class PmSafetyMeetingsTopicLibraryService {
  private readonly suggestEngine = new TopicSuggestEngine();

  constructor(private readonly prisma: PrismaService) {}

  async ensureCategories(companyId: number, projectId?: number) {
    for (const c of DEFAULT_TOPIC_CATEGORIES) {
      const existing = await this.prisma.topicLibraryCategory.findFirst({
        where: {
          companyId,
          projectId: projectId ?? null,
          code: c.code as TopicLibraryCategoryCode,
        },
      });
      if (!existing) {
        await this.prisma.topicLibraryCategory.create({
          data: {
            companyId,
            projectId,
            code: c.code as TopicLibraryCategoryCode,
            name: c.name,
            sortOrder: c.sortOrder,
          },
        });
      }
    }
  }

  async listTopics(
    companyId: number,
    projectId?: number,
    categoryCode?: string,
  ) {
    await this.ensureCategories(companyId, projectId);
    return this.prisma.topicLibraryEntry.findMany({
      where: {
        active: true,
        deletedAt: null,
        companyId,
        OR: [{ projectId: null }, { projectId: projectId ?? -1 }],
        ...(categoryCode
          ? { category: { code: categoryCode as TopicLibraryCategoryCode } }
          : {}),
      },
      include: { category: true },
      orderBy: [{ usageCount: 'desc' }, { title: 'asc' }],
      take: 200,
    });
  }

  async createTopic(data: {
    companyId: number;
    projectId?: number;
    categoryId?: string;
    title: string;
    summary?: string;
    discussionPoints?: unknown[];
    requiredControls?: unknown[];
    isHighRisk?: boolean;
  }) {
    return this.prisma.topicLibraryEntry.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        categoryId: data.categoryId,
        scope: data.projectId ? 'project' : 'company',
        title: data.title,
        summary: data.summary,
        discussionPoints: (data.discussionPoints ??
          []) as Prisma.InputJsonValue,
        requiredControls: (data.requiredControls ??
          []) as Prisma.InputJsonValue,
        isHighRisk: data.isHighRisk ?? false,
      },
    });
  }

  async suggestTopics(projectId: number, companyId: number) {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [incidents, deficiencies, jhas, equipment, sifEvents] =
      await Promise.all([
        this.prisma.pmSafetyEvent.findMany({
          where: { projectId, createdAt: { gte: since } },
          select: { id: true, title: true, severity: true },
          take: 10,
        }),
        this.prisma.pmInspectionDeficiency.findMany({
          where: {
            inspection: { projectId },
            status: { in: ['open', 'assigned'] },
          },
          select: { id: true, title: true, severity: true },
          take: 10,
        }),
        this.prisma.jhaFlha.findMany({
          where: { projectId, sifScore: { gte: 60 } },
          select: { id: true, taskDescription: true, sifScore: true },
          take: 10,
        }),
        this.prisma.equipmentLockout.findMany({
          where: { unlockedAt: null },
          include: { equipment: { select: { name: true } } },
          take: 5,
        }),
        this.prisma.sifHecaEvent.findMany({
          where: { projectId, createdAt: { gte: since } },
          select: {
            title: true,
            hecaScore: { select: { hecaCategoryCode: true } },
          },
          take: 20,
        }),
      ]);

    const sifTags = [
      ...new Set(
        sifEvents
          .map((e) => e.hecaScore?.hecaCategoryCode ?? e.title)
          .filter(Boolean),
      ),
    ] as string[];

    return this.suggestEngine.suggest({
      recentIncidents: incidents.map((i) => ({
        id: i.id,
        title: i.title,
        severity: i.severity ?? undefined,
      })),
      recentDeficiencies: deficiencies.map((d) => ({
        id: d.id,
        title: d.title,
        score:
          d.severity === 'critical' ? 100 : d.severity === 'high' ? 75 : 50,
      })),
      highRiskJhas: jhas.map((j) => ({
        id: j.id,
        title: j.taskDescription.slice(0, 120),
        sifScore: j.sifScore ?? undefined,
      })),
      equipmentFailures: equipment.map((e) => ({
        id: String(e.id),
        title: e.equipment?.name ?? 'Equipment lockout',
      })),
      sifTrendTags: sifTags,
      projectRiskScore: await this.projectRiskScore(projectId),
    });
  }

  private async projectRiskScore(projectId: number): Promise<number> {
    const [openCapa, openSif, openDef] = await Promise.all([
      this.prisma.pmCorrectiveAction.count({
        where: {
          projectId,
          status: {
            in: ['open', 'assigned', 'in_progress', 'verification_pending'],
          },
        },
      }),
      this.prisma.sifHecaEvent.count({
        where: {
          projectId,
          createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
        },
      }),
      this.prisma.pmInspectionDeficiency.count({
        where: {
          inspection: { projectId },
          status: 'open',
        },
      }),
    ]);
    return Math.min(100, openCapa * 8 + openSif * 12 + openDef * 5);
  }
}
