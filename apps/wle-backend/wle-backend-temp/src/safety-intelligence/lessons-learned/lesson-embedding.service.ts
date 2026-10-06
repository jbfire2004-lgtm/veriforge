import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VeriAgentService } from '../../veri-agent/veri-agent.service';

const STOP = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'were',
  'was',
  'are',
  'has',
  'have',
  'been',
  'into',
  'after',
  'before',
]);

export type EmbeddingCluster = {
  clusterId: string;
  label: string;
  count: number;
  similarity: number;
  lessonIds: string[];
  meetingTopics: string[];
};

@Injectable()
export class LessonEmbeddingService {
  private readonly logger = new Logger(LessonEmbeddingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly veriAgent: VeriAgentService,
  ) {}

  tokenize(text: string): string[] {
    return (text.toLowerCase().match(/\b[a-z][a-z0-9]{2,}\b/g) ?? []).filter(
      (w) => !STOP.has(w),
    );
  }

  vectorize(text: string): Map<string, number> {
    const tokens = this.tokenize(text);
    const map = new Map<string, number>();
    for (const t of tokens) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
    return map;
  }

  cosine(a: Map<string, number>, b: Map<string, number>): number {
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (const v of a.values()) na += v * v;
    for (const v of b.values()) nb += v * v;
    for (const [k, va] of a) {
      const vb = b.get(k);
      if (vb) dot += va * vb;
    }
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  async embedLesson(lessonId: string) {
    const lesson = await this.prisma.lessonsLearnedEntry.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) return null;

    const text = [
      lesson.title,
      lesson.summary,
      lesson.rootCause,
      lesson.correctiveAction,
    ]
      .filter(Boolean)
      .join(' ');
    const vector = this.vectorize(text);
    const sparse = Object.fromEntries(vector);

    let apiVector: number[] | null = null;
    if (
      this.veriAgent.isEmbeddingConfigured() &&
      lesson.companyId != null &&
      lesson.companyId > 0
    ) {
      const result = await this.veriAgent.embed({
        purpose: 'lesson_embedding',
        tenant: {
          companyId: lesson.companyId,
          projectId: lesson.projectId ?? undefined,
        },
        text,
      });
      if (result.ok === true) {
        apiVector = result.embedding;
      } else {
        this.logger.warn(
          `VeriAgent embed declined for lesson ${lessonId}: ${result.reason}`,
        );
      }
    }

    await this.prisma.lessonsLearnedEntry.update({
      where: { id: lessonId },
      data: {
        embedding: (apiVector ?? sparse) as Prisma.InputJsonValue,
        embeddingModel: apiVector ? 'openai' : 'tfidf-sparse',
      },
    });

    return { lessonId, model: apiVector ? 'openai' : 'tfidf-sparse' };
  }

  async reclusterProject(projectId: number, threshold = 0.32) {
    const lessons = await this.prisma.lessonsLearnedEntry.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        summary: true,
        rootCause: true,
        correctiveAction: true,
        embedding: true,
        aiInsights: true,
      },
    });

    const vectors = lessons.map((l) => {
      const text = [l.title, l.summary, l.rootCause, l.correctiveAction]
        .filter(Boolean)
        .join(' ');
      if (l.embedding && Array.isArray(l.embedding)) {
        return {
          lesson: l,
          vec: null as Map<string, number> | null,
          dense: l.embedding as number[],
        };
      }
      if (
        l.embedding &&
        typeof l.embedding === 'object' &&
        !Array.isArray(l.embedding)
      ) {
        return {
          lesson: l,
          vec: new Map(Object.entries(l.embedding as Record<string, number>)),
          dense: null,
        };
      }
      return { lesson: l, vec: this.vectorize(text), dense: null };
    });

    const assigned = new Set<string>();
    const clusters: EmbeddingCluster[] = [];
    let clusterIndex = 0;

    for (const item of vectors) {
      if (assigned.has(item.lesson.id)) continue;
      const members = [item];
      assigned.add(item.lesson.id);

      for (const other of vectors) {
        if (assigned.has(other.lesson.id)) continue;
        const sim = this.similarity(item, other);
        if (sim >= threshold) {
          members.push(other);
          assigned.add(other.lesson.id);
        }
      }

      const clusterId = `emb_${projectId}_${clusterIndex++}`;
      const label =
        members[0].lesson.title.slice(0, 48) || `Cluster ${clusterIndex}`;

      for (const m of members) {
        await this.prisma.lessonsLearnedEntry.update({
          where: { id: m.lesson.id },
          data: { aiClusterId: clusterId },
        });
      }

      const takeaways = members.flatMap((m) => {
        const insights = m.lesson.aiInsights as {
          keyTakeaways?: string[];
        } | null;
        return insights?.keyTakeaways ?? [];
      });

      clusters.push({
        clusterId,
        label,
        count: members.length,
        similarity: threshold,
        lessonIds: members.map((m) => m.lesson.id),
        meetingTopics: [...new Set(takeaways)].slice(0, 4),
      });
    }

    return { projectId, clusters, lessonCount: lessons.length };
  }

  private similarity(
    a: { vec: Map<string, number> | null; dense: number[] | null },
    b: { vec: Map<string, number> | null; dense: number[] | null },
  ) {
    if (a.dense && b.dense && a.dense.length === b.dense.length) {
      let dot = 0;
      let na = 0;
      let nb = 0;
      for (let i = 0; i < a.dense.length; i++) {
        dot += a.dense[i]! * b.dense[i]!;
        na += a.dense[i]! ** 2;
        nb += b.dense[i]! ** 2;
      }
      return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
    }
    if (a.vec && b.vec) return this.cosine(a.vec, b.vec);
    return 0;
  }
}
