import { Injectable } from '@nestjs/common';
import type { SeoSitemapEntry, SeoSitemapIndex } from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { absoluteUrl, resolveSiteUrl } from './seo.utils';

@Injectable()
export class SeoIndexService {
  constructor(private readonly prisma: PrismaService) {}

  async buildSitemap(): Promise<SeoSitemapIndex> {
    const siteUrl = resolveSiteUrl();
    const [articles, jobs, profiles, questions] = await Promise.all([
      this.indexArticles(),
      this.indexJobs(),
      this.indexProfiles(),
      this.indexQuestions(),
    ]);

    const staticEntries: SeoSitemapEntry[] = [
      {
        type: 'ARTICLE',
        path: '/',
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 1,
        title: 'Vera',
      },
      {
        type: 'ARTICLE',
        path: '/safety',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9,
        title: 'Safety blog',
      },
      {
        type: 'ARTICLE',
        path: '/safety/search',
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        type: 'QA_QUESTION',
        path: '/experts',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9,
        title: 'Expert Q&A',
      },
      {
        type: 'JOB',
        path: '/jobs',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9,
        title: 'Job board',
      },
    ];

    const entries = [
      ...staticEntries,
      ...articles,
      ...jobs,
      ...profiles,
      ...questions,
    ];

    return {
      siteUrl,
      generatedAt: new Date().toISOString(),
      entries,
      counts: {
        articles: articles.length,
        jobs: jobs.length,
        profiles: profiles.length,
        questions: questions.length,
        total: entries.length,
      },
    };
  }

  async indexArticles(): Promise<SeoSitemapEntry[]> {
    const rows = await this.prisma.safetyArticle.findMany({
      where: { status: 'PUBLISHED', active: true },
      select: { slug: true, title: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      type: 'ARTICLE' as const,
      path: `/safety/${r.slug}`,
      lastModified: r.updatedAt.toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      title: r.title,
    }));
  }

  async indexJobs(): Promise<SeoSitemapEntry[]> {
    const rows = await this.prisma.jobPost.findMany({
      where: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      select: { slug: true, title: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      type: 'JOB' as const,
      path: `/jobs/${r.slug}`,
      lastModified: r.updatedAt.toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
      title: r.title,
    }));
  }

  async indexProfiles(): Promise<SeoSitemapEntry[]> {
    const [experts, workers] = await Promise.all([
      this.prisma.expertProfile.findMany({
        where: {
          OR: [{ verifiedAt: { not: null } }, { answerCount: { gt: 0 } }],
        },
        select: {
          userId: true,
          headline: true,
          updatedAt: true,
          user: {
            select: {
              username: true,
              worker: { select: { firstName: true, lastName: true } },
            },
          },
        },
        take: 500,
        orderBy: { reputationScore: 'desc' },
      }),
      this.prisma.jobBoardWorkerProfile.findMany({
        where: { openToWork: true },
        select: {
          workerId: true,
          headline: true,
          updatedAt: true,
          worker: { select: { firstName: true, lastName: true } },
        },
        take: 500,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const expertEntries: SeoSitemapEntry[] = experts.map((e) => ({
      type: 'PROFILE' as const,
      path: `/experts/profile/${e.userId}`,
      lastModified: e.updatedAt.toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      title:
        e.headline ??
        (e.user.worker
          ? `${e.user.worker.firstName} ${e.user.worker.lastName}`
          : e.user.username),
    }));

    const workerEntries: SeoSitemapEntry[] = workers.map((w) => ({
      type: 'PROFILE' as const,
      path: `/jobs/workers/${w.workerId}`,
      lastModified: w.updatedAt.toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
      title: w.headline ?? `${w.worker.firstName} ${w.worker.lastName}`,
    }));

    return [...expertEntries, ...workerEntries];
  }

  async indexQuestions(): Promise<SeoSitemapEntry[]> {
    const rows = await this.prisma.expertQaQuestion.findMany({
      where: { moderationStatus: 'VISIBLE', status: { not: 'HIDDEN' } },
      select: { slug: true, title: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      type: 'QA_QUESTION' as const,
      path: `/experts/questions/${r.slug}`,
      lastModified: r.updatedAt.toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
      title: r.title,
    }));
  }

  toXml(index: SeoSitemapIndex): string {
    const urls = index.entries
      .map((e) => {
        const loc = absoluteUrl(e.path, index.siteUrl);
        return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${e.lastModified.slice(0, 10)}</lastmod>
    <changefreq>${e.changeFrequency}</changefreq>
    <priority>${e.priority.toFixed(2)}</priority>
  </url>`;
      })
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
