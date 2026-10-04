import { Injectable } from '@nestjs/common';
import { FeedSource } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CompanyAnnouncementIntegration {
  constructor(private readonly prisma: PrismaService) {}

  async syncToFeed(companyId?: number): Promise<number> {
    const items = await this.prisma.notification.findMany({
      where: {
        type: 'ANNOUNCEMENT',
        ...(companyId ? { user: { companyId } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    let count = 0;
    for (const n of items) {
      const externalId = `announcement-${n.id}`;
      await this.prisma.feedItem.upsert({
        where: {
          source_externalId: {
            source: FeedSource.COMPANY_ANNOUNCEMENT,
            externalId,
          },
        },
        create: {
          source: FeedSource.COMPANY_ANNOUNCEMENT,
          externalId,
          title: n.title,
          summary: n.body?.slice(0, 300) ?? null,
          publishedAt: n.createdAt,
          companyId: companyId ?? undefined,
          url:
            typeof n.payload === 'object' &&
            n.payload !== null &&
            'url' in n.payload &&
            typeof (n.payload as { url?: string }).url === 'string'
              ? (n.payload as { url: string }).url
              : undefined,
          metadata: { notificationId: n.id, priority: 'normal' },
          rankScore: 1,
        },
        update: {
          title: n.title,
          summary: n.body?.slice(0, 300) ?? undefined,
        },
      });
      count += 1;
    }
    return count;
  }
}
