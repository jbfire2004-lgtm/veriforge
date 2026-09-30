import { z } from "zod";

export const SafetyRiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const SafetyBlogPostStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);
export const SafetyBlogAuthorTypeSchema = z.enum(["EXPERT", "COMPANY"]);
export const SafetyBlogCommentStatusSchema = z.enum([
  "VISIBLE",
  "HIDDEN",
  "PENDING",
]);

export const SafetyBlogTagSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
});

export const SafetyBlogCategorySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  postCount: z.number().int().optional(),
});

export const SafetyBlogPostSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  metaDescription: z.string().nullable().optional(),
  authorName: z.string().nullable(),
  authorType: SafetyBlogAuthorTypeSchema,
  imageUrl: z.string().nullable(),
  category: z.string(),
  categorySlug: z.string().nullable().optional(),
  safetyLevel: SafetyRiskLevelSchema,
  readMinutes: z.number().int(),
  featured: z.boolean(),
  publishedAt: z.string().datetime(),
  tagSlugs: z.array(z.string()).optional(),
});

export const SafetyBlogPostDetailSchema = SafetyBlogPostSummarySchema.extend({
  body: z.string().nullable(),
  canonicalUrl: z.string().nullable(),
  tags: z.array(SafetyBlogTagSchema),
  relatedPosts: z.array(SafetyBlogPostSummarySchema),
});

const SafetyBlogCommentBaseSchema = z.object({
  id: z.string().uuid(),
  postId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  authorName: z.string().nullable(),
  body: z.string(),
  upvoteCount: z.number().int(),
  status: SafetyBlogCommentStatusSchema,
  createdAt: z.string().datetime(),
});

export type SafetyBlogComment = z.infer<typeof SafetyBlogCommentBaseSchema> & {
  replies?: SafetyBlogComment[];
};

export const SafetyBlogCommentSchema: z.ZodType<SafetyBlogComment> =
  SafetyBlogCommentBaseSchema.extend({
    replies: z.lazy(() => z.array(SafetyBlogCommentSchema)).optional(),
  });

export const SafetyBlogPostListSchema = z.object({
  items: z.array(SafetyBlogPostSummarySchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});

export const SafetyBlogSearchResultSchema = z.object({
  items: z.array(SafetyBlogPostSummarySchema),
  query: z.string(),
  total: z.number().int(),
});

export const SafetyBlogSitemapEntrySchema = z.object({
  slug: z.string(),
  updatedAt: z.string().datetime(),
});

export const createSafetyBlogPostSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  body: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  metaDescription: z.string().max(320).optional(),
  canonicalUrl: z.string().url().optional(),
  authorName: z.string().max(120).optional(),
  authorType: SafetyBlogAuthorTypeSchema.optional(),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
  category: z.string().optional(),
  safetyLevel: SafetyRiskLevelSchema.optional(),
  readMinutes: z.number().int().min(1).max(120).optional(),
  featured: z.boolean().optional(),
  status: SafetyBlogPostStatusSchema.optional(),
  publishedAt: z.string().datetime().optional(),
  companyId: z.number().int().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  relatedPostIds: z.array(z.string().uuid()).optional(),
});

export const updateSafetyBlogPostSchema = createSafetyBlogPostSchema.partial();

export const safetyBlogListQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(50).optional(),
  categorySlug: z.string().optional(),
  tagSlug: z.string().optional(),
  featured: z.boolean().optional(),
  safetyLevel: SafetyRiskLevelSchema.optional(),
  q: z.string().optional(),
});

export const createSafetyBlogCommentSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  authorName: z.string().max(80).optional(),
  body: z.string().min(1).max(4000),
});

export const moderateCommentSchema = z.object({
  commentId: z.string().uuid(),
  status: SafetyBlogCommentStatusSchema,
});

export type SafetyBlogPostSummary = z.infer<typeof SafetyBlogPostSummarySchema>;
export type SafetyBlogPostDetail = z.infer<typeof SafetyBlogPostDetailSchema>;
export type SafetyBlogPostList = z.infer<typeof SafetyBlogPostListSchema>;
export type SafetyBlogSitemapEntry = z.infer<typeof SafetyBlogSitemapEntrySchema>;
export type SafetyBlogSearchResult = z.infer<typeof SafetyBlogSearchResultSchema>;
export type SafetyBlogCategory = z.infer<typeof SafetyBlogCategorySchema>;
export type SafetyBlogTag = z.infer<typeof SafetyBlogTagSchema>;
