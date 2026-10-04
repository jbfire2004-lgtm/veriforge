import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { TrendingTopicDto } from './hub-homepage.types';

@Injectable()
export class TrendingTopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId?: number, take = 8): Promise<TrendingTopicDto[]> {
    const topics = await this.prisma.trendingTopic.findMany({
      where: {
        active: true,
        ...(companyId ? { OR: [{ companyId }, { companyId: null }] } : {}),
      },
      orderBy: [{ rankScore: 'desc' }, { viewCount: 'desc' }],
      take,
    });
    return topics.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
      category: t.category,
      viewCount: t.viewCount,
    }));
  }
}
