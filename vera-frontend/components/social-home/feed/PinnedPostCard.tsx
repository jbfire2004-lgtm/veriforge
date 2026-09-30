"use client";

import type { SocialFeedPage } from "@vera/api-contract";
import { FeedPostCard } from "./FeedPostCard";

type Pinned = Extract<SocialFeedPage["items"][number], { kind: "pinned" }>;

export function PinnedPostCard({ entry }: { entry: Pinned }) {
  return (
    <div className="rounded-xl ring-2 ring-vera-teal/30">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-vera-teal">
        Pinned
      </p>
      <FeedPostCard post={entry.post} />
    </div>
  );
}
