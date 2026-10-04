import { Injectable } from '@nestjs/common';
import { FeedSource } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

/** Surfaces safety blog / compliance notes as expert Q&A style feed items. */
@Injectable()
export class ExpertAnswerIntegration {
  constructor(private readonly prisma: PrismaService) {}

  async syncToFeed(companyId?: number): Promise<number> {
    const notes = await this.prisma.coreComplianceNote.findMany({
      where: {
        status: 'ACTIVE',
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { createdBy: true },
    });

    let count = 0;
    for (const n of notes) {
      const externalId = `expert-${n.id}`;
      await this.prisma.feedItem.upsert({
        where: {
          source_externalId: {
            source: FeedSource.EXPERT_ANSWER,
            externalId,
          },
        },
        create: {
          source: FeedSource.EXPERT_ANSWER,
          externalId,
          title: n.title,
          summary: n.body?.slice(0, 200) ?? 'Expert safety guidance',
          body: n.body ?? undefined,
          publishedAt: n.createdAt,
          companyId: n.companyId ?? undefined,
          url: `/core/compliance-notes/${n.id}`,
          metadata: {
            expertId: n.createdByUserId,
            category: 'compliance',
          },
          rankScore: 0.9,
        },
        update: {
          title: n.title,
          summary: n.body?.slice(0, 200) ?? undefined,
        },
      });
      count += 1;
    }
    return count;
  }
}
