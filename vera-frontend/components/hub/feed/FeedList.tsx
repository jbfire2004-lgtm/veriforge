"use client";

import type { FeedItemDto, FeedItemWithEngagement, FeedPage } from "@vera/api-contract";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { fetchFeedPage, feedWsUrl } from "@/lib/hub/feed-api";
import { buttonStyles } from "@/components/ui";
import { FeedCard } from "./FeedCard";
import { CommentDrawer } from "./CommentDrawer";
import { ShareModal } from "./ShareModal";

type Props = {
  initialItems: FeedItemDto[] | FeedItemWithEngagement[];
  initialCursor: string | null;
  loadPage?: (
    session: Session | null,
    params: { cursor?: string; limit?: number; refresh?: boolean },
  ) => Promise<FeedPage>;
};

function withDefaultEngagement(
  item: FeedItemDto | FeedItemWithEngagement,
): FeedItemWithEngagement {
  if ("engagement" in item && item.engagement) return item as FeedItemWithEngagement;
  return {
    ...item,
    engagement: {
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      likedByMe: false,
    },
  };
}

export function FeedList({ initialItems, initialCursor, loadPage }: Props) {
  const { data: session } = useSession();
  const fetchPage = loadPage ?? fetchFeedPage;
  const [items, setItems] = useState(() =>
    initialItems.map(withDefaultEngagement),
  );
  const [cursor, setCursor] = useState(initialCursor);
  const [pending, startTransition] = useTransition();
  const [commentItem, setCommentItem] = useState<FeedItemWithEngagement | null>(null);
  const [shareItem, setShareItem] = useState<FeedItemWithEngagement | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (!cursor || !session) return;
    startTransition(async () => {
      const page = await fetchPage(session, { cursor, limit: 20 });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    });
  }, [cursor, session, fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !pending) loadMore();
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [cursor, loadMore, pending]);

  useEffect(() => {
    const token = (session as { accessToken?: string } | null)?.accessToken;
    if (!token) return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(feedWsUrl(token));
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as { type: string };
          if (msg.type === "feed.item.created" && session) {
            fetchPage(session, { refresh: true, limit: 20 }).then((page) => {
              setItems(page.items);
              setCursor(page.nextCursor);
            });
          }
        } catch {
          /* ignore */
        }
      };
    } catch {
      /* ws unavailable */
    }
    return () => ws?.close();
  }, [session, fetchPage]);

  return (
    <>
      <div className="grid gap-vera-4 sm:grid-cols-2">
        {items.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            onComment={() => setCommentItem(item)}
            onShare={() => setShareItem(item)}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4" aria-hidden />
      {cursor && pending ? (
        <p className="text-sm text-vera-muted text-center py-vera-4">Loading more…</p>
      ) : null}
      {cursor && !pending ? (
        <button
          type="button"
          onClick={loadMore}
          className={buttonStyles({ variant: "outline", size: "md" })}
        >
          Load more
        </button>
      ) : null}
      <CommentDrawer
        item={commentItem}
        open={commentItem != null}
        onClose={() => setCommentItem(null)}
      />
      <ShareModal
        item={shareItem}
        open={shareItem != null}
        onClose={() => setShareItem(null)}
      />
    </>
  );
}
