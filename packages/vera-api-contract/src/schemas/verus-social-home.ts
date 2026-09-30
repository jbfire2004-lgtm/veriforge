import { z } from "zod";

export const SocialPostEngagementSchema = z.object({
  likeCount: z.number().int(),
  commentCount: z.number().int(),
  shareCount: z.number().int(),
  likedByMe: z.boolean().optional(),
  savedByMe: z.boolean().optional(),
});

export const SocialMediaAttachmentSchema = z.object({
  id: z.string().uuid(),
  fileType: z.string(),
  url: z.string(),
  mimeType: z.string().nullable().optional(),
});

export const SocialPostCardSchema = z.object({
  kind: z.literal("post"),
  id: z.string().uuid(),
  postType: z.string(),
  title: z.string().nullable(),
  body: z.string(),
  publishedAt: z.string().datetime(),
  author: z.object({ id: z.number(), username: z.string() }),
  media: z.array(SocialMediaAttachmentSchema),
  pinned: z.boolean().optional(),
  engagement: SocialPostEngagementSchema,
});

export const LegacyFeedCardSchema = z.object({
  kind: z.literal("legacy"),
  id: z.string(),
  source: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  imageUrl: z.string().nullable(),
  url: z.string().nullable(),
  publishedAt: z.string().datetime(),
});

export const SponsoredAdCardSchema = z.object({
  kind: z.literal("ad"),
  id: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  imageUrl: z.string().nullable(),
  ctaUrl: z.string().nullable(),
  ctaLabel: z.string().nullable().optional(),
});

export const PinnedPostCardSchema = z.object({
  kind: z.literal("pinned"),
  post: SocialPostCardSchema,
});

export const SocialFeedEntrySchema = z.discriminatedUnion("kind", [
  SocialPostCardSchema,
  LegacyFeedCardSchema,
  SponsoredAdCardSchema,
  PinnedPostCardSchema,
]);

export const SocialFeedPageSchema = z.object({
  items: z.array(SocialFeedEntrySchema),
  nextCursor: z.string().nullable(),
});

export type SocialFeedPage = z.infer<typeof SocialFeedPageSchema>;
export type SocialPostCard = z.infer<typeof SocialPostCardSchema>;
