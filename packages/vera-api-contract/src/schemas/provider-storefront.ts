import { z } from "zod";

export const ProviderStorefrontProfileSchema = z.object({
  id: z.string().uuid(),
  trainingProviderId: z.number(),
  displayName: z.string(),
  bio: z.string().nullable(),
  logoUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  links: z.record(z.string()).nullable().optional(),
  postCount: z.number().int(),
  provider: z.object({
    id: z.number(),
    name: z.string(),
    website: z.string().nullable(),
    logoUrl: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
  }),
});

export const ProviderStorefrontPostSchema = z.object({
  id: z.string().uuid(),
  postType: z.string(),
  title: z.string().nullable(),
  body: z.string(),
  publishedAt: z.string().datetime(),
  author: z.object({ id: z.number(), username: z.string() }),
  engagement: z.object({
    likeCount: z.number().int(),
    commentCount: z.number().int(),
    shareCount: z.number().int(),
  }),
});

export type ProviderStorefrontProfile = z.infer<typeof ProviderStorefrontProfileSchema>;
export type ProviderStorefrontPost = z.infer<typeof ProviderStorefrontPostSchema>;
