import { Injectable } from '@nestjs/common';
import { FeedSource } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type { SafetyArticleDto } from '../hub-homepage.types';

@Injectable()
export class SafetyBlogIntegration {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(companyId?: number, take = 6): Promise<SafetyArticleDto[]> {
    const articles = await this.prisma.safetyArticle.findMany({
      where: {
        status: 'PUBLISHED',
        active: true,
        ...(companyId ? { OR: [{ companyId }, { companyId: null }] } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take,
    });
    return articles.map((a) => this.toDto(a));
  }

  async syncToFeed(companyId?: number): Promise<number> {
    const articles = await this.listActive(companyId, 10);
    for (const article of articles) {
      await this.prisma.feedItem.upsert({
        where: {
          source_externalId: {
            source: FeedSource.SAFETY_BLOG,
            externalId: article.id,
          },
        },
        create: {
          source: FeedSource.SAFETY_BLOG,
          externalId: article.id,
          title: article.title,
          summary: article.excerpt ?? undefined,
          imageUrl: article.imageUrl ?? undefined,
          publishedAt: new Date(article.publishedAt),
          companyId: companyId ?? undefined,
          url: `/safety/${article.slug}`,
          rankScore: 0.92,
        },
        update: {
          title: article.title,
          summary: article.excerpt ?? undefined,
        },
      });
    }
    return articles.length;
  }

  private toDto(a: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    authorName: string | null;
    imageUrl: string | null;
    category: string;
    readMinutes: number;
    publishedAt: Date;
  }): SafetyArticleDto {
    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      authorName: a.authorName,
      imageUrl: a.imageUrl,
      category: a.category,
      readMinutes: a.readMinutes,
      publishedAt: a.publishedAt.toISOString(),
    };
  }
}
