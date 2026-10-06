import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  SeoContentType,
  SeoJsonLd,
  SeoMetadata,
} from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import {
  articleJsonLd,
  jobPostingJsonLd,
  profileJsonLd,
  qaPageJsonLd,
} from './seo-schema.generator';
import { absoluteUrl, resolveSiteUrl } from './seo.utils';

@Injectable()
export class SeoMetadataService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetadata(input: {
    type: SeoContentType;
    slug?: string;
    userId?: number;
    workerId?: number;
  }): Promise<SeoMetadata> {
    const base = resolveSiteUrl();
    switch (input.type) {
      case 'ARTICLE':
        return this.articleMetadata(input.slug!, base);
      case 'JOB':
        return this.jobMetadata(input.slug!, base);
      case 'PROFILE':
        if (input.userId != null)
          return this.expertProfileMetadata(input.userId, base);
        if (input.workerId != null)
          return this.workerProfileMetadata(input.workerId, base);
        throw new NotFoundException('Profile id required');
      case 'QA_QUESTION':
        return this.questionMetadata(input.slug!, base);
      default:
        throw new NotFoundException('Unknown content type');
    }
  }

  async getSchema(input: {
    type: SeoContentType;
    slug?: string;
    userId?: number;
    workerId?: number;
  }): Promise<SeoJsonLd> {
    const base = resolveSiteUrl();
    switch (input.type) {
      case 'ARTICLE':
        return this.articleSchema(input.slug!, base);
      case 'JOB':
        return this.jobSchema(input.slug!, base);
      case 'PROFILE':
        if (input.userId != null)
          return this.expertProfileSchema(input.userId, base);
        if (input.workerId != null)
          return this.workerProfileSchema(input.workerId, base);
        throw new NotFoundException('Profile id required');
      case 'QA_QUESTION':
        return this.questionSchema(input.slug!, base);
      default:
        throw new NotFoundException('Unknown content type');
    }
  }

  private async articleMetadata(
    slug: string,
    base: string,
  ): Promise<SeoMetadata> {
    const post = await this.prisma.safetyArticle.findFirst({
      where: { slug, status: 'PUBLISHED', active: true },
    });
    if (!post) throw new NotFoundException('Article not found');
    const canonical = post.canonicalUrl ?? absoluteUrl(`/safety/${slug}`, base);
    const description =
      post.metaDescription ?? post.excerpt ?? post.title.slice(0, 160);
    return {
      title: `${post.title} | Vera Safety`,
      description,
      canonical,
      openGraph: {
        type: 'article',
        title: post.title,
        description,
        url: canonical,
        image: post.imageUrl ?? undefined,
        publishedTime: post.publishedAt.toISOString(),
      },
      twitter: {
        card: post.imageUrl ? 'summary_large_image' : 'summary',
        title: post.title,
        description,
        images: post.imageUrl ? [post.imageUrl] : undefined,
      },
    };
  }

  private async jobMetadata(slug: string, base: string): Promise<SeoMetadata> {
    const job = await this.prisma.jobPost.findFirst({
      where: { slug, active: true },
    });
    if (!job) throw new NotFoundException('Job not found');
    const canonical = absoluteUrl(`/jobs/${slug}`, base);
    const title = `${job.title} · ${job.companyName}`;
    const description =
      job.summary ??
      `${job.trade ?? 'Trade'} role in ${job.location ?? 'Canada'}. ${
        job.payRange ?? ''
      }`.trim();
    return {
      title: `${title} | Vera Jobs`,
      description: description.slice(0, 160),
      canonical,
      openGraph: { type: 'website', title, description, url: canonical },
    };
  }

  private async expertProfileMetadata(
    userId: number,
    base: string,
  ): Promise<SeoMetadata> {
    const profile = await this.prisma.expertProfile.findUnique({
      where: { userId },
      include: { user: { include: { worker: true } } },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    const name = profile.user.worker
      ? `${profile.user.worker.firstName} ${profile.user.worker.lastName}`
      : profile.user.username;
    const canonical = absoluteUrl(`/experts/profile/${userId}`, base);
    const description =
      profile.headline ??
      profile.bio?.slice(0, 160) ??
      `${name} on Vera Experts`;
    return {
      title: `${name} | Vera Expert`,
      description,
      canonical,
      openGraph: { title: name, description, url: canonical },
      robots: { index: true, follow: true },
    };
  }

  private async workerProfileMetadata(
    workerId: number,
    base: string,
  ): Promise<SeoMetadata> {
    const profile = await this.prisma.jobBoardWorkerProfile.findUnique({
      where: { workerId },
      include: { worker: true },
    });
    if (!profile) throw new NotFoundException('Worker profile not found');
    const name = `${profile.worker.firstName} ${profile.worker.lastName}`;
    const canonical = absoluteUrl(`/jobs/workers/${workerId}`, base);
    const description =
      profile.headline ??
      profile.bio?.slice(0, 160) ??
      `${name} — trades worker on Vera Job Board`;
    return {
      title: `${name} | Vera Job Board`,
      description,
      canonical,
      openGraph: { title: name, description, url: canonical },
      robots: { index: profile.openToWork, follow: true },
    };
  }

  private async questionMetadata(
    slug: string,
    base: string,
  ): Promise<SeoMetadata> {
    const q = await this.prisma.expertQaQuestion.findFirst({
      where: {
        slug,
        moderationStatus: 'VISIBLE',
        status: { not: 'HIDDEN' },
      },
    });
    if (!q) throw new NotFoundException('Question not found');
    const canonical = absoluteUrl(`/experts/questions/${slug}`, base);
    const description = q.body.slice(0, 160);
    return {
      title: `${q.title} | Vera Experts`,
      description,
      canonical,
      openGraph: {
        type: 'article',
        title: q.title,
        description,
        url: canonical,
      },
    };
  }

  private async articleSchema(slug: string, base: string): Promise<SeoJsonLd> {
    const post = await this.prisma.safetyArticle.findFirst({
      where: { slug, status: 'PUBLISHED', active: true },
      include: { tags: { include: { tag: true } } },
    });
    if (!post) throw new NotFoundException('Article not found');
    return articleJsonLd(
      {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        metaDescription: post.metaDescription,
        authorName: post.authorName,
        imageUrl: post.imageUrl,
        publishedAt: post.publishedAt.toISOString(),
        readMinutes: post.readMinutes,
        tagSlugs: post.tags.map((t) => t.tag.slug),
        canonicalUrl: post.canonicalUrl,
      },
      base,
    );
  }

  private async jobSchema(slug: string, base: string): Promise<SeoJsonLd> {
    const job = await this.prisma.jobPost.findFirst({
      where: { slug, active: true },
      include: { tickets: true },
    });
    if (!job) throw new NotFoundException('Job not found');
    return jobPostingJsonLd(
      {
        slug: job.slug,
        title: job.title,
        companyName: job.companyName,
        description: job.description,
        summary: job.summary,
        location: job.location,
        locationCity: job.locationCity,
        locationRegion: job.locationRegion,
        trade: job.trade,
        payMin: job.payMin,
        payMax: job.payMax,
        payPeriod: job.payPeriod,
        payRange: job.payRange,
        experienceLevel: job.experienceLevel,
        publishedAt: job.publishedAt.toISOString(),
        ticketNames: job.tickets.map((t) => t.ticketName),
      },
      base,
    );
  }

  private async expertProfileSchema(
    userId: number,
    base: string,
  ): Promise<SeoJsonLd> {
    const profile = await this.prisma.expertProfile.findUnique({
      where: { userId },
      include: { user: { include: { worker: true } } },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    const name = profile.user.worker
      ? `${profile.user.worker.firstName} ${profile.user.worker.lastName}`
      : profile.user.username;
    return profileJsonLd(
      {
        path: `/experts/profile/${userId}`,
        displayName: name,
        headline: profile.headline,
        bio: profile.bio,
        trade: profile.trade,
        profileType: 'expert',
      },
      base,
    );
  }

  private async workerProfileSchema(
    workerId: number,
    base: string,
  ): Promise<SeoJsonLd> {
    const profile = await this.prisma.jobBoardWorkerProfile.findUnique({
      where: { workerId },
      include: { worker: true },
    });
    if (!profile) throw new NotFoundException('Worker profile not found');
    return profileJsonLd(
      {
        path: `/jobs/workers/${workerId}`,
        displayName: `${profile.worker.firstName} ${profile.worker.lastName}`,
        headline: profile.headline,
        bio: profile.bio,
        trade: profile.primaryTrade,
        profileType: 'worker',
      },
      base,
    );
  }

  private async questionSchema(slug: string, base: string): Promise<SeoJsonLd> {
    const q = await this.prisma.expertQaQuestion.findFirst({
      where: {
        slug,
        moderationStatus: 'VISIBLE',
        status: { not: 'HIDDEN' },
      },
      include: {
        author: { include: { worker: true } },
        _count: { select: { answers: true } },
        answers: {
          where: { moderationStatus: 'VISIBLE' },
          include: { author: { include: { worker: true } } },
          orderBy: { voteScore: 'desc' },
          take: 20,
        },
      },
    });
    if (!q) throw new NotFoundException('Question not found');
    const authorName = q.author?.worker
      ? `${q.author.worker.firstName} ${q.author.worker.lastName}`
      : q.author?.username;
    return qaPageJsonLd(
      {
        slug: q.slug,
        title: q.title,
        body: q.body,
        createdAt: q.createdAt.toISOString(),
        answerCount: q._count.answers,
        anonymous: q.anonymous,
        authorName,
        answers: q.answers.map((a) => ({
          body: a.body,
          voteScore: a.voteScore,
          createdAt: a.createdAt.toISOString(),
          authorName: a.author.worker
            ? `${a.author.worker.firstName} ${a.author.worker.lastName}`
            : a.author.username,
          isAccepted: q.acceptedAnswerId === a.id,
        })),
      },
      base,
    );
  }
}
