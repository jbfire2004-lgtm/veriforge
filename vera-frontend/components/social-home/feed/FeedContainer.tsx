"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { SocialFeedPage } from "@vera/api-contract";
import { fetchSocialFeed } from "@/lib/social-home/api";
import { FeedPostCard } from "./FeedPostCard";
import { PinnedPostCard } from "./PinnedPostCard";
import { SponsoredAdCard } from "./SponsoredAdCard";
import { CompanyAnnouncementCard } from "./CompanyAnnouncementCard";
import { SafetyBulletinCard } from "./SafetyBulletinCard";
import { JobPostingCard } from "./JobPostingCard";
import { TrainingUploadCard } from "./TrainingUploadCard";
import { ProviderPostCard } from "./ProviderPostCard";

type Props = {
  initial: SocialFeedPage;
};

export function FeedContainer({ initial }: Props) {
  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [pending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (!cursor) return;
    startTransition(async () => {
      const page = await fetchSocialFeed({ cursor, limit: 20 });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    });
  }, [cursor]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !pending) loadMore();
      },
      { rootMargin: "240px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [cursor, loadMore, pending]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-vera-5">
      {items.map((entry, idx) => {
        const key = `${entry.kind}-${"id" in entry ? entry.id : idx}`;
        switch (entry.kind) {
          case "pinned":
            return <PinnedPostCard key={key} entry={entry} />;
          case "post":
            if (entry.postType === "COMPANY_ANNOUNCEMENT")
              return <CompanyAnnouncementCard key={key} post={entry} />;
            if (entry.postType === "SAFETY_BULLETIN")
              return <SafetyBulletinCard key={key} post={entry} />;
            if (entry.postType === "JOB_POSTING")
              return <JobPostingCard key={key} post={entry} />;
            if (entry.postType === "TRAINING_UPLOAD")
              return <TrainingUploadCard key={key} post={entry} />;
            if (entry.postType === "PROVIDER_POST")
              return <ProviderPostCard key={key} post={entry} />;
            return <FeedPostCard key={key} post={entry} />;
          case "legacy":
            if (entry.source === "SAFETY_BLOG")
              return <SafetyBulletinCard key={key} legacy={entry} />;
            if (entry.source === "JOB_BOARD")
              return <JobPostingCard key={key} legacy={entry} />;
            if (entry.source === "COMPANY_ANNOUNCEMENT")
              return <CompanyAnnouncementCard key={key} legacy={entry} />;
            return <FeedPostCard key={key} legacy={entry} />;
          case "ad":
            return <SponsoredAdCard key={key} ad={entry} />;
          default:
            return null;
        }
      })}
      <div ref={sentinelRef} className="h-8" aria-hidden />
      {pending ? (
        <p className="text-center text-sm text-muted-foreground">Loading more…</p>
      ) : null}
    </div>
  );
}
