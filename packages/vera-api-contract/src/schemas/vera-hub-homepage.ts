import { z } from "zod";

export const FeedSourceSchema = z.enum([
  "VERA_CORE_TRAINING",
  "TRAINING_EXPIRY",
  "VERA_CORE_PROJECT",
  "VERA_CORE_EQUIPMENT",
  "JOB_BOARD",
  "SAFETY_BLOG",
  "COMPANY_ANNOUNCEMENT",
  "WORKER_ACHIEVEMENT",
  "WORKER_VERIFICATION",
  "EXPERT_ANSWER",
  "UNION_DISPATCH",
  "SYSTEM",
]);

export const HubHomepageRoleSchema = z.enum([
  "WORKER",
  "SUPERVISOR",
  "COMPANY_ADMIN",
  "UNION_HALL",
]);

export const HubSectionSchema = z.enum([
  "feed",
  "quickActions",
  "trending",
  "weather",
  "jobs",
  "safetyBlog",
  "projectUpdates",
  "achievements",
  "announcements",
]);

export const FeedItemDtoSchema = z.object({
  id: z.string().uuid(),
  source: FeedSourceSchema,
  title: z.string(),
  summary: z.string().nullable(),
  imageUrl: z.string().nullable(),
  url: z.string().nullable(),
  publishedAt: z.string().datetime(),
  rankScore: z.number(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const TrendingTopicDtoSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  viewCount: z.number().int(),
});

export const WeatherAlertDtoSchema = z.object({
  id: z.string().uuid(),
  region: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(["INFO", "WATCH", "WARNING", "EMERGENCY"]),
  hazardType: z.string().nullable(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable(),
});

export const WeatherSnapshotDtoSchema = z.object({
  region: z.string(),
  summary: z.string(),
  temperatureC: z.number().nullable(),
  conditions: z.string(),
  alerts: z.array(WeatherAlertDtoSchema),
});

export const JobPostDtoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  companyName: z.string(),
  location: z.string().nullable(),
  trade: z.string().nullable(),
  payRange: z.string().nullable(),
  summary: z.string().nullable(),
  url: z.string().nullable(),
  publishedAt: z.string().datetime(),
});

export const SafetyArticleDtoSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  authorName: z.string().nullable(),
  imageUrl: z.string().nullable(),
  category: z.string(),
  readMinutes: z.number().int(),
  publishedAt: z.string().datetime(),
});

export const ProjectUpdateDtoSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  publishedAt: z.string().datetime(),
  url: z.string().nullable(),
});

export const WorkerAchievementDtoSchema = z.object({
  id: z.string(),
  workerName: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  completedAt: z.string().datetime(),
});

export const CompanyAnnouncementDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  publishedAt: z.string().datetime(),
  priority: z.enum(["normal", "high"]).default("normal"),
});

export const QuickActionDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
});

export const HomepageFeedPageSchema = z.object({
  items: z.array(FeedItemDtoSchema),
  nextCursor: z.string().nullable(),
});

export const HomepagePayloadSchema = z.object({
  hubRole: HubHomepageRoleSchema,
  sections: z.array(HubSectionSchema),
  feed: HomepageFeedPageSchema,
  quickActions: z.array(QuickActionDtoSchema),
  trendingTopics: z.array(TrendingTopicDtoSchema),
  weather: WeatherSnapshotDtoSchema,
  jobPreview: z.array(JobPostDtoSchema),
  safetyBlogPreview: z.array(SafetyArticleDtoSchema),
  projectUpdates: z.array(ProjectUpdateDtoSchema),
  achievements: z.array(WorkerAchievementDtoSchema),
  announcements: z.array(CompanyAnnouncementDtoSchema),
  cachedAt: z.string().datetime(),
});

export type FeedSource = z.infer<typeof FeedSourceSchema>;
export type HubHomepageRole = z.infer<typeof HubHomepageRoleSchema>;
export type HubSection = z.infer<typeof HubSectionSchema>;
export type HomepagePayload = z.infer<typeof HomepagePayloadSchema>;
export type FeedItemDto = z.infer<typeof FeedItemDtoSchema>;
export type TrendingTopicDto = z.infer<typeof TrendingTopicDtoSchema>;
export type WeatherSnapshotDto = z.infer<typeof WeatherSnapshotDtoSchema>;
export type JobPostDto = z.infer<typeof JobPostDtoSchema>;
export type SafetyArticleDto = z.infer<typeof SafetyArticleDtoSchema>;
export type ProjectUpdateDto = z.infer<typeof ProjectUpdateDtoSchema>;
export type WorkerAchievementDto = z.infer<typeof WorkerAchievementDtoSchema>;
export type CompanyAnnouncementDto = z.infer<typeof CompanyAnnouncementDtoSchema>;
export type QuickActionDto = z.infer<typeof QuickActionDtoSchema>;
