"use client";

import type { FeedItemWithEngagement } from "@vera/api-contract";
import { useSession } from "next-auth/react";
import { useCallback, useState, useTransition } from "react";
import { interactFeed } from "@/lib/hub/feed-api";
import { buttonStyles } from "@/components/ui";

type Props = {
  item: FeedItemWithEngagement;
  onComment: () => void;
  onShare: () => void;
  onEngagementChange?: (item: FeedItemWithEngagement) => void;
};

export function FeedInteractionBar({
  item,
  onComment,
  onShare,
  onEngagementChange,
}: Props) {
  const { data: session } = useSession();
  const [pending, startTransition] = useTransition();
  const [engagement, setEngagement] = useState(item.engagement);

  const toggleLike = useCallback(() => {
    if (!session) return;
    startTransition(async () => {
      await interactFeed(session, { feedItemId: item.id, type: "LIKE" });
      const next = {
        ...engagement,
        likedByMe: !engagement.likedByMe,
        likeCount: engagement.likedByMe
          ? Math.max(0, engagement.likeCount - 1)
          : engagement.likeCount + 1,
      };
      setEngagement(next);
      onEngagementChange?.({ ...item, engagement: next });
    });
  }, [session, item, engagement, onEngagementChange]);

  const share = useCallback(() => {
    if (!session) return;
    startTransition(async () => {
      await interactFeed(session, { feedItemId: item.id, type: "SHARE" });
      const next = { ...engagement, shareCount: engagement.shareCount + 1 };
      setEngagement(next);
      onEngagementChange?.({ ...item, engagement: next });
    });
    onShare();
  }, [session, item, engagement, onShare, onEngagementChange]);

  return (
    <div
      className="flex flex-wrap items-center gap-vera-3 border-t border-vera-border pt-vera-3 text-sm"
      role="group"
      aria-label="Feed actions"
    >
      <button
        type="button"
        disabled={pending}
        onClick={toggleLike}
        className={buttonStyles({
          variant: engagement.likedByMe ? "primary" : "ghost",
          size: "sm",
        })}
        aria-pressed={engagement.likedByMe}
      >
        {engagement.likedByMe ? "Liked" : "Like"} ({engagement.likeCount})
      </button>
      <button
        type="button"
        onClick={onComment}
        className={buttonStyles({ variant: "ghost", size: "sm" })}
      >
        Comment ({engagement.commentCount})
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={share}
        className={buttonStyles({ variant: "ghost", size: "sm" })}
      >
        Share ({engagement.shareCount})
      </button>
    </div>
  );
}
