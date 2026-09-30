"use client";

import type { SocialPostCard } from "@vera/api-contract";
import { FeedPostCard } from "./FeedPostCard";

export function CompanyAnnouncementCard({
  post,
  legacy,
}: {
  post?: SocialPostCard;
  legacy?: Parameters<typeof FeedPostCard>[0]["legacy"];
}) {
  return <FeedPostCard post={post} legacy={legacy} />;
}
