"use client";

import { useState } from "react";
import { likePost, unlikePost } from "@/lib/social-home/api";
import { cn } from "@/src/lib/utils";

type Props = {
  postId: string;
  count: number;
  likedByMe?: boolean;
};

export function PostLikes({ postId, count: initial, likedByMe: initialLiked }: Props) {
  const [count, setCount] = useState(initial);
  const [liked, setLiked] = useState(!!initialLiked);

  async function toggle() {
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      if (next) await likePost(postId);
      else await unlikePost(postId);
    } catch {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className={cn(
        "text-sm font-medium",
        liked ? "text-vera-teal" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {liked ? "Liked" : "Like"} · {count}
    </button>
  );
}
