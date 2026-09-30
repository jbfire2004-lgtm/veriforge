"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  createProviderPost,
  fetchProviderChannel,
  fetchProviderCourses,
  fetchProviderPosts,
  type HubProviderChannel,
  type HubProviderCourse,
} from "@/lib/hub/social/provider-api";
import type { HubCompanyPost } from "@/lib/hub/social/company-api";
import { HubFollowButton } from "@/components/hub/social/HubFollowButton";
import { EntityPostComposer } from "@/components/hub/social/EntityPostComposer";
import { HubPageHeader } from "@/components/hub/HubPageHeader";
import { HubSurfaceCard } from "@/components/hub/HubSurfaceCard";

type Props = {
  providerId: number;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function HubProviderPage({ providerId }: Props) {
  const { data: session } = useSession();
  const [channel, setChannel] = useState<HubProviderChannel | null>(null);
  const [courses, setCourses] = useState<HubProviderCourse[]>([]);
  const [posts, setPosts] = useState<HubCompanyPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!session) return;
    Promise.all([
      fetchProviderChannel(session, providerId),
      fetchProviderCourses(session, providerId),
      fetchProviderPosts(session, providerId),
    ])
      .then(([ch, c, p]) => {
        setChannel(ch);
        setCourses(c);
        setPosts(p);
        setError(null);
      })
      .catch(() => setError("Provider channel could not be loaded."));
  }, [session, providerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!channel) {
    return <p className="text-sm text-[#5a6b7c]">Loading provider channel…</p>;
  }

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      <div
        className="h-32 rounded-2xl bg-gradient-to-r from-[#1e4a7a] to-[#2F85CC]/80 bg-cover bg-center"
        style={channel.bannerUrl ? { backgroundImage: `url(${channel.bannerUrl})` } : undefined}
        aria-hidden
      />

      <HubPageHeader
        title={channel.displayName}
        description={channel.bio ?? "Training provider on Vera Hub"}
        badge="Provider"
      />

      <HubSurfaceCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div
              className="-mt-12 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-white text-lg font-bold text-[#2A2E33] shadow-md"
              style={
                channel.logoUrl
                  ? { backgroundImage: `url(${channel.logoUrl})`, backgroundSize: "cover" }
                  : undefined
              }
            >
              {!channel.logoUrl ? channel.displayName.charAt(0).toUpperCase() : null}
            </div>
            <div className="pt-1">
              <p className="text-lg font-bold text-[#2A2E33]">{channel.displayName}</p>
              <p className="mt-2 text-xs text-[#64748b]">
                {channel.followerCount} followers · {channel.courseCount} courses
              </p>
            </div>
          </div>
          <HubFollowButton targetType="PROVIDER" targetId={String(providerId)} />
        </div>

        {channel.bio ? (
          <p className="mt-4 text-sm leading-relaxed text-[#5a6b7c]">{channel.bio}</p>
        ) : null}

        {channel.websiteUrl ? (
          <a
            href={channel.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-[#2F8F8C] hover:underline"
          >
            Visit website
          </a>
        ) : null}
      </HubSurfaceCard>

      {channel.canManage ? (
        <EntityPostComposer
          placeholder={`Share training news from ${channel.displayName}…`}
          onPost={async (body) => {
            if (!session) return;
            await createProviderPost(session, providerId, { body });
            load();
          }}
        />
      ) : null}

      {courses.length > 0 ? (
        <HubSurfaceCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#64748b]">Courses</h2>
          <ul className="mt-3 space-y-3">
            {courses.map((c) => (
              <li key={c.id} className="text-sm">
                <p className="font-semibold text-[#2A2E33]">{c.name}</p>
                <p className="text-xs text-[#64748b]">{c.code}</p>
                {c.description ? (
                  <p className="mt-1 text-[#5a6b7c]">{c.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}

      {posts.length > 0 ? (
        <HubSurfaceCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#64748b]">Updates</h2>
          <ul className="mt-4 space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-[#2A2E33]/10 pb-4 last:border-0">
                {post.title ? (
                  <p className="font-semibold text-[#2A2E33]">{post.title}</p>
                ) : null}
                <p className="mt-1 text-sm text-[#5a6b7c]">{post.body}</p>
                <p className="mt-2 text-xs text-[#64748b]">
                  {post.authorName} · {formatDate(post.publishedAt)}
                </p>
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}

      <Link href="/hub" className="text-sm font-medium text-[#2F8F8C] hover:underline">
        Back to Hub feed
      </Link>
    </div>
  );
}
