import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SocialTrendingService {
  constructor(private readonly prisma: PrismaService) {}

  async refreshPostMetrics(postId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [likes, comments, post] = await Promise.all([
      this.prisma.postLike.count({
        where: { postId, createdAt: { gte: since } },
      }),
      this.prisma.postComment.count({
        where: { postId, deletedAt: null, createdAt: { gte: since } },
      }),
      this.prisma.socialPost.findUnique({
        where: { id: postId },
        select: { shareCount: true },
      }),
    ]);
    const hours = 24;
    const likeVelocity = likes / hours;
    const commentVelocity = comments / hours;
    const shareVelocity = (post?.shareCount ?? 0) / hours;
    const score = likeVelocity * 2 + commentVelocity * 3 + shareVelocity * 1.5;

    return this.prisma.postTrendingMetric.upsert({
      where: { postId },
      create: {
        postId,
        likeVelocity,
        commentVelocity,
        shareVelocity,
        score,
      },
      update: {
        likeVelocity,
        commentVelocity,
        shareVelocity,
        score,
        updatedAt: new Date(),
      },
    });
  }

  async listTrending(limit = 20) {
    const rows = await this.prisma.postTrendingMetric.findMany({
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true } },
            media: true,
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
    });
    return rows
      .filter((r) => r.post.deletedAt == null)
      .map((r) => this.serializePost(r.post, { trendingScore: r.score }));
  }

  private serializePost(
    post: {
      id: string;
      postType: string;
      title: string | null;
      body: string;
      publishedAt: Date;
      shareCount: number;
      author: { id: number; username: string };
      media: {
        id: string;
        fileType: string;
        url: string;
        mimeType: string | null;
      }[];
      _count: { likes: number; comments: number };
    },
    extra?: { trendingScore?: number },
  ) {
    return {
      kind: 'post' as const,
      id: post.id,
      postType: post.postType,
      title: post.title,
      body: post.body,
      publishedAt: post.publishedAt.toISOString(),
      author: post.author,
      media: post.media,
      engagement: {
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        shareCount: post.shareCount,
      },
      ...extra,
    };
  }
}
