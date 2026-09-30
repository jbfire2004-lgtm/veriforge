import type { HomepagePayload } from "@vera/api-contract";
import { mapSessionRoleToHubRole } from "@/lib/hub/hub-roles";
import { DEFAULT_PUBLIC_WEATHER } from "@/lib/public-safety/weather-default";

const WORKER_SECTIONS = [
  "feed",
  "quickActions",
  "weather",
  "jobs",
  "safetyBlog",
  "achievements",
] as const;

/** Fallback when the API is unreachable so /hub still renders. */
export function emptyHomepagePayload(role: string | null): HomepagePayload {
  const hubRole = mapSessionRoleToHubRole(role);
  return {
    hubRole,
    sections: [...WORKER_SECTIONS],
    feed: { items: [], nextCursor: null },
    quickActions: [
      { id: "jobs", label: "Browse jobs", href: "/jobs", icon: "briefcase" },
      { id: "safety", label: "Safety blog", href: "/safety", icon: "shield" },
      { id: "experts", label: "Expert Q&A", href: "/experts", icon: "messages" },
    ],
    trendingTopics: [],
    weather: DEFAULT_PUBLIC_WEATHER,
    jobPreview: [],
    safetyBlogPreview: [],
    projectUpdates: [],
    achievements: [],
    announcements: [],
    cachedAt: new Date().toISOString(),
  };
}
