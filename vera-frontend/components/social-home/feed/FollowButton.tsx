"use client";

import { useState } from "react";
import { followTarget } from "@/lib/social-home/api";
import { buttonStyles } from "@/components/ui/button";

export function FollowButton({
  targetType,
  targetId,
}: {
  targetType: "COMPANY" | "PROVIDER" | "USER";
  targetId: string;
}) {
  const [following, setFollowing] = useState(false);
  return (
    <button
      type="button"
      className={buttonStyles({ variant: following ? "outline" : "teal", size: "sm" })}
      onClick={() => {
        void followTarget(targetType, targetId).then(() => setFollowing(true));
      }}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
