import { Injectable, NotFoundException } from '@nestjs/common';
import { CailStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
import { LessonEmbeddingService } from './lesson-embedding.service';
import { VsiEventService } from '../events/vsi-event.service';

@Injectable()
export class LessonsLearnedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: SafetyIntelligenceAiService,
    private readonly scope: CailScopeService,
    private readonly embeddings: LessonEmbeddingService,
    private readonly vsiEvents: VsiEventService,
  ) {}

  async materializeFromCail(cailId: string) {
    const entry = await this.prisma.cailEntry.findUnique({
      where: { id: cailId },
      include: { attachments: true, lessonLearned: true },
    });
    if (!entry) throw new NotFoundException('CAIL entry not found');
    if (entry.lessonLearned) return entry.lessonLearned;
    if (entry.status !== CailStatus.verified) return null;

    const insights = await this.ai.buildLessonInsights({
      title: entry.title,
      description: entry.description,
      sourceType: entry.sourceType,
      rootCauseNotes: entry.rootCauseNotes,
      rootCauseCategory: entry.rootCauseCategory,
      severity: entry.severity,
      companyId: entry.ownerCompanyId,
      projectId: entry.projectId,
    });

    const clusterId = entry.riskCategory
      ? `cluster_${entry.projectId}_${entry.riskCategory}`
      : undefined;

    const summary =
      insights.summary ??
      ([
        entry.description,
        entry.rootCauseNotes ? `Root cause: ${entry.rootCauseNotes}` : null,
      ]
        .filter(Boolean)
        .join('\n\n') ||
        entry.title);

    const lesson = await this.prisma.lessonsLearnedEntry.create({
      data: {
        cailId: entry.id,
        projectId: entry.projectId,
        companyId: entry.ownerCompanyId,
        sourceType: entry.sourceType,
        title: entry.title,
        summary,
        rootCause: entry.rootCauseNotes ?? insights.rootCause,
        correctiveAction: insights.correctiveAction,
        beforeEvidence: entry.evidenceBefore as Prisma.InputJsonValue,
        afterEvidence: entry.evidenceAfter as Prisma.InputJsonValue,
        severity: entry.severity,
        timeToCloseHours: entry.timeToResolveHours,
        tags: entry.tags as Prisma.InputJsonValue,
        aiClusterId: clusterId,
        aiInsights: insights as Prisma.InputJsonValue,
      },
    });

    await this.prisma.cailEntry.update({
      where: { id: cailId },
      data: { lessonsLearnedGenerated: true },
    });

    await this.prisma.cailActivityLog.create({
      data: {
        cailId,
        eventType: 'lesson_learned_created',
        payload: { lessonId: lesson.id } as Prisma.InputJsonValue,
      },
    });

    try {
      await this.embeddings.embedLesson(lesson.id);
    } catch {
      /* embedding optional */
    }

    this.vsiEvents.lessonPublished({
      id: lesson.id,
      projectId: lesson.projectId,
      companyId: lesson.companyId,
      cailId: lesson.cailId,
    });

    return lesson;
  }

  async recluster(projectId: number, actor: CailActor) {
    if (!this.scope.isPrime(actor) && actor.companyId) {
      /* subs may recluster own project lessons */
    }
    return this.embeddings.reclusterProject(projectId);
  }

  async list(
    actor: CailActor,
    filters: { projectId?: number; companyId?: number },
  ) {
    const where: Prisma.LessonsLearnedEntryWhereInput = {};
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.companyId) where.companyId = filters.companyId;
    if (!this.scope.isPrime(actor) && actor.companyId) {
      where.companyId = actor.companyId;
    }

    return this.prisma.lessonsLearnedEntry.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        cail: { select: { id: true, status: true, sourceType: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });
  }

  async getById(id: string, actor: CailActor) {
    const row = await this.prisma.lessonsLearnedEntry.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        cail: true,
      },
    });
    if (!row) throw new NotFoundException('Lesson not found');
    if (!this.scope.isPrime(actor) && actor.companyId !== row.companyId) {
      throw new NotFoundException('Lesson not found');
    }
    return row;
  }

  async clusters(projectId: number) {
    const embeddingClusters = await this.prisma.lessonsLearnedEntry.groupBy({
      by: ['aiClusterId'],
      where: { projectId, aiClusterId: { startsWith: 'emb_' } },
      _count: true,
    });

    if (embeddingClusters.length > 0) {
      const lessons = await this.prisma.lessonsLearnedEntry.findMany({
        where: { projectId, aiClusterId: { startsWith: 'emb_' } },
        select: {
          id: true,
          title: true,
          aiClusterId: true,
          severity: true,
          sourceType: true,
          aiInsights: true,
          embeddingModel: true,
        },
      });

      const map = new Map<string, typeof lessons>();
      for (const l of lessons) {
        const key = l.aiClusterId!;
        const bucket = map.get(key) ?? [];
        bucket.push(l);
        map.set(key, bucket);
      }

      return [...map.entries()].map(([clusterId, items]) => {
        const takeaways = items.flatMap((l) => {
          const i = l.aiInsights as { keyTakeaways?: string[] } | null;
          return i?.keyTakeaways ?? [];
        });
        return {
          clusterId,
          label: items[0]?.title.slice(0, 48) ?? clusterId,
          count: items.length,
          embedding: true,
          embeddingModel: items[0]?.embeddingModel ?? 'tfidf-sparse',
          lessons: items,
          meetingTopics: [...new Set(takeaways)].slice(0, 4),
        };
      });
    }

    const lessons = await this.prisma.lessonsLearnedEntry.findMany({
      where: { projectId, aiClusterId: { not: null } },
      select: {
        aiClusterId: true,
        id: true,
        title: true,
        severity: true,
        sourceType: true,
      },
    });

    const map = new Map<
      string,
      { clusterId: string; count: number; lessons: typeof lessons }
    >();

    for (const l of lessons) {
      const key = l.aiClusterId!;
      const bucket = map.get(key) ?? { clusterId: key, count: 0, lessons: [] };
      bucket.count += 1;
      bucket.lessons.push(l);
      map.set(key, bucket);
    }

    const clusters = [...map.values()].sort((a, b) => b.count - a.count);

    const fullLessons = await this.prisma.lessonsLearnedEntry.findMany({
      where: { projectId, aiClusterId: { not: null } },
      select: { aiClusterId: true, aiInsights: true, sourceType: true },
    });

    return clusters.map((c) => {
      const insights = fullLessons
        .filter((l) => l.aiClusterId === c.clusterId)
        .map((l) => l.aiInsights as { keyTakeaways?: string[] } | null);
      const takeaways = [
        ...new Set(insights.flatMap((i) => i?.keyTakeaways ?? []).slice(0, 3)),
      ];
      const label = c.clusterId.replace(/^cluster_\d+_/, '').replace(/_/g, ' ');
      return {
        ...c,
        label,
        meetingTopics: takeaways.length
          ? takeaways
          : [`Review ${label} trends with crews`],
      };
    });
  }
}
