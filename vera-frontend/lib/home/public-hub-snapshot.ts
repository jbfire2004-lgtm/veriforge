import type { HomepagePayload, HubSection } from "@vera/api-contract";
import type { Session } from "next-auth";
import { fetchHomepage } from "@/lib/hub/homepage-api";
import { emptyHomepagePayload } from "@/lib/hub/empty-homepage";
import { DEFAULT_PUBLIC_WEATHER } from "@/lib/public-safety/weather-default";

/** Sections shown on `/home` — industry-wide, not company-scoped. */
export const PUBLIC_HOME_SECTIONS: HubSection[] = [
  "weather",
  "jobs",
  "trending",
  "safetyBlog",
  "quickActions",
];

export async function fetchPublicHubSnapshot(
  session: Session | null,
): Promise<HomepagePayload> {
  const role = session?.user?.role ?? null;
  if (!session?.accessToken) {
    const empty = emptyHomepagePayload(role);
    empty.weather = DEFAULT_PUBLIC_WEATHER;
    return filterPublicHomePayload(empty);
  }
  try {
    const data = await fetchHomepage(session, { limit: 8 });
    return filterPublicHomePayload(data);
  } catch {
    return filterPublicHomePayload(emptyHomepagePayload(role));
  }
}

export function filterPublicHomePayload(data: HomepagePayload): HomepagePayload {
  const sections = data.sections.filter((s) =>
    PUBLIC_HOME_SECTIONS.includes(s),
  );

  const genericQuickActions = data.quickActions.filter((a) =>
    ["/jobs", "/safety", "/experts", "/hub", "/safety-recalls", "/safety-bulletins"].some(
      (p) => a.href.startsWith(p),
    ),
  );

  return {
    ...data,
    sections:
      genericQuickActions.length > 0
        ? [...sections, "quickActions" as HubSection]
        : sections,
    quickActions: genericQuickActions.length
      ? genericQuickActions
      : [
          { id: "jobs", label: "Browse jobs", href: "/jobs", icon: "briefcase" },
          { id: "safety", label: "Safety blog", href: "/safety", icon: "shield" },
          {
            id: "experts",
            label: "Ask an expert",
            href: "/experts",
            icon: "messages",
          },
          {
            id: "recalls",
            label: "Safety recalls",
            href: "/safety-recalls",
            icon: "shield",
          },
          {
            id: "bulletins",
            label: "Bulletins",
            href: "/safety-bulletins",
            icon: "shield",
          },
        ],
    projectUpdates: [],
    achievements: [],
    announcements: [],
    feed: { items: [], nextCursor: null },
  };
}
