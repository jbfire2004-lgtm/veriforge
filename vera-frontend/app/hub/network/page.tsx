"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { SocialUserSummary } from "@vera/api-contract";
import { fetchFollowers, fetchFollowing } from "@/lib/social/api";
import { FollowButton } from "@/components/social/FollowButton";
import { HubPageHeader } from "@/components/hub/HubPageHeader";
import { cn } from "@/src/lib/utils";

export default function HubNetworkPage() {
  const { data: session } = useSession();
  const [following, setFollowing] = useState<SocialUserSummary[]>([]);
  const [followers, setFollowers] = useState<SocialUserSummary[]>([]);
  const [tab, setTab] = useState<"following" | "followers">("following");

  useEffect(() => {
    if (!session) return;
    Promise.all([fetchFollowing(session), fetchFollowers(session)])
      .then(([f, r]) => {
        setFollowing(f);
        setFollowers(r);
      })
      .catch(() => {
        setFollowing([]);
        setFollowers([]);
      });
  }, [session]);

  const list = tab === "following" ? following : followers;
  const companyId = session?.user?.companyId;

  return (
    <div className="max-w-2xl space-y-6 pb-16">
      <HubPageHeader
        title="Your network"
        description="People you follow and your followers on Vera Hub."
        badge="Connections"
      />

      {companyId ? (
        <Link
          href={`/hub/company/${companyId}`}
          className="block rounded-xl border border-[#2A2E33]/10 bg-white px-4 py-3 text-sm font-semibold text-[#2F8F8C] shadow-sm hover:bg-[#E4F3F2]"
        >
          View your company page →
        </Link>
      ) : null}

      <div
        className="flex gap-1 rounded-xl border border-[#2A2E33]/10 bg-white/80 p-1 shadow-sm"
        role="tablist"
        aria-label="Network lists"
      >
        {(
          [
            ["following", `Following (${following.length})`],
            ["followers", `Followers (${followers.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
              tab === key
                ? "bg-gradient-to-br from-[#2A2E33] to-[#2F8F8C]/90 text-white shadow-sm"
                : "text-[#5a6b7c] hover:bg-[#E4F3F2] hover:text-[#2A2E33]",
            )}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {list.map((u) => (
          <li
            key={u.userId}
            className="flex items-center justify-between rounded-xl border border-[#2A2E33]/10 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <Link
                href={`/hub/profile/${u.userId}`}
                className="text-sm font-semibold text-[#2A2E33] hover:text-[#2F8F8C]"
              >
                {u.displayName}
              </Link>
              {u.headline ? (
                <p className="text-xs text-[#5a6b7c]">{u.headline}</p>
              ) : null}
            </div>
            <FollowButton userId={u.userId} />
          </li>
        ))}
        {list.length === 0 ? (
          <li className="rounded-xl border border-dashed border-[#2A2E33]/15 bg-white/60 px-4 py-8 text-center text-sm text-[#5a6b7c]">
            No connections in this list yet.{" "}
            <Link href="/hub/activity" className="font-medium text-[#2F8F8C] hover:underline">
              Browse activity
            </Link>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
