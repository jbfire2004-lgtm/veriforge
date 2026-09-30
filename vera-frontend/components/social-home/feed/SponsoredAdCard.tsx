"use client";

import type { SocialFeedPage } from "@vera/api-contract";
import { BaseFeedCard } from "./BaseFeedCard";

type Ad = Extract<SocialFeedPage["items"][number], { kind: "ad" }>;

export function SponsoredAdCard({ ad }: { ad: Ad }) {
  return (
    <BaseFeedCard badge="Sponsored" title={ad.title} className="border-dashed bg-muted/30">
      <p>{ad.body}</p>
      {ad.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.imageUrl} alt="" className="mt-3 max-h-48 w-full rounded-lg object-cover" />
      ) : null}
      {ad.ctaUrl ? (
        <a
          href={ad.ctaUrl}
          className="mt-3 inline-block text-sm font-semibold text-vera-teal hover:underline"
        >
          {ad.ctaLabel ?? "Learn more"}
        </a>
      ) : null}
    </BaseFeedCard>
  );
}
