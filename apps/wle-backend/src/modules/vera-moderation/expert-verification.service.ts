import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ExpertVerificationRequest as ExpertVerificationDto } from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpertProfileService } from '../vera-expert-qa/expert-profile.service';
import { ModerationNotificationService } from './moderation-notification.service';

@Injectable()
export class ExpertVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly experts: ExpertProfileService,
    private readonly moderationNotifications?: ModerationNotificationService,
  ) {}

  async apply(
    userId: number,
    statement: string,
    tradeEvidence?: string,
  ): Promise<ExpertVerificationDto> {
    const profile = await this.experts.getOrCreate(userId);
    if (profile.verifiedAt) {
      throw new ConflictException('Already verified');
    }

    const pending = await this.prisma.expertVerificationRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (pending) throw new ConflictException('Verification already pending');

    const row = await this.prisma.expertVerificationRequest.create({
      data: {
        userId,
        expertProfileId: profile.id,
        statement,
        tradeEvidence,
        status: 'PENDING',
      },
      include: {
        user: { include: { worker: true } },
        expertProfile: true,
      },
    });

    await this.prisma.moderationCase.create({
      data: {
        source: 'USER_REPORT',
        targetType: 'USER',
        targetId: String(userId),
        reportReason: 'OTHER',
        reportDetails: `Expert verification application: ${statement.slice(
          0,
          200,
        )}`,
        reporterUserId: userId,
        priority: 60,
        status: 'OPEN',
        metadata: { expertVerificationRequestId: row.id },
      },
    });

    return this.toDto(row);
  }

  async listPending(): Promise<ExpertVerificationDto[]> {
    const rows = await this.prisma.expertVerificationRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { submittedAt: 'asc' },
      include: { user: { include: { worker: true } }, expertProfile: true },
    });
    return rows.map((r) => this.toDto(r));
  }

  async review(
    requestId: string,
    reviewerUserId: number,
    status: 'APPROVED' | 'REJECTED',
    reviewNote?: string,
  ): Promise<void> {
    const req = await this.prisma.expertVerificationRequest.findUnique({
      where: { id: requestId },
    });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'PENDING') {
      throw new ConflictException('Request already reviewed');
    }

    if (status === 'APPROVED') {
      await this.experts.verifyExpert(req.userId);
    }

    await this.prisma.expertVerificationRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedByUserId: reviewerUserId,
        reviewNote,
      },
    });

    const openCases = await this.prisma.moderationCase.findMany({
      where: {
        targetType: 'USER',
        targetId: String(req.userId),
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    });
    for (const c of openCases) {
      const meta = c.metadata as Record<string, unknown> | null;
      if (meta?.expertVerificationRequestId === requestId) {
        await this.prisma.moderationCase.update({
          where: { id: c.id },
          data: {
            status: 'RESOLVED',
            resolution:
              status === 'APPROVED' ? 'EXPERT_VERIFIED' : 'EXPERT_REJECTED',
            resolutionNote: reviewNote,
            reviewedByUserId: reviewerUserId,
            reviewedAt: new Date(),
          },
        });
      }
    }

    await this.moderationNotifications?.notifyExpertVerificationReviewed(
      req.userId,
      status,
      reviewNote,
    );
  }

  private toDto(row: {
    id: string;
    userId: number;
    status: string;
    statement: string | null;
    tradeEvidence: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
    reviewNote: string | null;
    user: {
      username: string;
      worker: { firstName: string; lastName: string } | null;
    };
    expertProfile: { headline: string | null; trade: string | null };
  }): ExpertVerificationDto {
    return {
      id: row.id,
      userId: row.userId,
      displayName: row.user.worker
        ? `${row.user.worker.firstName} ${row.user.worker.lastName}`
        : row.user.username,
      headline: row.expertProfile.headline,
      trade: row.expertProfile.trade,
      status: row.status as ExpertVerificationDto['status'],
      statement: row.statement,
      tradeEvidence: row.tradeEvidence,
      submittedAt: row.submittedAt.toISOString(),
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      reviewNote: row.reviewNote,
    };
  }
}
