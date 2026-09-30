"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchSuggestedProviders } from "@/lib/social-home/api";
import { FollowButton } from "../feed/FollowButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export function SuggestedProvidersWidget() {
  const [providers, setProviders] = useState<
    { id: number; name: string; logoUrl?: string | null }[]
  >([]);

  useEffect(() => {
    fetchSuggestedProviders()
      .then((rows) => setProviders(rows as typeof providers))
      .catch(() => setProviders([]));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Suggested providers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {providers.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <Link
              href={`/providers/${p.id}`}
              className="text-sm font-medium hover:text-vera-teal hover:underline"
            >
              {p.name}
            </Link>
            <FollowButton targetType="PROVIDER" targetId={String(p.id)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
