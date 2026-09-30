"use client";

import type { SocialPostCard } from "@vera/api-contract";
import { FeedPostCard } from "./FeedPostCard";

export function ProviderPostCard({ post }: { post: SocialPostCard }) {
  return <FeedPostCard post={post} />;
}
