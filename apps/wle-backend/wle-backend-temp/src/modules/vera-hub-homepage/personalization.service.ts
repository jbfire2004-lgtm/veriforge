import { Injectable } from '@nestjs/common';
import type { FeedSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { HubUserContext } from './hub-homepage.types';
import { mapJwtRoleToHubRole, sectionsForHubRole } from './hub-role.utils';

@Injectable()
export class PersonalizationService {
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

  visibleSections(ctx: HubUserContext) {
    return sectionsForHubRole(ctx.hubRole);
  }

  async getPreferences(userId: number) {
    return this.prisma.userHomepagePreferences.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  feedSourceFilter(
    ctx: HubUserContext,
    hidden: FeedSource[],
  ): { source?: { notIn: FeedSource[] } } {
    const hiddenSet = new Set(hidden);
    if (ctx.hubRole === 'WORKER') {
      hiddenSet.add('COMPANY_ANNOUNCEMENT');
    }
    if (ctx.hubRole === 'UNION_HALL') {
      hiddenSet.add('VERA_CORE_EQUIPMENT');
    }
    const notIn = [...hiddenSet];
    return notIn.length ? { source: { notIn } } : {};
  }

  companyScope(ctx: HubUserContext) {
    if (ctx.hubRole === 'UNION_HALL' && ctx.unionHallId) {
      return { unionHallId: ctx.unionHallId };
    }
    if (ctx.companyId) {
      return {
        OR: [{ companyId: ctx.companyId }, { companyId: null }],
      };
    }
    return {};
  }
}
