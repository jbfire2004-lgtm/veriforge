"use client";

import { useEffect, useState } from "react";
import { fetchSponsoredAds } from "@/lib/social-home/api";
import { SponsoredAdCard } from "../feed/SponsoredAdCard";
import { Card, CardHeader, CardTitle } from "@/components/ui";

export function SponsoredAdsWidget() {
  const [ads, setAds] = useState<
    Extract<
      Awaited<ReturnType<typeof fetchSponsoredAds>> extends (infer U)[]
        ? U
        : never,
      { kind: "ad" }
    >[]
  >([]);

  useEffect(() => {
    fetchSponsoredAds()
      .then((rows) => setAds((rows as { kind: "ad" }[]).filter((r) => r.kind === "ad")))
      .catch(() => setAds([]));
  }, []);

  if (!ads.length) return null;
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Sponsored</CardTitle>
        </CardHeader>
      </Card>
      {ads.slice(0, 2).map((ad) => (
        <SponsoredAdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
}
