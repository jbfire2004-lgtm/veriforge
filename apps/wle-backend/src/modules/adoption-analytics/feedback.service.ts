import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackRequestStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdoptionAnalyticsCacheService } from './adoption-analytics-cache.service';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AdoptionAnalyticsCacheService,
  ) {}

  async create(input: {
    title: string;
    description: string;
    category: string;
    companyId?: number | null;
    userId?: number | null;
  }) {
    const row = await this.prisma.feedbackRequest.create({
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category.trim() || 'general',
        companyId: input.companyId ?? null,
        userId: input.userId ?? null,
      },
    });
    this.cache.invalidate('feedback:');
    return row;
  }

  async list(params: {
    status?: FeedbackRequestStatus;
    category?: string;
    sort?: 'upvotes' | 'newest';
    companyId?: number;
    limit?: number;
  }) {
    const orderBy =
      params.sort === 'newest'
        ? { createdAt: 'desc' as const }
        : { upvotes: 'desc' as const };

    return this.prisma.feedbackRequest.findMany({
      where: {
        status: params.status,
        category: params.category,
        companyId: params.companyId,
      },
      orderBy,
      take: params.limit ?? 100,
      include: {
        user: { select: { id: true, username: true, email: true } },
        company: { select: { id: true, name: true } },
      },
    });
  }

  async vote(feedbackId: number, userId: number) {
    const existing = await this.prisma.feedbackVote.findUnique({
      where: { feedbackId_userId: { feedbackId, userId } },
    });
    if (existing) {
      throw new ConflictException('Already voted');
    }

    await this.prisma.$transaction([
      this.prisma.feedbackVote.create({
        data: { feedbackId, userId },
      }),
      this.prisma.feedbackRequest.update({
        where: { id: feedbackId },
        data: { upvotes: { increment: 1 } },
      }),
    ]);

    this.cache.invalidate('feedback:');
    return this.prisma.feedbackRequest.findUnique({
      where: { id: feedbackId },
    });
  }

  async updateStatus(
    feedbackId: number,
    status: FeedbackRequestStatus,
    internalNotes?: string,
  ) {
    const row = await this.prisma.feedbackRequest.findUnique({
      where: { id: feedbackId },
    });
    if (!row) throw new NotFoundException('Feedback not found');

    const updated = await this.prisma.feedbackRequest.update({
      where: { id: feedbackId },
      data: {
        status,
        internalNotes: internalNotes ?? row.internalNotes,
      },
    });
    this.cache.invalidate('feedback:');
    return updated;
  }

  async listForAdmin() {
    return this.cache.wrap('feedback:admin:list', () =>
      this.list({ sort: 'upvotes', limit: 200 }),
    );
  }
}
