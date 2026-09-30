"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchHubSuggestions, type HubSuggestions } from "@/lib/hub/social/follow-api";
import { HubFollowButton } from "@/components/hub/social/HubFollowButton";
import { HubSurfaceCard } from "@/components/hub/HubSurfaceCard";
import { requestHubConnection } from "@/lib/hub/social/profile-api";
import { buttonStyles } from "@/components/ui";

export function SuggestionRail() {
  const { data: session } = useSession();
  const [data, setData] = useState<HubSuggestions | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchHubSuggestions(session)
      .then(setData)
      .catch(() => setData({ people: [], companies: [], providers: [] }));
  }, [session]);

  if (!data) return null;

  const hasContent =
    data.people.length > 0 || data.companies.length > 0 || data.providers.length > 0;
  if (!hasContent) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {data.people.length > 0 ? (
        <HubSurfaceCard className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748b]">
            People you may know
          </h3>
          <ul className="mt-3 space-y-3">
            {data.people.map((p) => (
              <li key={p.userId} className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/hub/profile/${p.userId}`}
                    className="text-sm font-semibold text-[#2A2E33] hover:text-[#2F8F8C]"
                  >
                    {p.displayName}
                  </Link>
                  {p.headline ? (
                    <p className="text-xs text-[#5a6b7c]">{p.headline}</p>
                  ) : null}
                  <p className="text-[10px] text-[#94a3b8]">{p.reason}</p>
                </div>
                <ConnectButton userId={p.userId} />
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}

      {data.companies.length > 0 ? (
        <HubSurfaceCard className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748b]">
            Companies to follow
          </h3>
          <ul className="mt-3 space-y-3">
            {data.companies.map((c) => (
              <li key={c.companyId} className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/hub/company/${c.companyId}`}
                    className="text-sm font-semibold text-[#2A2E33] hover:text-[#2F8F8C]"
                  >
                    {c.name}
                  </Link>
                  {c.tagline || c.industry ? (
                    <p className="text-xs text-[#5a6b7c]">{c.tagline ?? c.industry}</p>
                  ) : null}
                </div>
                <HubFollowButton
                  targetType="COMPANY"
                  targetId={String(c.companyId)}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}

      {data.providers.length > 0 ? (
        <HubSurfaceCard className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#64748b]">
            Training providers
          </h3>
          <ul className="mt-3 space-y-3">
            {data.providers.map((p) => (
              <li key={p.providerId} className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/hub/provider/${p.providerId}`}
                    className="text-sm font-semibold text-[#2A2E33] hover:text-[#2F8F8C]"
                  >
                    {p.name}
                  </Link>
                  {p.bio ? (
                    <p className="line-clamp-2 text-xs text-[#5a6b7c]">{p.bio}</p>
                  ) : null}
                </div>
                <HubFollowButton
                  targetType="PROVIDER"
                  targetId={String(p.providerId)}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}
    </div>
  );
}

function ConnectButton({ userId }: { userId: number }) {
  const { data: session } = useSession();
  const [sent, setSent] = useState(false);

  if (!session) return null;

  return (
    <button
      type="button"
      disabled={sent}
      onClick={() => {
        requestHubConnection(session, userId).then(() => setSent(true));
      }}
      className={buttonStyles({ variant: "outline", size: "sm" })}
    >
      {sent ? "Sent" : "Connect"}
    </button>
  );
}
