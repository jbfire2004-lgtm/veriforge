import { Injectable } from '@nestjs/common';
import type { SocialFollowTargetType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FeedEngineService } from '../vera-feed-engine/feed-engine.service';
import type { HubFollowTargetType } from './hub-company.types';

@Injectable()
export class HubFollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly feedEngine: FeedEngineService,
  ) {}

  async isFollowing(
    userId: number,
    targetType: HubFollowTargetType,
    targetId: string,
  ): Promise<boolean> {
    const row = await this.prisma.followRelationship.findUnique({
      where: {
        followerUserId_targetType_targetId: {
          followerUserId: userId,
          targetType: targetType as SocialFollowTargetType,
          targetId,
        },
      },
    });
    return !!row;
  }

  async follow(
    userId: number,
    targetType: HubFollowTargetType,
    targetId: string,
  ) {
    await this.prisma.followRelationship.upsert({
      where: {
        followerUserId_targetType_targetId: {
          followerUserId: userId,
          targetType: targetType as SocialFollowTargetType,
          targetId,
        },
      },
      create: {
        followerUserId: userId,
        targetType: targetType as SocialFollowTargetType,
        targetId,
      },
      update: {},
    });

    if (targetType === 'COMPANY') {
      await this.feedEngine.subscribe(userId, 'COMPANY', targetId);
      await this.refreshCompanyFollowerCount(Number(targetId));
    }

    return { following: true };
  }

  async unfollow(
    userId: number,
    targetType: HubFollowTargetType,
    targetId: string,
  ) {
    await this.prisma.followRelationship.deleteMany({
      where: {
        followerUserId: userId,
        targetType: targetType as SocialFollowTargetType,
        targetId,
      },
    });

    if (targetType === 'COMPANY') {
      await this.prisma.feedSubscription.deleteMany({
        where: {
          userId,
          targetType: 'COMPANY',
          targetKey: targetId,
        },
      });
      await this.refreshCompanyFollowerCount(Number(targetId));
    }

    return { following: false };
  }

  private async refreshCompanyFollowerCount(companyId: number) {
    const count = await this.prisma.followRelationship.count({
      where: { targetType: 'COMPANY', targetId: String(companyId) },
    });
    await this.prisma.hubCompanyPage.updateMany({
      where: { companyId },
      data: { followerCount: count },
    });
  }
}
