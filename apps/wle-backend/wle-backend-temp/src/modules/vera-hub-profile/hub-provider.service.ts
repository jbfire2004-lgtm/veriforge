import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { HubFeedService } from './hub-feed.service';
import { HubFollowService } from './hub-follow.service';
import type {
  HubCompanyPostDto,
  HubProviderChannelDto,
  HubProviderCourseDto,
} from './hub-company.types';
import type { CreatePostDto } from '../vera-social-feed/dto/social-post.dto';

const PROVIDER_ADMIN_ROLES: UserRole[] = [
  UserRole.TRAINING_PROVIDER_ADMIN,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

@Injectable()
export class HubProviderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly follow: HubFollowService,
    private readonly feed: HubFeedService,
  ) {}

  async getChannel(
    viewerUserId: number,
    providerId: number,
  ): Promise<HubProviderChannelDto> {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
      include: { providerProfile: true },
    });
    if (!provider || !provider.active) {
      throw new NotFoundException('Provider not found');
    }

    const profile = provider.providerProfile;
    const [following, courseCount, canManage] = await Promise.all([
      this.follow.isFollowing(viewerUserId, 'PROVIDER', String(providerId)),
      this.prisma.trainingCourse.count({
        where: { providerId, active: true },
      }),
      this.canManageProvider(viewerUserId, providerId),
    ]);

    const followerCount = await this.prisma.followRelationship.count({
      where: { targetType: 'PROVIDER', targetId: String(providerId) },
    });

    return {
      providerId,
      displayName: profile?.displayName ?? provider.name,
      bio: profile?.bio,
      logoUrl: profile?.logoUrl ?? provider.logoUrl,
      bannerUrl: profile?.bannerUrl,
      websiteUrl: profile?.websiteUrl ?? provider.website,
      followerCount,
      following,
      courseCount,
      canManage,
    };
  }

  async listCourses(providerId: number): Promise<HubProviderCourseDto[]> {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    const courses = await this.prisma.trainingCourse.findMany({
      where: { providerId, active: true },
      orderBy: { name: 'asc' },
      take: 50,
    });

    return courses.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      durationHours: c.durationHours,
    }));
  }

  async listPosts(
    providerId: number,
    limit = 20,
  ): Promise<HubCompanyPostDto[]> {
    const posts = await this.prisma.socialPost.findMany({
      where: { trainingProviderId: providerId, deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: {
        author: { include: { worker: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return posts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      publishedAt: p.publishedAt.toISOString(),
      authorName: p.author.worker
        ? `${p.author.worker.firstName} ${p.author.worker.lastName}`.trim()
        : p.author.username,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    }));
  }

  async createPost(userId: number, providerId: number, dto: CreatePostDto) {
    await this.assertCanManageProvider(userId, providerId);

    return this.feed.createPost(userId, {
      ...dto,
      trainingProviderId: providerId,
      postType: dto.postType ?? 'PROVIDER_POST',
      visibility: dto.visibility ?? 'PUBLIC',
    });
  }

  private async canManageProvider(userId: number, providerId: number) {
    try {
      await this.assertCanManageProvider(userId, providerId);
      return true;
    } catch {
      return false;
    }
  }

  private async assertCanManageProvider(userId: number, providerId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException();

    if (
      user.trainingProviderId === providerId &&
      PROVIDER_ADMIN_ROLES.includes(user.role)
    ) {
      return;
    }
    if (
      PROVIDER_ADMIN_ROLES.includes(user.role) &&
      user.role !== UserRole.TRAINING_PROVIDER_ADMIN
    ) {
      return;
    }

    throw new ForbiddenException('Provider admin required');
  }
}
