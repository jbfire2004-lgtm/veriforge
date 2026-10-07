import { Injectable } from '@nestjs/common';
import type { ExpertProfile as ExpertProfileDto } from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { badgeLevelFromReputation } from './expert-qa-ranking';

@Injectable()
export class ExpertProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: number) {
    return this.prisma.expertProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { user: { include: { worker: true } } },
    });
  }

  async getByUserId(userId: number): Promise<ExpertProfileDto | null> {
    const row = await this.prisma.expertProfile.findUnique({
      where: { userId },
      include: {
        user: { include: { worker: true } },
        endorsements: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!row) return null;
    return this.toDto(row);
  }

  async verifyExpert(userId: number): Promise<void> {
    await this.getOrCreate(userId);
    await this.prisma.expertProfile.update({
      where: { userId },
      data: { verifiedAt: new Date() },
    });
  }

  async adjustReputation(
    userId: number,
    delta: number,
    opts?: { incrementAnswers?: boolean; incrementAccepted?: boolean },
  ): Promise<void> {
    const profile = await this.getOrCreate(userId);
    const reputationScore = Math.max(0, profile.reputationScore + delta);
    await this.prisma.expertProfile.update({
      where: { userId },
      data: {
        reputationScore,
        badgeLevel: badgeLevelFromReputation(reputationScore) as never,
        ...(opts?.incrementAnswers ? { answerCount: { increment: 1 } } : {}),
        ...(opts?.incrementAccepted ? { acceptedCount: { increment: 1 } } : {}),
      },
    });
  }

  private toDto(row: {
    id: string;
    userId: number;
    headline: string | null;
    bio: string | null;
    trade: string | null;
    verifiedAt: Date | null;
    reputationScore: number;
    badgeLevel: string;
    answerCount: number;
    acceptedCount: number;
    user: {
      username: string;
      worker?: { firstName: string; lastName: string } | null;
    };
  }): ExpertProfileDto {
    const displayName = row.user.worker
      ? `${row.user.worker.firstName} ${row.user.worker.lastName}`
      : row.user.username;
    return {
      id: row.id,
      userId: row.userId,
      displayName,
      headline: row.headline,
      bio: row.bio,
      trade: row.trade,
      verified: row.verifiedAt != null,
      reputationScore: row.reputationScore,
      badgeLevel: row.badgeLevel as ExpertProfileDto['badgeLevel'],
      answerCount: row.answerCount,
      acceptedCount: row.acceptedCount,
    };
  }
}
