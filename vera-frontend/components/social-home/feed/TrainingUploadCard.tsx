"use client";

import type { SocialPostCard } from "@vera/api-contract";
import { FeedPostCard } from "./FeedPostCard";

export function TrainingUploadCard({ post }: { post: SocialPostCard }) {
  return <FeedPostCard post={post} />;
}
