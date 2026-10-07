import { Injectable } from '@nestjs/common';
import { HubConnectionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { HubSuggestionsDto } from './hub-company.types';

@Injectable()
export class HubSuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(userId: number): Promise<HubSuggestionsDto> {
    const [people, companies, providers] = await Promise.all([
      this.suggestPeople(userId),
      this.suggestCompanies(userId),
      this.suggestProviders(userId),
    ]);

    return { people, companies, providers };
  }

  private async suggestPeople(userId: number) {
    const viewer = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!viewer?.companyId) return [];

    const colleagues = await this.prisma.user.findMany({
      where: {
        companyId: viewer.companyId,
        active: true,
        id: { not: userId },
      },
      include: {
        worker: true,
        hubWorkerProfile: true,
      },
      take: 20,
    });

    const connected = await this.prisma.hubConnection.findMany({
      where: {
        status: HubConnectionStatus.ACCEPTED,
        OR: [{ requesterUserId: userId }, { addresseeUserId: userId }],
      },
      select: { requesterUserId: true, addresseeUserId: true },
    });
    const connectedIds = new Set(
      connected.flatMap((c) =>
        c.requesterUserId === userId
          ? [c.addresseeUserId]
          : [c.requesterUserId],
      ),
    );

    return colleagues
      .filter((u) => !connectedIds.has(u.id))
      .slice(0, 6)
      .map((u) => ({
        userId: u.id,
        displayName: u.worker
          ? `${u.worker.firstName} ${u.worker.lastName}`.trim()
          : u.username,
        headline:
          u.hubWorkerProfile?.headline ?? u.hubWorkerProfile?.primaryTrade,
        reason: 'Works at your company',
      }));
  }

  private async suggestCompanies(userId: number) {
    const following = await this.prisma.followRelationship.findMany({
      where: { followerUserId: userId, targetType: 'COMPANY' },
      select: { targetId: true },
    });
    const excludeIds = following
      .map((f) => Number(f.targetId))
      .filter((id) => !Number.isNaN(id));

    const viewer = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    const companies = await this.prisma.company.findMany({
      where: {
        ...(viewer?.companyId ? { id: { not: viewer.companyId } } : {}),
        ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
      },
      include: { hubCompanyPage: true },
      take: 12,
      orderBy: { name: 'asc' },
    });

    return companies
      .filter((c) => !c.hubCompanyPage || c.hubCompanyPage.published)
      .slice(0, 6)
      .map((c) => ({
        companyId: c.id,
        name: c.name,
        tagline: c.hubCompanyPage?.tagline,
        logoUrl: c.hubCompanyPage?.logoUrl ?? c.logoUrl,
        industry: c.hubCompanyPage?.industry ?? c.industry,
      }));
  }

  private async suggestProviders(userId: number) {
    const following = await this.prisma.followRelationship.findMany({
      where: { followerUserId: userId, targetType: 'PROVIDER' },
      select: { targetId: true },
    });
    const excludeIds = following
      .map((f) => Number(f.targetId))
      .filter((id) => !Number.isNaN(id));

    const providers = await this.prisma.trainingProvider.findMany({
      where: {
        active: true,
        approvalStatus: 'APPROVED',
        ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
      },
      include: { providerProfile: true },
      take: 6,
      orderBy: { name: 'asc' },
    });

    return providers.map((p) => ({
      providerId: p.id,
      name: p.providerProfile?.displayName ?? p.name,
      bio: p.providerProfile?.bio,
      logoUrl: p.providerProfile?.logoUrl ?? p.logoUrl,
    }));
  }
}
