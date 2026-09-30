"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepagePayloadSchema = exports.HomepageFeedPageSchema = exports.QuickActionDtoSchema = exports.CompanyAnnouncementDtoSchema = exports.WorkerAchievementDtoSchema = exports.ProjectUpdateDtoSchema = exports.SafetyArticleDtoSchema = exports.JobPostDtoSchema = exports.WeatherSnapshotDtoSchema = exports.WeatherAlertDtoSchema = exports.TrendingTopicDtoSchema = exports.FeedItemDtoSchema = exports.HubSectionSchema = exports.HubHomepageRoleSchema = exports.FeedSourceSchema = void 0;
const zod_1 = require("zod");
exports.FeedSourceSchema = zod_1.z.enum([
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
exports.HubHomepageRoleSchema = zod_1.z.enum([
    "WORKER",
    "SUPERVISOR",
    "COMPANY_ADMIN",
    "UNION_HALL",
]);
exports.HubSectionSchema = zod_1.z.enum([
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
exports.FeedItemDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    source: exports.FeedSourceSchema,
    title: zod_1.z.string(),
    summary: zod_1.z.string().nullable(),
    imageUrl: zod_1.z.string().nullable(),
    url: zod_1.z.string().nullable(),
    publishedAt: zod_1.z.string().datetime(),
    rankScore: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
});
exports.TrendingTopicDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    category: zod_1.z.string(),
    viewCount: zod_1.z.number().int(),
});
exports.WeatherAlertDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    region: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    severity: zod_1.z.enum(["INFO", "WATCH", "WARNING", "EMERGENCY"]),
    hazardType: zod_1.z.string().nullable(),
    startsAt: zod_1.z.string().datetime(),
    endsAt: zod_1.z.string().datetime().nullable(),
});
exports.WeatherSnapshotDtoSchema = zod_1.z.object({
    region: zod_1.z.string(),
    summary: zod_1.z.string(),
    temperatureC: zod_1.z.number().nullable(),
    conditions: zod_1.z.string(),
    alerts: zod_1.z.array(exports.WeatherAlertDtoSchema),
});
exports.JobPostDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    companyName: zod_1.z.string(),
    location: zod_1.z.string().nullable(),
    trade: zod_1.z.string().nullable(),
    payRange: zod_1.z.string().nullable(),
    summary: zod_1.z.string().nullable(),
    url: zod_1.z.string().nullable(),
    publishedAt: zod_1.z.string().datetime(),
});
exports.SafetyArticleDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    slug: zod_1.z.string(),
    title: zod_1.z.string(),
    excerpt: zod_1.z.string().nullable(),
    authorName: zod_1.z.string().nullable(),
    imageUrl: zod_1.z.string().nullable(),
    category: zod_1.z.string(),
    readMinutes: zod_1.z.number().int(),
    publishedAt: zod_1.z.string().datetime(),
});
exports.ProjectUpdateDtoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    projectName: zod_1.z.string(),
    title: zod_1.z.string(),
    summary: zod_1.z.string().nullable(),
    publishedAt: zod_1.z.string().datetime(),
    url: zod_1.z.string().nullable(),
});
exports.WorkerAchievementDtoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    workerName: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    completedAt: zod_1.z.string().datetime(),
});
exports.CompanyAnnouncementDtoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    body: zod_1.z.string(),
    publishedAt: zod_1.z.string().datetime(),
    priority: zod_1.z.enum(["normal", "high"]).default("normal"),
});
exports.QuickActionDtoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string(),
    href: zod_1.z.string(),
    icon: zod_1.z.string().optional(),
});
exports.HomepageFeedPageSchema = zod_1.z.object({
    items: zod_1.z.array(exports.FeedItemDtoSchema),
    nextCursor: zod_1.z.string().nullable(),
});
exports.HomepagePayloadSchema = zod_1.z.object({
    hubRole: exports.HubHomepageRoleSchema,
    sections: zod_1.z.array(exports.HubSectionSchema),
    feed: exports.HomepageFeedPageSchema,
    quickActions: zod_1.z.array(exports.QuickActionDtoSchema),
    trendingTopics: zod_1.z.array(exports.TrendingTopicDtoSchema),
    weather: exports.WeatherSnapshotDtoSchema,
    jobPreview: zod_1.z.array(exports.JobPostDtoSchema),
    safetyBlogPreview: zod_1.z.array(exports.SafetyArticleDtoSchema),
    projectUpdates: zod_1.z.array(exports.ProjectUpdateDtoSchema),
    achievements: zod_1.z.array(exports.WorkerAchievementDtoSchema),
    announcements: zod_1.z.array(exports.CompanyAnnouncementDtoSchema),
    cachedAt: zod_1.z.string().datetime(),
});
