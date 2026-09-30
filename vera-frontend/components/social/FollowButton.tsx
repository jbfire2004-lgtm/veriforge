"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { fetchFollowStatus, followUser, unfollowUser } from "@/lib/social/api";
import { buttonStyles } from "@/components/ui";

type Props = {
  userId: number;
  size?: "sm" | "md";
};

export function FollowButton({ userId, size = "sm" }: Props) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<{ following: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.user?.id || session.user.id === String(userId)) return;
    fetchFollowStatus(session, userId)
      .then((s) => setStatus({ following: s.following }))
      .catch(() => setStatus({ following: false }));
  }, [session, userId]);

  const toggle = useCallback(() => {
    if (!session) return;
    startTransition(async () => {
      const next = status?.following
        ? await unfollowUser(session, userId)
        : await followUser(session, userId);
      setStatus({ following: next.following });
    });
  }, [session, userId, status?.following]);

  if (!session || session.user?.id === String(userId)) return null;
  if (!status) return null;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={toggle}
      className={buttonStyles({
        variant: status.following ? "outline" : "primary",
        size,
      })}
    >
      {status.following ? "Following" : "Follow"}
    </button>
  );
}
