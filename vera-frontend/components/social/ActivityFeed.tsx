"use client";

import type { SocialActivity } from "@vera/api-contract";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchActivity } from "@/lib/social/api";
import { buttonStyles } from "@/components/ui";

const VERB_LABEL: Record<SocialActivity["verb"], string> = {
  LIKE: "liked",
  UNLIKE: "unliked",
  COMMENT: "commented on",
  SHARE: "shared",
  FOLLOW: "followed",
  UNFOLLOW: "unfollowed",
  SUBSCRIBE: "subscribed to",
};

type Props = {
  scope?: "me" | "following" | "all";
};

export function ActivityFeed({ scope = "following" }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState<SocialActivity[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetchActivity(session, { scope, limit: 30 })
      .then((res) => {
        setItems(res.items);
        setCursor(res.nextCursor);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [session, scope]);

  async function loadMore() {
    if (!session || !cursor) return;
    const res = await fetchActivity(session, { scope, cursor, limit: 30 });
    setItems((prev) => [...prev, ...res.items]);
    setCursor(res.nextCursor);
  }

  if (loading) {
    return <p className="text-sm text-vera-muted">Loading activity…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-vera-muted">
        No activity yet. Like, comment, or follow people to see updates here.
      </p>
    );
  }

  return (
    <ul className="space-y-vera-3">
      {items.map((a) => (
        <li
          key={a.id}
          className="rounded-lg border border-vera-border bg-vera-surface px-vera-4 py-vera-3 text-sm"
        >
          <p>
            <span className="font-medium">{a.actorName}</span>{" "}
            <span className="text-vera-muted">{VERB_LABEL[a.verb]}</span>{" "}
            {a.summary ? (
              <span className="text-vera-deep">{a.summary}</span>
            ) : null}
          </p>
          <div className="mt-vera-1 flex items-center justify-between text-xs text-vera-muted">
            <time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleString()}</time>
            {a.url ? (
              <Link href={a.url} className="text-vera-teal hover:underline">
                View
              </Link>
            ) : a.targetType === "USER" ? (
              <Link
                href={`/hub/profile/${a.targetId}`}
                className="text-vera-teal hover:underline"
              >
                Profile
              </Link>
            ) : null}
          </div>
        </li>
      ))}
      {cursor ? (
        <li>
          <button
            type="button"
            onClick={() => void loadMore()}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            Load more
          </button>
        </li>
      ) : null}
    </ul>
  );
}
