import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  SafetyBlogCategory,
  SafetyBlogPostDetail,
  SafetyBlogPostList,
  SafetyBlogPostSummary,
  SafetyBlogSitemapEntry,
  SafetyBlogTag,
} from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { SafetyBlogCacheService } from './safety-blog-cache.service';
import { SafetyBlogSearchService } from './safety-blog-search.service';
import {
  estimateReadMinutes,
  PUBLIC_POST_INCLUDE,
  slugify,
} from './safety-blog.utils';

@Injectable()
export class SafetyBlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: SafetyBlogCacheService,
    private readonly search: SafetyBlogSearchService,
  ) {}

  async listPublished(query: {
    page?: number;
    pageSize?: number;
    categorySlug?: string;
    tagSlug?: string;
    featured?: boolean;
    safetyLevel?: string;
    q?: string;
  }): Promise<SafetyBlogPostList> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 12, 50);
    const cacheKey = JSON.stringify({ ...query, page, pageSize });
    const cached = this.cache.getList(cacheKey);
    if (cached) return cached;

    if (query.q?.trim()) {
      await this.refreshSearchIndex();
      const items = this.search.search(query.q, pageSize);
      const result = { items, total: items.length, page: 1, pageSize };
      this.cache.setList(cacheKey, result);
      return result;
    }

    const where = this.publishedWhere(query);
    const [total, rows] = await Promise.all([
      this.prisma.safetyArticle.count({ where }),
      this.prisma.safetyArticle.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          categoryRel: true,
          tags: { include: { tag: true } },
        },
      }),
    ]);

    const result: SafetyBlogPostList = {
      items: rows.map((r) => this.toSummary(r)),
      total,
      page,
      pageSize,
    };
    this.cache.setList(cacheKey, result);
    return result;
  }

  async getBySlug(slug: string): Promise<SafetyBlogPostDetail> {
    const cached = this.cache.getPost(slug);
    if (cached) return cached;

    const row = await this.prisma.safetyArticle.findFirst({
      where: { slug, status: 'PUBLISHED', active: true },
      include: PUBLIC_POST_INCLUDE,
    });
    if (!row) throw new NotFoundException('Article not found');

    await this.prisma.safetyArticle.update({
      where: { id: row.id },
      data: { viewCount: { increment: 1 } },
    });

    const detail = this.toDetail(row);
    this.cache.setPost(slug, detail);
    return detail;
  }

  async getTrending(take = 6): Promise<SafetyBlogPostSummary[]> {
    const cacheKey = `trending:${take}`;
    const cached = this.cache.getTrending(cacheKey);
    if (cached) return cached;

    const rows = await this.prisma.safetyArticle.findMany({
      where: { status: 'PUBLISHED', active: true },
      orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }],
      take,
      include: {
        categoryRel: true,
        tags: { include: { tag: true } },
      },
    });
    const items = rows.map((r) => this.toSummary(r));
    this.cache.setTrending(cacheKey, items);
    return items;
  }

  async listCategories(): Promise<SafetyBlogCategory[]> {
    const cats = await this.prisma.safetyBlogCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      postCount: c._count.posts,
    }));
  }

  async listTags(): Promise<SafetyBlogTag[]> {
    return this.prisma.safetyBlogTag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async sitemapEntries(): Promise<SafetyBlogSitemapEntry[]> {
    const rows = await this.prisma.safetyArticle.findMany({
      where: { status: 'PUBLISHED', active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      slug: r.slug,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  // --- Admin ---

  async adminList(query: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<SafetyBlogPostList> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where: Prisma.SafetyArticleWhereInput = query.status
      ? { status: query.status as never }
      : {};
    const [total, rows] = await Promise.all([
      this.prisma.safetyArticle.count({ where }),
      this.prisma.safetyArticle.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          categoryRel: true,
          tags: { include: { tag: true } },
        },
      }),
    ]);
    return {
      items: rows.map((r) => this.toSummary(r)),
      total,
      page,
      pageSize,
    };
  }

  async adminGet(id: string): Promise<SafetyBlogPostDetail> {
    const row = await this.prisma.safetyArticle.findUnique({
      where: { id },
      include: PUBLIC_POST_INCLUDE,
    });
    if (!row) throw new NotFoundException('Post not found');
    return this.toDetail(row);
  }

  async adminCreate(
    input: Record<string, unknown>,
  ): Promise<SafetyBlogPostDetail> {
    const title = String(input.title);
    const body = String(input.body);
    const slug = (input.slug as string | undefined) ?? slugify(title);
    const status = (input.status as string | undefined) ?? 'DRAFT';
    const readMinutes =
      (input.readMinutes as number | undefined) ?? estimateReadMinutes(body);

    const row = await this.prisma.safetyArticle.create({
      data: {
        slug,
        title,
        body,
        excerpt: (input.excerpt as string) ?? body.slice(0, 280),
        metaDescription: input.metaDescription as string | undefined,
        canonicalUrl: input.canonicalUrl as string | undefined,
        authorName: input.authorName as string | undefined,
        authorType: (input.authorType as never) ?? 'EXPERT',
        imageUrl: input.imageUrl as string | undefined,
        category: (input.category as string) ?? 'safety',
        categoryId: input.categoryId as string | undefined,
        safetyLevel: (input.safetyLevel as never) ?? 'MEDIUM',
        readMinutes,
        featured: Boolean(input.featured),
        status: status as never,
        active: status === 'PUBLISHED',
        publishedAt: input.publishedAt
          ? new Date(input.publishedAt as string)
          : new Date(),
        companyId: input.companyId as number | undefined,
      },
    });

    await this.syncTags(row.id, input.tagIds as string[] | undefined);
    await this.syncRelated(
      row.id,
      input.relatedPostIds as string[] | undefined,
    );
    this.cache.invalidateAll();
    await this.refreshSearchIndex();
    return this.adminGet(row.id);
  }

  async adminUpdate(
    id: string,
    input: Record<string, unknown>,
  ): Promise<SafetyBlogPostDetail> {
    const existing = await this.prisma.safetyArticle.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Post not found');

    const body = input.body as string | undefined;
    const status = input.status as string | undefined;

    await this.prisma.safetyArticle.update({
      where: { id },
      data: {
        ...(input.title != null ? { title: String(input.title) } : {}),
        ...(input.slug != null ? { slug: String(input.slug) } : {}),
        ...(body != null ? { body } : {}),
        ...(input.excerpt != null ? { excerpt: String(input.excerpt) } : {}),
        ...(input.metaDescription != null
          ? { metaDescription: String(input.metaDescription) }
          : {}),
        ...(input.canonicalUrl != null
          ? { canonicalUrl: String(input.canonicalUrl) }
          : {}),
        ...(input.authorName != null
          ? { authorName: String(input.authorName) }
          : {}),
        ...(input.authorType != null
          ? { authorType: input.authorType as never }
          : {}),
        ...(input.imageUrl != null ? { imageUrl: String(input.imageUrl) } : {}),
        ...(input.category != null ? { category: String(input.category) } : {}),
        ...(input.categoryId != null
          ? { categoryId: String(input.categoryId) }
          : {}),
        ...(input.safetyLevel != null
          ? { safetyLevel: input.safetyLevel as never }
          : {}),
        ...(input.readMinutes != null
          ? { readMinutes: Number(input.readMinutes) }
          : body != null
          ? { readMinutes: estimateReadMinutes(body) }
          : {}),
        ...(input.featured != null
          ? { featured: Boolean(input.featured) }
          : {}),
        ...(status != null
          ? {
              status: status as never,
              active: status === 'PUBLISHED',
            }
          : {}),
        ...(input.publishedAt != null
          ? { publishedAt: new Date(input.publishedAt as string) }
          : {}),
        ...(input.companyId != null
          ? { companyId: Number(input.companyId) }
          : {}),
      },
    });

    if (input.tagIds) {
      await this.syncTags(id, input.tagIds as string[]);
    }
    if (input.relatedPostIds) {
      await this.syncRelated(id, input.relatedPostIds as string[]);
    }

    this.cache.invalidateAll();
    await this.refreshSearchIndex();
    return this.adminGet(id);
  }

  async adminDelete(id: string): Promise<void> {
    await this.prisma.safetyArticle.delete({ where: { id } });
    this.cache.invalidateAll();
    await this.refreshSearchIndex();
  }

  async adminUpsertCategory(data: {
    slug?: string;
    name: string;
    description?: string;
    sortOrder?: number;
  }): Promise<SafetyBlogCategory> {
    const slug = data.slug ?? slugify(data.name);
    const row = await this.prisma.safetyBlogCategory.upsert({
      where: { slug },
      create: {
        slug,
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder ?? 0,
      },
      update: {
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder,
      },
    });
    this.cache.invalidateAll();
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
    };
  }

  async adminUpsertTag(data: {
    slug?: string;
    name: string;
  }): Promise<SafetyBlogTag> {
    const slug = data.slug ?? slugify(data.name);
    return this.prisma.safetyBlogTag.upsert({
      where: { slug },
      create: { slug, name: data.name },
      update: { name: data.name },
    });
  }

  async adminDeleteTag(id: string): Promise<void> {
    await this.prisma.safetyBlogTag.delete({ where: { id } });
    this.cache.invalidateAll();
  }

  async adminDeleteCategory(id: string): Promise<void> {
    await this.prisma.safetyBlogCategory.delete({ where: { id } });
    this.cache.invalidateAll();
  }

  private publishedWhere(query: {
    categorySlug?: string;
    tagSlug?: string;
    featured?: boolean;
    safetyLevel?: string;
  }): Prisma.SafetyArticleWhereInput {
    return {
      status: 'PUBLISHED',
      active: true,
      ...(query.featured != null ? { featured: query.featured } : {}),
      ...(query.safetyLevel ? { safetyLevel: query.safetyLevel as never } : {}),
      ...(query.categorySlug
        ? {
            OR: [
              { categoryRel: { slug: query.categorySlug } },
              { category: query.categorySlug },
            ],
          }
        : {}),
      ...(query.tagSlug
        ? { tags: { some: { tag: { slug: query.tagSlug } } } }
        : {}),
    };
  }

  private async syncTags(postId: string, tagIds?: string[]): Promise<void> {
    await this.prisma.safetyBlogPostTag.deleteMany({ where: { postId } });
    if (!tagIds?.length) return;
    await this.prisma.safetyBlogPostTag.createMany({
      data: tagIds.map((tagId) => ({ postId, tagId })),
      skipDuplicates: true,
    });
  }

  private async syncRelated(
    postId: string,
    relatedIds?: string[],
  ): Promise<void> {
    await this.prisma.safetyBlogRelatedPost.deleteMany({
      where: { fromPostId: postId },
    });
    if (!relatedIds?.length) return;
    await this.prisma.safetyBlogRelatedPost.createMany({
      data: relatedIds
        .filter((id) => id !== postId)
        .map((toPostId) => ({ fromPostId: postId, toPostId })),
      skipDuplicates: true,
    });
  }

  private async refreshSearchIndex(): Promise<void> {
    const rows = await this.prisma.safetyArticle.findMany({
      where: { status: 'PUBLISHED', active: true },
      include: {
        categoryRel: true,
        tags: { include: { tag: true } },
      },
    });
    this.search.rebuild(rows.map((r) => this.toSummary(r)));
  }

  private toSummary(
    row: Prisma.SafetyArticleGetPayload<{
      include: {
        categoryRel: true;
        tags: { include: { tag: true } };
      };
    }>,
  ): SafetyBlogPostSummary {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      metaDescription: row.metaDescription,
      authorName: row.authorName,
      authorType: row.authorType,
      imageUrl: row.imageUrl,
      category: row.categoryRel?.name ?? row.category,
      categorySlug: row.categoryRel?.slug ?? row.category,
      safetyLevel: row.safetyLevel,
      readMinutes: row.readMinutes,
      featured: row.featured,
      publishedAt: row.publishedAt.toISOString(),
      tagSlugs: row.tags.map((t) => t.tag.slug),
    };
  }

  private toDetail(
    row: Prisma.SafetyArticleGetPayload<{
      include: typeof PUBLIC_POST_INCLUDE;
    }>,
  ): SafetyBlogPostDetail {
    return {
      ...this.toSummary(row),
      body: row.body,
      canonicalUrl: row.canonicalUrl,
      tags: row.tags.map((t) => ({
        id: t.tag.id,
        slug: t.tag.slug,
        name: t.tag.name,
      })),
      relatedPosts: row.relatedFrom
        .map((r) => this.toSummary(r.toPost))
        .slice(0, 4),
    };
  }
}
