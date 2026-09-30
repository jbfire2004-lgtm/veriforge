"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateCommentSchema = exports.createSafetyBlogCommentSchema = exports.safetyBlogListQuerySchema = exports.updateSafetyBlogPostSchema = exports.createSafetyBlogPostSchema = exports.SafetyBlogSitemapEntrySchema = exports.SafetyBlogSearchResultSchema = exports.SafetyBlogPostListSchema = exports.SafetyBlogCommentSchema = exports.SafetyBlogPostDetailSchema = exports.SafetyBlogPostSummarySchema = exports.SafetyBlogCategorySchema = exports.SafetyBlogTagSchema = exports.SafetyBlogCommentStatusSchema = exports.SafetyBlogAuthorTypeSchema = exports.SafetyBlogPostStatusSchema = exports.SafetyRiskLevelSchema = void 0;
const zod_1 = require("zod");
exports.SafetyRiskLevelSchema = zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]);
exports.SafetyBlogPostStatusSchema = zod_1.z.enum([
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
]);
exports.SafetyBlogAuthorTypeSchema = zod_1.z.enum(["EXPERT", "COMPANY"]);
exports.SafetyBlogCommentStatusSchema = zod_1.z.enum([
    "VISIBLE",
    "HIDDEN",
    "PENDING",
]);
exports.SafetyBlogTagSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string(),
    name: zod_1.z.string(),
});
exports.SafetyBlogCategorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    postCount: zod_1.z.number().int().optional(),
});
exports.SafetyBlogPostSummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string(),
    title: zod_1.z.string(),
    excerpt: zod_1.z.string().nullable(),
    metaDescription: zod_1.z.string().nullable().optional(),
    authorName: zod_1.z.string().nullable(),
    authorType: exports.SafetyBlogAuthorTypeSchema,
    imageUrl: zod_1.z.string().nullable(),
    category: zod_1.z.string(),
    categorySlug: zod_1.z.string().nullable().optional(),
    safetyLevel: exports.SafetyRiskLevelSchema,
    readMinutes: zod_1.z.number().int(),
    featured: zod_1.z.boolean(),
    publishedAt: zod_1.z.string().datetime(),
    tagSlugs: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.SafetyBlogPostDetailSchema = exports.SafetyBlogPostSummarySchema.extend({
    body: zod_1.z.string().nullable(),
    canonicalUrl: zod_1.z.string().nullable(),
    tags: zod_1.z.array(exports.SafetyBlogTagSchema),
    relatedPosts: zod_1.z.array(exports.SafetyBlogPostSummarySchema),
});
const SafetyBlogCommentBaseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    postId: zod_1.z.string().uuid(),
    parentId: zod_1.z.string().uuid().nullable(),
    authorName: zod_1.z.string().nullable(),
    body: zod_1.z.string(),
    upvoteCount: zod_1.z.number().int(),
    status: exports.SafetyBlogCommentStatusSchema,
    createdAt: zod_1.z.string().datetime(),
});
exports.SafetyBlogCommentSchema = SafetyBlogCommentBaseSchema.extend({
    replies: zod_1.z.lazy(() => zod_1.z.array(exports.SafetyBlogCommentSchema)).optional(),
});
exports.SafetyBlogPostListSchema = zod_1.z.object({
    items: zod_1.z.array(exports.SafetyBlogPostSummarySchema),
    total: zod_1.z.number().int(),
    page: zod_1.z.number().int(),
    pageSize: zod_1.z.number().int(),
});
exports.SafetyBlogSearchResultSchema = zod_1.z.object({
    items: zod_1.z.array(exports.SafetyBlogPostSummarySchema),
    query: zod_1.z.string(),
    total: zod_1.z.number().int(),
});
exports.SafetyBlogSitemapEntrySchema = zod_1.z.object({
    slug: zod_1.z.string(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.createSafetyBlogPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    slug: zod_1.z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    body: zod_1.z.string().min(1),
    excerpt: zod_1.z.string().max(500).optional(),
    metaDescription: zod_1.z.string().max(320).optional(),
    canonicalUrl: zod_1.z.string().url().optional(),
    authorName: zod_1.z.string().max(120).optional(),
    authorType: exports.SafetyBlogAuthorTypeSchema.optional(),
    imageUrl: zod_1.z.string().url().optional(),
    categoryId: zod_1.z.string().uuid().optional(),
    category: zod_1.z.string().optional(),
    safetyLevel: exports.SafetyRiskLevelSchema.optional(),
    readMinutes: zod_1.z.number().int().min(1).max(120).optional(),
    featured: zod_1.z.boolean().optional(),
    status: exports.SafetyBlogPostStatusSchema.optional(),
    publishedAt: zod_1.z.string().datetime().optional(),
    companyId: zod_1.z.number().int().optional(),
    tagIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    relatedPostIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
exports.updateSafetyBlogPostSchema = exports.createSafetyBlogPostSchema.partial();
exports.safetyBlogListQuerySchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).optional(),
    pageSize: zod_1.z.number().int().min(1).max(50).optional(),
    categorySlug: zod_1.z.string().optional(),
    tagSlug: zod_1.z.string().optional(),
    featured: zod_1.z.boolean().optional(),
    safetyLevel: exports.SafetyRiskLevelSchema.optional(),
    q: zod_1.z.string().optional(),
});
exports.createSafetyBlogCommentSchema = zod_1.z.object({
    postId: zod_1.z.string().uuid(),
    parentId: zod_1.z.string().uuid().optional(),
    authorName: zod_1.z.string().max(80).optional(),
    body: zod_1.z.string().min(1).max(4000),
});
exports.moderateCommentSchema = zod_1.z.object({
    commentId: zod_1.z.string().uuid(),
    status: exports.SafetyBlogCommentStatusSchema,
});
