import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { SafetyBlogComment } from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { SafetyBlogCacheService } from './safety-blog-cache.service';

type CommentRow = {
  id: string;
  postId: string;
  parentId: string | null;
  authorName: string | null;
  body: string;
  upvoteCount: number;
  status: string;
  createdAt: Date;
};

@Injectable()
export class SafetyBlogCommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SafetyBlogCacheService,
  ) {}

  async listForPost(postSlug: string): Promise<SafetyBlogComment[]> {
    const post = await this.prisma.safetyArticle.findFirst({
      where: { slug: postSlug, status: 'PUBLISHED', active: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    const rows = await this.prisma.safetyBlogComment.findMany({
      where: { postId: post.id, status: 'VISIBLE' },
      orderBy: { createdAt: 'asc' },
    });
    return this.buildThread(rows);
  }

  async createComment(input: {
    postId: string;
    parentId?: string;
    userId?: number;
    authorName?: string;
    body: string;
  }): Promise<SafetyBlogComment> {
    const post = await this.prisma.safetyArticle.findUnique({
      where: { id: input.postId },
    });
    if (!post) throw new NotFoundException('Post not found');

    const row = await this.prisma.safetyBlogComment.create({
      data: {
        postId: input.postId,
        parentId: input.parentId,
        userId: input.userId,
        authorName: input.authorName,
        body: input.body,
        status: 'PENDING',
      },
    });
    this.cache.invalidateAll();
    return this.toDto(row);
  }

  async upvote(
    commentId: string,
    voterKey: string,
    userId?: number,
  ): Promise<number> {
    try {
      await this.prisma.safetyBlogCommentVote.create({
        data: { commentId, voterKey, userId },
      });
      const updated = await this.prisma.safetyBlogComment.update({
        where: { id: commentId },
        data: { upvoteCount: { increment: 1 } },
      });
      return updated.upvoteCount;
    } catch {
      throw new ConflictException('Already voted');
    }
  }

  async moderate(commentId: string, status: string): Promise<void> {
    await this.prisma.safetyBlogComment.update({
      where: { id: commentId },
      data: { status: status as never },
    });
    this.cache.invalidateAll();
  }

  async listPending(): Promise<SafetyBlogComment[]> {
    const rows = await this.prisma.safetyBlogComment.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map((r) => this.toDto(r));
  }

  private buildThread(rows: CommentRow[]): SafetyBlogComment[] {
    const map = new Map<string, SafetyBlogComment>();
    const roots: SafetyBlogComment[] = [];

    for (const row of rows) {
      map.set(row.id, { ...this.toDto(row), replies: [] });
    }
    for (const row of rows) {
      const node = map.get(row.id)!;
      if (row.parentId && map.has(row.parentId)) {
        map.get(row.parentId)!.replies!.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  private toDto(row: CommentRow): SafetyBlogComment {
    return {
      id: row.id,
      postId: row.postId,
      parentId: row.parentId,
      authorName: row.authorName,
      body: row.body,
      upvoteCount: row.upvoteCount,
      status: row.status as SafetyBlogComment['status'],
      createdAt: row.createdAt.toISOString(),
    };
  }
}
