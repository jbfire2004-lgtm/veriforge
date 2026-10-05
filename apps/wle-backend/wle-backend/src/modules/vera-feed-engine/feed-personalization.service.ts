import { Injectable } from '@nestjs/common';
import type { FeedSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { HubUserContext } from '../vera-hub-homepage/hub-homepage.types';
import { mapJwtRoleToHubRole } from '../vera-hub-homepage/hub-role.utils';
import type { FeedRankingContext } from './feed-ranking.engine';

@Injectable()
export class FeedPersonalizationService {
  constructor(private readonly prisma: PrismaService) {}

  resolveContext(user: {
    id: number;
    role: string;
    companyId?: number | null;
    unionHallId?: number | null;
    worker?: { id: number } | null;
  }): HubUserContext {
    return {
      userId: user.id,
      role: user.role,
      hubRole: mapJwtRoleToHubRole(user.role),
      companyId: user.companyId ?? undefined,
      unionHallId: user.unionHallId ?? undefined,
      workerId: user.worker?.id,
    };
  }

  feedSourceFilter(
    ctx: HubUserContext,
    hidden: FeedSource[],
  ): { source?: { notIn: FeedSource[] } } {
    const hiddenSet = new Set(hidden);
    if (ctx.hubRole === 'WORKER') hiddenSet.add('COMPANY_ANNOUNCEMENT');
    if (ctx.hubRole === 'UNION_HALL') hiddenSet.add('VERA_CORE_EQUIPMENT');
    const notIn = [...hiddenSet];
    return notIn.length ? { source: { notIn } } : {};
  }

  companyScope(ctx: HubUserContext) {
    if (ctx.hubRole === 'UNION_HALL' && ctx.unionHallId) {
      return { unionHallId: ctx.unionHallId };
    }
    if (ctx.companyId) {
      return { OR: [{ companyId: ctx.companyId }, { companyId: null }] };
    }
    return {};
  }

  async buildRankingContext(userId: number): Promise<FeedRankingContext> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        worker: {
          include: {
            projectAssignments: {
              where: { status: 'ACTIVE' },
              select: { projectId: true },
            },
          },
        },
      },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const interactions = await this.prisma.feedInteraction.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: {
        feedItemId: true,
        type: true,
        feedItem: { select: { source: true } },
      },
    });

    const sourceAffinity: Partial<Record<FeedSource, number>> = {};
    for (const i of interactions) {
      const src = i.feedItem.source;
      sourceAffinity[src] = (sourceAffinity[src] ?? 0) + 1;
    }

    const subs = await this.prisma.feedSubscription.findMany({
      where: { userId },
    });
    const subscriptions = subs.map((s) => {
      if (s.targetType === 'SOURCE') return s.targetKey;
      return `${s.targetType.toLowerCase()}:${s.targetKey}`;
    });

    const trades: string[] = [];
    if (user.worker) {
      const jobs = await this.prisma.jobPost.findMany({
        where: { active: true, trade: { not: null } },
        select: { trade: true },
        take: 5,
      });
      for (const j of jobs) {
        if (j.trade) trades.push(j.trade);
      }
    }

    return {
      userId,
      role: user.role,
      companyId: user.companyId ?? undefined,
      projectIds: user.worker?.projectAssignments.map((a) => a.projectId) ?? [],
      trades,
      sourceAffinity,
      interactedItemIds: new Set(interactions.map((i) => i.feedItemId)),
      subscriptions,
    };
  }
}
