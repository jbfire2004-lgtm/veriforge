"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  createCompanyPost,
  fetchCompanyMembers,
  fetchCompanyPage,
  fetchCompanyPosts,
  updateCompanyPage,
  type HubCompanyMember,
  type HubCompanyPage as HubCompanyPageData,
  type HubCompanyPost,
} from "@/lib/hub/social/company-api";
import { HubFollowButton } from "@/components/hub/social/HubFollowButton";
import { EntityPostComposer } from "@/components/hub/social/EntityPostComposer";
import { HubPageHeader } from "@/components/hub/HubPageHeader";
import { HubSurfaceCard } from "@/components/hub/HubSurfaceCard";
import { buttonStyles } from "@/components/ui";

type Props = {
  companyId: number;
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

export function HubCompanyPage({ companyId }: Props) {
  const { data: session } = useSession();
  const [page, setPage] = useState<HubCompanyPageData | null>(null);
  const [members, setMembers] = useState<HubCompanyMember[]>([]);
  const [posts, setPosts] = useState<HubCompanyPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ tagline: "", about: "", industry: "" });
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    if (!session) return;
    Promise.all([
      fetchCompanyPage(session, companyId),
      fetchCompanyMembers(session, companyId),
      fetchCompanyPosts(session, companyId),
    ])
      .then(([p, m, ps]) => {
        setPage(p);
        setMembers(m);
        setPosts(ps);
        setDraft({
          tagline: p.tagline ?? "",
          about: p.about ?? "",
          industry: p.industry ?? "",
        });
        setError(null);
      })
      .catch(() => setError("Company page could not be loaded."));
  }, [session, companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = () => {
    if (!session) return;
    startTransition(async () => {
      await updateCompanyPage(session, companyId, draft);
      setEditing(false);
      load();
    });
  };

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!page) {
    return <p className="text-sm text-[#5a6b7c]">Loading company page…</p>;
  }

  const location = [page.location?.city, page.location?.region].filter(Boolean).join(", ");

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      <div
        className="h-32 rounded-2xl bg-gradient-to-r from-[#2A2E33] to-[#2F8F8C]/80 bg-cover bg-center"
        style={page.bannerUrl ? { backgroundImage: `url(${page.bannerUrl})` } : undefined}
        aria-hidden
      />

      <HubPageHeader
        title={page.companyName}
        description={page.tagline ?? page.industry ?? "Company on Vera Hub"}
        badge="Company"
      />

      <HubSurfaceCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div
              className="-mt-12 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-white text-lg font-bold text-[#2A2E33] shadow-md"
              style={
                page.logoUrl
                  ? { backgroundImage: `url(${page.logoUrl})`, backgroundSize: "cover" }
                  : undefined
              }
            >
              {!page.logoUrl ? page.companyName.charAt(0).toUpperCase() : null}
            </div>
            <div className="pt-1">
              <p className="text-lg font-bold text-[#2A2E33]">{page.companyName}</p>
              {page.industry ? (
                <p className="text-sm text-[#5a6b7c]">{page.industry}</p>
              ) : null}
              {location ? <p className="text-xs text-[#64748b]">{location}</p> : null}
              <p className="mt-2 text-xs text-[#64748b]">
                {page.followerCount} followers · {page.memberCount} people ·{" "}
                {page.openJobCount} open roles
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <HubFollowButton targetType="COMPANY" targetId={String(companyId)} />
            {page.canManage ? (
              <button
                type="button"
                className={buttonStyles({ variant: "outline", size: "sm" })}
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Cancel" : "Edit page"}
              </button>
            ) : null}
            {page.openJobCount > 0 ? (
              <Link
                href="/jobs"
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                View jobs
              </Link>
            ) : null}
          </div>
        </div>

        {editing ? (
          <div className="mt-6 space-y-3 border-t border-[#2A2E33]/10 pt-4">
            <label className="block text-sm">
              <span className="font-medium text-[#2A2E33]">Tagline</span>
              <input
                value={draft.tagline}
                onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#2A2E33]/15 px-3 py-2 text-sm"
                maxLength={160}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-[#2A2E33]">Industry</span>
              <input
                value={draft.industry}
                onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#2A2E33]/15 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-[#2A2E33]">About</span>
              <textarea
                value={draft.about}
                onChange={(e) => setDraft((d) => ({ ...d, about: e.target.value }))}
                rows={4}
                className="mt-1 w-full rounded-lg border border-[#2A2E33]/15 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              Save page
            </button>
          </div>
        ) : page.about ? (
          <p className="mt-4 text-sm leading-relaxed text-[#5a6b7c]">{page.about}</p>
        ) : null}

        {page.specialties.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {page.specialties.map((s) => (
              <li
                key={s}
                className="rounded-full bg-[#E4F3F2] px-3 py-1 text-xs font-medium text-[#2A2E33]"
              >
                {s}
              </li>
            ))}
          </ul>
        ) : null}

        {page.websiteUrl ? (
          <a
            href={page.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-[#2F8F8C] hover:underline"
          >
            Visit website
          </a>
        ) : null}
      </HubSurfaceCard>

      {page.canManage ? (
        <EntityPostComposer
          placeholder={`Share news from ${page.companyName}…`}
          onPost={async (body) => {
            if (!session) return;
            await createCompanyPost(session, companyId, { body });
            load();
          }}
        />
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

      {members.length > 0 ? (
        <HubSurfaceCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#64748b]">People</h2>
          <ul className="mt-3 space-y-2">
            {members.slice(0, 12).map((m) => (
              <li key={m.userId} className="flex items-center justify-between text-sm">
                <Link
                  href={`/hub/profile/${m.userId}`}
                  className="font-medium text-[#2A2E33] hover:text-[#2F8F8C]"
                >
                  {m.displayName}
                </Link>
                <span className="text-xs text-[#64748b]">{m.title ?? m.primaryTrade ?? m.role}</span>
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}
    </div>
  );
}
