"use client";

import type { FeedItemDto, FeedPage } from "@vera/api-contract";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { FeedList } from "@/components/hub/feed/FeedList";
import { PostComposer } from "@/components/hub/social/PostComposer";
import {
  fetchHubFeedPage,
  type HubFeedFilter,
} from "@/lib/hub/social/hub-feed-api";
import { fetchFeedPage } from "@/lib/hub/feed-api";
import { HubSection } from "./HubSection";
import { cn } from "@/src/lib/utils";

const FILTERS: { id: HubFeedFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "network", label: "Network" },
  { id: "company", label: "Company" },
  { id: "projects", label: "Projects" },
  { id: "providers", label: "Providers" },
];

type Props = {
  initialItems: FeedItemDto[];
  initialCursor: string | null;
  useHubFeed?: boolean;
};

export function PersonalizedFeedSection({
  initialItems,
  initialCursor,
  useHubFeed = true,
}: Props) {
  const { data: session } = useSession();
  const [filter, setFilter] = useState<HubFeedFilter>("all");
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [feedKey, setFeedKey] = useState(0);

  const loadPage = useCallback(
    async (s: Session | null, params: { cursor?: string; limit?: number; refresh?: boolean }) => {
      if (useHubFeed) {
        return fetchHubFeedPage(s, { ...params, filter });
      }
      return fetchFeedPage(s, params);
    },
    [filter, useHubFeed],
  );

  const refreshFeed = useCallback(() => {
    if (!session) return;
    loadPage(session, { refresh: true, limit: 20 }).then((page: FeedPage) => {
      setItems(page.items);
      setCursor(page.nextCursor);
      setFeedKey((k) => k + 1);
    });
  }, [session, loadPage]);

  const onFilterChange = (next: HubFeedFilter) => {
    if (!session || next === filter) return;
    setFilter(next);
    fetchHubFeedPage(session, { filter: next, limit: 20 })
      .then((page) => {
        setItems(page.items);
        setCursor(page.nextCursor);
        setFeedKey((k) => k + 1);
      })
      .catch(() => {
        setItems([]);
        setCursor(null);
      });
  };

  return (
    <HubSection title="Your feed" description="Updates from your network, company, and projects">
      <div className="space-y-4">
        <PostComposer onPosted={refreshFeed} />

        {useHubFeed ? (
          <div
            className="flex flex-wrap gap-1 rounded-xl border border-[#2A2E33]/10 bg-white/80 p-1 shadow-sm"
            role="tablist"
            aria-label="Feed filters"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                  filter === f.id
                    ? "bg-gradient-to-br from-[#2A2E33] to-[#2F8F8C]/90 text-white shadow-sm"
                    : "text-[#5a6b7c] hover:bg-[#E4F3F2] hover:text-[#2A2E33]",
                )}
                onClick={() => onFilterChange(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        {items.length > 0 ? (
          <FeedList
            key={feedKey}
            initialItems={items}
            initialCursor={cursor}
            loadPage={loadPage}
          />
        ) : (
          <p className="rounded-xl border border-dashed border-[#2A2E33]/15 bg-white/60 px-4 py-8 text-center text-sm text-[#5a6b7c]">
            No posts in this feed yet. Share an update or follow people in your network.
          </p>
        )}
      </div>
    </HubSection>
  );
}
