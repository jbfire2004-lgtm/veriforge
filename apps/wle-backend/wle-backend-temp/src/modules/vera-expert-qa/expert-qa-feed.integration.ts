import { Injectable } from '@nestjs/common';
import { FeedSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExpertQaFeedIntegration {
  constructor(private readonly prisma: PrismaService) {}

  async syncRecentToFeed(companyId?: number, take = 10): Promise<number> {
    const questions = await this.prisma.expertQaQuestion.findMany({
      where: {
        moderationStatus: 'VISIBLE',
        acceptedAnswerId: { not: null },
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take,
      include: {
        acceptedAnswer: {
          include: {
            author: { include: { worker: true, expertProfile: true } },
          },
        },
      },
    });

    let count = 0;
    for (const q of questions) {
      if (!q.acceptedAnswer) continue;
      const externalId = `expert-qa-${q.id}`;
      await this.prisma.feedItem.upsert({
        where: {
          source_externalId: { source: FeedSource.EXPERT_ANSWER, externalId },
        },
        create: {
          source: FeedSource.EXPERT_ANSWER,
          externalId,
          title: q.title,
          summary: q.acceptedAnswer.body.slice(0, 200),
          publishedAt: q.acceptedAnswer.createdAt,
          companyId: q.companyId ?? undefined,
          projectId: q.projectId ?? undefined,
          trade: q.trade ?? undefined,
          url: `/experts/questions/${q.slug}`,
          metadata: {
            questionId: q.id,
            answerId: q.acceptedAnswer.id,
            expert: q.acceptedAnswer.isExpertAnswer,
          },
          rankScore: 1,
        },
        update: {
          summary: q.acceptedAnswer.body.slice(0, 200),
          publishedAt: q.acceptedAnswer.createdAt,
        },
      });
      count += 1;
    }
    return count;
  }

  async syncAnswerToFeed(answerId: string): Promise<void> {
    const answer = await this.prisma.expertQaAnswer.findUnique({
      where: { id: answerId },
      include: {
        question: true,
        author: { include: { expertProfile: true } },
      },
    });
    if (!answer?.question) return;

    const q = answer.question;
    const externalId = `expert-qa-${q.id}`;
    await this.prisma.feedItem.upsert({
      where: {
        source_externalId: { source: FeedSource.EXPERT_ANSWER, externalId },
      },
      create: {
        source: FeedSource.EXPERT_ANSWER,
        externalId,
        title: q.title,
        summary: answer.body.slice(0, 200),
        publishedAt: answer.createdAt,
        companyId: q.companyId ?? undefined,
        projectId: q.projectId ?? undefined,
        trade: q.trade ?? undefined,
        url: `/experts/questions/${q.slug}`,
        rankScore: 1.1,
      },
      update: {
        summary: answer.body.slice(0, 200),
        publishedAt: answer.createdAt,
      },
    });
  }
}
