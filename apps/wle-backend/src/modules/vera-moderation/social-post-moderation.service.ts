import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ModerationResolutionService } from './moderation-resolution.service';

@Injectable()
export class SocialPostModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolution: ModerationResolutionService,
  ) {}

  async listOpenFlags(opts?: { page?: number; pageSize?: number }) {
    const page = opts?.page ?? 1;
    const pageSize = Math.min(opts?.pageSize ?? 25, 100);
    const where = { status: 'OPEN' };

    const [total, rows] = await Promise.all([
      this.prisma.postModerationFlag.count({ where }),
      this.prisma.postModerationFlag.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          reporter: { select: { id: true, username: true } },
          post: {
            select: {
              id: true,
              title: true,
              body: true,
              postType: true,
              publishedAt: true,
              deletedAt: true,
              author: { select: { id: true, username: true } },
            },
          },
        },
      }),
    ]);

    return {
      items: rows.map((r) => ({
        id: r.id,
        postId: r.postId,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        reporter: r.reporter,
        post: r.post
          ? {
              id: r.post.id,
              title: r.post.title,
              body: r.post.body,
              postType: r.post.postType,
              publishedAt: r.post.publishedAt.toISOString(),
              deletedAt: r.post.deletedAt?.toISOString() ?? null,
              author: r.post.author,
            }
          : null,
        moderationCaseId: null as string | null,
      })),
      total,
      page,
      pageSize,
    };
  }

  async resolveFlag(
    flagId: string,
    reviewerUserId: number,
    action: 'DISMISS' | 'HIDE_POST',
    note?: string,
  ) {
    const flag = await this.prisma.postModerationFlag.findUnique({
      where: { id: flagId },
    });
    if (!flag) throw new NotFoundException('Flag not found');

    if (action === 'HIDE_POST') {
      await this.resolution.applyContentHide('SOCIAL_POST', flag.postId);
    }

    await this.prisma.postModerationFlag.update({
      where: { id: flagId },
      data: { status: action === 'HIDE_POST' ? 'RESOLVED' : 'DISMISSED' },
    });

    await this.prisma.moderationCase.updateMany({
      where: {
        targetType: 'SOCIAL_POST',
        targetId: flag.postId,
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
      data: {
        status: 'RESOLVED',
        resolution: action === 'HIDE_POST' ? 'CONTENT_HIDDEN' : 'NO_ACTION',
        resolutionNote: note,
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date(),
      },
    });

    return { ok: true };
  }

  async flagStats() {
    const open = await this.prisma.postModerationFlag.count({
      where: { status: 'OPEN' },
    });
    return { open };
  }
}
