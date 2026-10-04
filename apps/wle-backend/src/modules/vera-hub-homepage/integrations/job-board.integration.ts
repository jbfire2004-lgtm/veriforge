import { Injectable } from '@nestjs/common';
import { FeedSource } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type { JobPostDto } from '../hub-homepage.types';

@Injectable()
export class JobBoardIntegration {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(companyId?: number, take = 6): Promise<JobPostDto[]> {
    const posts = await this.prisma.jobPost.findMany({
      where: {
        active: true,
        ...(companyId ? { OR: [{ companyId }, { companyId: null }] } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take,
    });
    return posts.map((p) => this.toDto(p));
  }

  async syncToFeed(companyId?: number): Promise<number> {
    const rows = await this.prisma.jobPost.findMany({
      where: {
        active: true,
        ...(companyId ? { OR: [{ companyId }, { companyId: null }] } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });
    for (const post of rows) {
      const dto = this.toDto(post);
      await this.prisma.feedItem.upsert({
        where: {
          source_externalId: {
            source: FeedSource.JOB_BOARD,
            externalId: dto.id,
          },
        },
        create: {
          source: FeedSource.JOB_BOARD,
          externalId: dto.id,
          title: dto.title,
          summary:
            dto.summary ?? `${dto.companyName} · ${dto.location ?? 'Open'}`,
          publishedAt: new Date(dto.publishedAt),
          companyId: companyId ?? undefined,
          trade: post.trade ?? undefined,
          url: dto.url ?? `/jobs`,
          rankScore: 0.85,
        },
        update: {
          title: dto.title,
          summary: dto.summary ?? undefined,
          trade: post.trade ?? undefined,
          url: dto.url ?? `/jobs`,
        },
      });
    }
    return rows.length;
  }

  private toDto(p: {
    id: string;
    slug: string;
    title: string;
    companyName: string;
    location: string | null;
    trade: string | null;
    payRange: string | null;
    summary: string | null;
    url: string | null;
    publishedAt: Date;
  }): JobPostDto {
    const url = p.url ?? `/jobs/${p.slug}`;
    return {
      id: p.id,
      title: p.title,
      companyName: p.companyName,
      location: p.location,
      trade: p.trade,
      payRange: p.payRange,
      summary: p.summary,
      url,
      publishedAt: p.publishedAt.toISOString(),
    };
  }
}
