import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  ExpertQaQuestionDetail,
  ExpertQaQuestionList,
  ExpertQaQuestionSummary,
} from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpertProfileService } from './expert-profile.service';
import { sortAnswersByRank } from './expert-qa-ranking';
import {
  attachmentTypeFromMime,
  excerpt,
  slugifyQuestion,
} from './expert-qa.utils';
import { ExpertQaFeedIntegration } from './expert-qa-feed.integration';

const QUESTION_INCLUDE = {
  tags: { include: { tag: true } },
  attachments: true,
  answers: {
    where: { moderationStatus: 'VISIBLE' as const },
    include: {
      author: { include: { worker: true, expertProfile: true } },
    },
  },
  author: { include: { worker: true } },
} satisfies Prisma.ExpertQaQuestionInclude;

@Injectable()
export class ExpertQaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly experts: ExpertProfileService,
    private readonly feed: ExpertQaFeedIntegration,
  ) {}

  async listPublic(query: {
    page?: number;
    pageSize?: number;
    trade?: string;
    tag?: string;
    q?: string;
    sort?: 'newest' | 'votes' | 'unanswered';
  }): Promise<ExpertQaQuestionList> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 50);
    const where: Prisma.ExpertQaQuestionWhereInput = {
      moderationStatus: 'VISIBLE',
      status: { in: ['OPEN', 'CLOSED'] },
      ...(query.trade ? { trade: query.trade } : {}),
      ...(query.tag ? { tags: { some: { tag: { slug: query.tag } } } } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { body: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ExpertQaQuestionOrderByWithRelationInput[] =
      query.sort === 'votes'
        ? [{ voteScore: 'desc' }, { createdAt: 'desc' }]
        : query.sort === 'unanswered'
        ? [{ answers: { _count: 'asc' } }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }];

    const [total, rows] = await Promise.all([
      this.prisma.expertQaQuestion.count({ where }),
      this.prisma.expertQaQuestion.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          tags: { include: { tag: true } },
          _count: { select: { answers: true } },
        },
      }),
    ]);

    return {
      items: rows.map((r) => this.toSummary(r)),
      total,
      page,
      pageSize,
    };
  }

  async getBySlug(slug: string): Promise<ExpertQaQuestionDetail> {
    const row = await this.prisma.expertQaQuestion.findFirst({
      where: {
        slug,
        moderationStatus: 'VISIBLE',
        status: { not: 'HIDDEN' },
      },
      include: QUESTION_INCLUDE,
    });
    if (!row) throw new NotFoundException('Question not found');

    await this.prisma.expertQaQuestion.update({
      where: { id: row.id },
      data: { viewCount: { increment: 1 } },
    });

    const ranked = sortAnswersByRank(row.answers, row.acceptedAnswerId);

    return this.toDetail({ ...row, answers: ranked });
  }

  async createQuestion(
    userId: number,
    input: Record<string, unknown>,
  ): Promise<ExpertQaQuestionDetail> {
    const title = String(input.title);
    const body = String(input.body);
    const slug = slugifyQuestion(title);
    const tags = (input.tags as string[] | undefined) ?? [];

    const row = await this.prisma.expertQaQuestion.create({
      data: {
        slug,
        title,
        body,
        trade: input.trade as string | undefined,
        companyId: input.companyId as number | undefined,
        projectId: input.projectId as number | undefined,
        authorUserId: userId,
        anonymous: Boolean(input.anonymous),
        moderationStatus: 'VISIBLE',
        status: 'OPEN',
        attachments: {
          create: (
            (input.attachments as Array<Record<string, unknown>>) ?? []
          ).map((a) => ({
            fileName: String(a.fileName),
            fileUrl: String(a.fileUrl),
            mimeType: String(a.mimeType),
            type: ((a.type as string | undefined) ??
              attachmentTypeFromMime(String(a.mimeType))) as
              | 'IMAGE'
              | 'PDF'
              | 'OTHER',
            sizeBytes: a.sizeBytes as number | undefined,
          })),
        },
      },
    });

    await this.syncTags(row.id, tags);
    return this.getBySlug(slug);
  }

  async createAnswer(
    userId: number,
    questionId: string,
    body: string,
  ): Promise<void> {
    const question = await this.prisma.expertQaQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (question.status === 'CLOSED') {
      throw new ForbiddenException('Question is closed');
    }

    const profile = await this.experts.getOrCreate(userId);
    const isExpert = profile.verifiedAt != null;

    await this.prisma.expertQaAnswer.create({
      data: {
        questionId,
        authorUserId: userId,
        expertProfileId: profile.id,
        body,
        isExpertAnswer: isExpert,
        moderationStatus: 'VISIBLE',
      },
    });

    await this.experts.adjustReputation(userId, isExpert ? 10 : 5, {
      incrementAnswers: true,
    });
  }

  async voteAnswer(
    answerId: string,
    value: 1 | -1,
    voterKey: string,
    userId?: number,
  ): Promise<number> {
    const existing = await this.prisma.expertQaAnswerVote.findUnique({
      where: { answerId_voterKey: { answerId, voterKey } },
    });
    if (existing) {
      if (existing.value === value) {
        await this.prisma.expertQaAnswerVote.delete({
          where: { id: existing.id },
        });
        const updated = await this.prisma.expertQaAnswer.update({
          where: { id: answerId },
          data: { voteScore: { increment: -value } },
        });
        return updated.voteScore;
      }
      await this.prisma.expertQaAnswerVote.update({
        where: { id: existing.id },
        data: { value },
      });
      const delta = value - existing.value;
      const updated = await this.prisma.expertQaAnswer.update({
        where: { id: answerId },
        data: { voteScore: { increment: delta } },
      });
      return updated.voteScore;
    }

    await this.prisma.expertQaAnswerVote.create({
      data: { answerId, voterKey, userId, value },
    });
    const updated = await this.prisma.expertQaAnswer.update({
      where: { id: answerId },
      data: { voteScore: { increment: value } },
    });
    return updated.voteScore;
  }

  async acceptAnswer(
    userId: number,
    questionId: string,
    answerId: string,
  ): Promise<void> {
    const question = await this.prisma.expertQaQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (question.authorUserId !== userId) {
      throw new ForbiddenException('Only the author can accept an answer');
    }

    const answer = await this.prisma.expertQaAnswer.findFirst({
      where: { id: answerId, questionId },
    });
    if (!answer) throw new NotFoundException('Answer not found');

    await this.prisma.expertQaQuestion.update({
      where: { id: questionId },
      data: {
        acceptedAnswerId: answerId,
        status: 'CLOSED',
      },
    });

    await this.experts.adjustReputation(answer.authorUserId, 25, {
      incrementAccepted: true,
    });

    await this.feed.syncAnswerToFeed(answerId);
  }

  async endorseExpert(
    fromUserId: number,
    expertProfileId: string,
    skill: string,
    message?: string,
  ): Promise<void> {
    await this.prisma.expertEndorsement.create({
      data: {
        expertProfileId,
        endorsedByUserId: fromUserId,
        skill,
        message,
      },
    });
    const profile = await this.prisma.expertProfile.findUniqueOrThrow({
      where: { id: expertProfileId },
    });
    await this.experts.adjustReputation(profile.userId, 5);
  }

  async moderateQuestion(id: string, status: string): Promise<void> {
    await this.prisma.expertQaQuestion.update({
      where: { id },
      data: { moderationStatus: status as never },
    });
  }

  async moderateAnswer(id: string, status: string): Promise<void> {
    await this.prisma.expertQaAnswer.update({
      where: { id },
      data: { moderationStatus: status as never },
    });
  }

  async sitemapSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    const rows = await this.prisma.expertQaQuestion.findMany({
      where: { moderationStatus: 'VISIBLE', status: { not: 'HIDDEN' } },
      select: { slug: true, updatedAt: true },
    });
    return rows.map((r) => ({
      slug: r.slug,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  private async syncTags(questionId: string, tags: string[]): Promise<void> {
    for (const name of tags) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').slice(0, 60);
      const tag = await this.prisma.expertQaTag.upsert({
        where: { slug },
        create: { slug, name },
        update: { name },
      });
      await this.prisma.expertQaQuestionTag.upsert({
        where: { questionId_tagId: { questionId, tagId: tag.id } },
        create: { questionId, tagId: tag.id },
        update: {},
      });
    }
  }

  private toSummary(row: {
    id: string;
    slug: string;
    title: string;
    body: string;
    trade: string | null;
    anonymous: boolean;
    status: string;
    voteScore: number;
    viewCount: number;
    acceptedAnswerId: string | null;
    createdAt: Date;
    tags: { tag: { slug: string } }[];
    _count?: { answers: number };
  }): ExpertQaQuestionSummary {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: excerpt(row.body),
      trade: row.trade,
      anonymous: row.anonymous,
      status: row.status as ExpertQaQuestionSummary['status'],
      voteScore: row.voteScore,
      answerCount: row._count?.answers ?? 0,
      viewCount: row.viewCount,
      hasAcceptedAnswer: row.acceptedAnswerId != null,
      tagSlugs: row.tags.map((t) => t.tag.slug),
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toDetail(
    row: Prisma.ExpertQaQuestionGetPayload<{
      include: typeof QUESTION_INCLUDE;
    }>,
  ): ExpertQaQuestionDetail {
    const author =
      !row.anonymous && row.author
        ? {
            userId: row.author.id,
            displayName: row.author.worker
              ? `${row.author.worker.firstName} ${row.author.worker.lastName}`
              : row.author.username,
          }
        : null;

    return {
      ...this.toSummary({
        ...row,
        _count: { answers: row.answers.length },
      }),
      body: row.body,
      companyId: row.companyId,
      projectId: row.projectId,
      author,
      acceptedAnswerId: row.acceptedAnswerId,
      attachments: row.attachments.map((a) => ({
        id: a.id,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        mimeType: a.mimeType,
        type: a.type,
      })),
      answers: row.answers.map((a) => ({
        id: a.id,
        questionId: a.questionId,
        body: a.body,
        voteScore: a.voteScore,
        isExpertAnswer: a.isExpertAnswer,
        isAccepted: a.id === row.acceptedAnswerId,
        author: {
          userId: a.authorUserId,
          displayName: a.author.worker
            ? `${a.author.worker.firstName} ${a.author.worker.lastName}`
            : a.author.username,
          badgeLevel: a.author.expertProfile?.badgeLevel as never,
          verified: a.author.expertProfile?.verifiedAt != null,
        },
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }
}
