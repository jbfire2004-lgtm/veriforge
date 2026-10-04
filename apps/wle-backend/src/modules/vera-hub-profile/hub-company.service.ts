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
  HubCompanyMemberDto,
  HubCompanyPageDto,
  HubCompanyPostDto,
  UpdateHubCompanyPageDto,
} from './hub-company.types';
import type { CreatePostDto } from '../vera-social-feed/dto/social-post.dto';

const ADMIN_ROLES: UserRole[] = [
  UserRole.COMPANY_ADMIN,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

@Injectable()
export class HubCompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly follow: HubFollowService,
    private readonly feed: HubFeedService,
  ) {}

  async getPage(
    viewerUserId: number,
    companyId: number,
  ): Promise<HubCompanyPageDto> {
    const page = await this.getOrCreatePage(companyId);
    await this.syncMembers(page.id, companyId);

    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
    });

    const [following, memberCount, openJobCount, canManage] = await Promise.all(
      [
        this.follow.isFollowing(viewerUserId, 'COMPANY', String(companyId)),
        this.prisma.hubCompanyMember.count({
          where: { companyPageId: page.id },
        }),
        this.prisma.jobPost.count({
          where: { companyId, active: true },
        }),
        this.canManage(viewerUserId, companyId, page.id),
      ],
    );

    const specialties = Array.isArray(page.specialties)
      ? (page.specialties as string[])
      : [];

    return {
      id: page.id,
      companyId,
      companyName: company.name,
      bannerUrl: page.bannerUrl ?? company.logoUrl,
      logoUrl: page.logoUrl ?? company.logoUrl,
      tagline: page.tagline,
      about: page.about,
      industry: page.industry ?? company.industry,
      specialties,
      websiteUrl: page.websiteUrl,
      isProviderChannel: page.isProviderChannel,
      followerCount: page.followerCount,
      published: page.published,
      location: { city: company.city, region: company.province },
      following,
      canManage,
      memberCount,
      openJobCount,
    };
  }

  async updatePage(
    userId: number,
    companyId: number,
    dto: UpdateHubCompanyPageDto,
  ) {
    const page = await this.getOrCreatePage(companyId);
    await this.assertCanManage(userId, companyId, page.id);

    return this.prisma.hubCompanyPage.update({
      where: { id: page.id },
      data: {
        ...(dto.bannerUrl !== undefined ? { bannerUrl: dto.bannerUrl } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
        ...(dto.tagline !== undefined ? { tagline: dto.tagline.trim() } : {}),
        ...(dto.about !== undefined ? { about: dto.about.trim() } : {}),
        ...(dto.industry !== undefined ? { industry: dto.industry } : {}),
        ...(dto.specialties !== undefined
          ? { specialties: dto.specialties }
          : {}),
        ...(dto.websiteUrl !== undefined ? { websiteUrl: dto.websiteUrl } : {}),
        ...(dto.published !== undefined ? { published: dto.published } : {}),
      },
    });
  }

  async listMembers(companyId: number): Promise<HubCompanyMemberDto[]> {
    const page = await this.getOrCreatePage(companyId);
    await this.syncMembers(page.id, companyId);

    const rows = await this.prisma.hubCompanyMember.findMany({
      where: { companyPageId: page.id, endDate: null },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      take: 50,
      include: {
        user: {
          include: {
            worker: true,
            hubWorkerProfile: true,
          },
        },
      },
    });

    return rows.map((m) => ({
      userId: m.userId,
      displayName: this.displayName(m.user),
      title: m.title,
      role: m.role,
      photoUrl:
        m.user.hubWorkerProfile?.photoUrl ?? m.user.worker?.photoUrl ?? null,
      primaryTrade: m.user.hubWorkerProfile?.primaryTrade ?? null,
    }));
  }

  async listPosts(companyId: number, limit = 20): Promise<HubCompanyPostDto[]> {
    const posts = await this.prisma.socialPost.findMany({
      where: { companyId, deletedAt: null },
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

  async createPost(userId: number, companyId: number, dto: CreatePostDto) {
    const page = await this.getOrCreatePage(companyId);
    await this.assertCanManage(userId, companyId, page.id);

    return this.feed.createPost(userId, {
      ...dto,
      companyId,
      postType: dto.postType ?? 'COMPANY_ANNOUNCEMENT',
      visibility: dto.visibility ?? 'PUBLIC',
    });
  }

  private async getOrCreatePage(companyId: number) {
    const existing = await this.prisma.hubCompanyPage.findUnique({
      where: { companyId },
    });
    if (existing) return existing;

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    return this.prisma.hubCompanyPage.create({
      data: {
        companyId,
        about: `${company.name} on Vera Hub.`,
        industry: company.industry,
        logoUrl: company.logoUrl,
        specialties: [],
      },
    });
  }

  private async syncMembers(companyPageId: string, companyId: number) {
    const users = await this.prisma.user.findMany({
      where: { companyId, active: true },
      select: { id: true, role: true, worker: { select: { id: true } } },
      take: 200,
    });

    for (const user of users) {
      const role = ADMIN_ROLES.includes(user.role) ? 'ADMIN' : 'EMPLOYEE';

      await this.prisma.hubCompanyMember.upsert({
        where: {
          companyPageId_userId: { companyPageId, userId: user.id },
        },
        create: {
          companyPageId,
          userId: user.id,
          workerId: user.worker?.id,
          role: role as 'ADMIN' | 'EMPLOYEE' | 'FEATURED',
        },
        update: {
          workerId: user.worker?.id,
          ...(ADMIN_ROLES.includes(user.role)
            ? { role: 'ADMIN' as const }
            : {}),
        },
      });
    }
  }

  private async canManage(
    userId: number,
    companyId: number,
    companyPageId: string,
  ) {
    try {
      await this.assertCanManage(userId, companyId, companyPageId);
      return true;
    } catch {
      return false;
    }
  }

  private async assertCanManage(
    userId: number,
    companyId: number,
    companyPageId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException();

    if (user.companyId === companyId && ADMIN_ROLES.includes(user.role)) {
      return;
    }

    const member = await this.prisma.hubCompanyMember.findFirst({
      where: {
        companyPageId,
        userId,
        role: 'ADMIN',
      },
    });
    if (member) return;

    throw new ForbiddenException('Company admin required');
  }

  private displayName(user: {
    username: string;
    worker?: { firstName: string; lastName: string } | null;
  }) {
    if (user.worker) {
      return `${user.worker.firstName} ${user.worker.lastName}`.trim();
    }
    return user.username;
  }
}
