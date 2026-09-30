"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  fetchFollowStatus,
  followHubTarget,
  unfollowHubTarget,
  type HubFollowTargetType,
} from "@/lib/hub/social/follow-api";
import { buttonStyles } from "@/components/ui";

type Props = {
  targetType: HubFollowTargetType;
  targetId: string;
  size?: "sm" | "md";
};

export function HubFollowButton({ targetType, targetId, size = "sm" }: Props) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!session) return;
    fetchFollowStatus(session, targetType, targetId)
      .then((s) => setFollowing(s.following))
      .catch(() => setFollowing(false));
  }, [session, targetType, targetId]);

  const toggle = useCallback(() => {
    if (!session || following == null) return;
    startTransition(async () => {
      if (following) {
        await unfollowHubTarget(session, targetType, targetId);
        setFollowing(false);
      } else {
        await followHubTarget(session, targetType, targetId);
        setFollowing(true);
      }
    });
  }, [session, following, targetType, targetId]);

  if (!session || following == null) return null;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={toggle}
      className={buttonStyles({
        variant: following ? "outline" : "primary",
        size,
      })}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
