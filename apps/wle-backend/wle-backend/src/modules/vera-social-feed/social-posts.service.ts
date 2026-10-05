import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CommentPostDto,
  CreatePostDto,
  EditPostDto,
  FollowDto,
  MediaUploadDto,
  PinPostDto,
  ReportPostDto,
} from './dto/social-post.dto';
import { ModerationReportService } from '../vera-moderation/moderation-report.service';
import { SocialTrendingService } from './social-trending.service';

@Injectable()
export class SocialPostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trending: SocialTrendingService,
    private readonly moderationReports: ModerationReportService,
  ) {}

  async create(userId: number, dto: CreatePostDto) {
    const post = await this.prisma.socialPost.create({
      data: {
        authorUserId: userId,
        title: dto.title?.trim() ?? null,
        body: dto.body.trim(),
        postType: dto.postType ?? 'PROVIDER_POST',
        visibility: dto.visibility ?? 'PUBLIC',
        companyId: dto.companyId,
        trainingProviderId: dto.trainingProviderId,
        metadata: { announcement: dto.postType === 'TRAINING_UPLOAD' },
      },
    });
    if (dto.mediaUrls?.length) {
      await this.prisma.mediaAttachment.createMany({
        data: dto.mediaUrls.map((url) => ({
          postId: post.id,
          uploaderUserId: userId,
          fileType: inferFileType(url),
          url,
        })),
      });
    }
    await this.trending.refreshPostMetrics(post.id);
    return this.getPostById(post.id, userId);
  }

  async edit(userId: number, dto: EditPostDto) {
    await this.assertAuthor(dto.postId, userId);
    await this.prisma.socialPost.update({
      where: { id: dto.postId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.body !== undefined ? { body: dto.body.trim() } : {}),
      },
    });
    return this.getPostById(dto.postId, userId);
  }

  async deletePost(postId: string, userId: number) {
    await this.assertAuthor(postId, userId);
    await this.prisma.socialPost.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  async like(postId: string, userId: number) {
    await this.assertPost(postId);
    await this.prisma.postLike.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {},
    });
    await this.trending.refreshPostMetrics(postId);
    return this.getPostById(postId, userId);
  }

  async unlike(postId: string, userId: number) {
    await this.prisma.postLike.deleteMany({ where: { postId, userId } });
    await this.trending.refreshPostMetrics(postId);
    return this.getPostById(postId, userId);
  }

  async comment(userId: number, dto: CommentPostDto) {
    await this.assertPost(dto.postId);
    await this.prisma.postComment.create({
      data: {
        postId: dto.postId,
        userId,
        body: dto.body.trim(),
        parentId: dto.parentId ?? null,
      },
    });
    await this.trending.refreshPostMetrics(dto.postId);
    return this.listComments(dto.postId);
  }

  async deleteComment(commentId: string, userId: number) {
    const row = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });
    if (!row) throw new NotFoundException('Comment not found');
    if (row.userId !== userId) throw new ForbiddenException();
    await this.prisma.postComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
    return this.listComments(row.postId);
  }

  async share(postId: string) {
    await this.assertPost(postId);
    await this.prisma.socialPost.update({
      where: { id: postId },
      data: { shareCount: { increment: 1 } },
    });
    await this.trending.refreshPostMetrics(postId);
    return { ok: true };
  }

  async pin(userId: number, dto: PinPostDto) {
    await this.assertPost(dto.postId);
    await this.prisma.pinnedPost.upsert({
      where: { postId: dto.postId },
      create: {
        postId: dto.postId,
        pinnedByUserId: userId,
        scope: dto.scope ?? 'global',
        scopeKey: dto.scopeKey ?? null,
      },
      update: {
        pinnedByUserId: userId,
        scope: dto.scope ?? 'global',
        scopeKey: dto.scopeKey ?? null,
        pinnedAt: new Date(),
      },
    });
    return { ok: true };
  }

  async unpin(postId: string) {
    await this.prisma.pinnedPost.deleteMany({ where: { postId } });
    return { ok: true };
  }

  async report(userId: number, dto: ReportPostDto) {
    await this.assertPost(dto.postId);
    const reason = mapReportReason(dto.reason);
    let caseId: string | undefined;
    try {
      const result = await this.moderationReports.reportPost(
        userId,
        'SOCIAL_POST',
        dto.postId,
        reason,
        dto.reason.trim(),
      );
      caseId = result.caseId;
    } catch (e) {
      if (!(e instanceof ConflictException)) throw e;
    }
    await this.prisma.postModerationFlag.create({
      data: {
        postId: dto.postId,
        reporterUserId: userId,
        reason: dto.reason.trim(),
      },
    });
    return { ok: true, caseId };
  }

  async follow(userId: number, dto: FollowDto) {
    await this.prisma.followRelationship.upsert({
      where: {
        followerUserId_targetType_targetId: {
          followerUserId: userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
      create: {
        followerUserId: userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
      update: {},
    });
    return { ok: true, following: true };
  }

  async unfollow(userId: number, dto: FollowDto) {
    await this.prisma.followRelationship.deleteMany({
      where: {
        followerUserId: userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });
    return { ok: true, following: false };
  }

  async save(postId: string, userId: number) {
    await this.assertPost(postId);
    await this.prisma.savedPost.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {},
    });
    return { saved: true };
  }

  async uploadMedia(userId: number, dto: MediaUploadDto) {
    return this.prisma.mediaAttachment.create({
      data: {
        postId: dto.postId ?? null,
        uploaderUserId: userId,
        fileType: dto.fileType,
        url: dto.url,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
      },
    });
  }

  async listProviderPosts(providerId: number, limit = 20) {
    const posts = await this.prisma.socialPost.findMany({
      where: { trainingProviderId: providerId, deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { select: { id: true, username: true } },
        media: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    return posts.map((p) => ({
      id: p.id,
      postType: p.postType,
      title: p.title,
      body: p.body,
      publishedAt: p.publishedAt.toISOString(),
      author: p.author,
      engagement: {
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        shareCount: p.shareCount,
      },
    }));
  }

  async getProviderProfile(providerId: number) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');
    const profile = await this.prisma.providerProfile.upsert({
      where: { trainingProviderId: providerId },
      create: {
        trainingProviderId: providerId,
        displayName: provider.name,
        logoUrl: provider.logoUrl,
        websiteUrl: provider.website,
      },
      update: {},
    });
    const postCount = await this.prisma.socialPost.count({
      where: { trainingProviderId: providerId, deletedAt: null },
    });
    return { ...profile, postCount, provider };
  }

  async listComments(postId: string) {
    const rows = await this.prisma.postComment.findMany({
      where: { postId, deletedAt: null, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, username: true } },
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, username: true } } },
        },
      },
    });
    return rows;
  }

  async getPostById(postId: string, viewerId?: number) {
    const post = await this.prisma.socialPost.findFirst({
      where: { id: postId, deletedAt: null },
      include: {
        author: { select: { id: true, username: true } },
        media: true,
        pinnedEntry: true,
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    const likedByMe = viewerId
      ? !!(await this.prisma.postLike.findUnique({
          where: { postId_userId: { postId, userId: viewerId } },
        }))
      : false;
    const savedByMe = viewerId
      ? !!(await this.prisma.savedPost.findUnique({
          where: { postId_userId: { postId, userId: viewerId } },
        }))
      : false;
    return {
      kind: 'post' as const,
      id: post.id,
      postType: post.postType,
      title: post.title,
      body: post.body,
      publishedAt: post.publishedAt.toISOString(),
      author: post.author,
      media: post.media,
      pinned: !!post.pinnedEntry,
      engagement: {
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        shareCount: post.shareCount,
        likedByMe,
        savedByMe,
      },
    };
  }

  private async assertPost(postId: string) {
    const p = await this.prisma.socialPost.findFirst({
      where: { id: postId, deletedAt: null },
    });
    if (!p) throw new NotFoundException('Post not found');
    return p;
  }

  private async assertAuthor(postId: string, userId: number) {
    const p = await this.assertPost(postId);
    if (p.authorUserId !== userId) throw new ForbiddenException();
    return p;
  }
}

function mapReportReason(
  text: string,
):
  | 'SPAM'
  | 'HARASSMENT'
  | 'MISINFORMATION'
  | 'OFF_TOPIC'
  | 'IMPERSONATION'
  | 'SAFETY_RISK'
  | 'OTHER' {
  const t = text.toLowerCase();
  if (t.includes('spam')) return 'SPAM';
  if (t.includes('harass')) return 'HARASSMENT';
  if (t.includes('imperson')) return 'IMPERSONATION';
  if (t.includes('misinfo') || t.includes('false')) return 'MISINFORMATION';
  if (t.includes('off topic')) return 'OFF_TOPIC';
  if (t.includes('safety')) return 'SAFETY_RISK';
  return 'OTHER';
}

function inferFileType(url: string): string {
  const lower = url.toLowerCase();
  if (/\.(pdf)(\?|$)/.test(lower)) return 'pdf';
  if (/\.(mp4|webm|mov)(\?|$)/.test(lower)) return 'video';
  return 'image';
}
