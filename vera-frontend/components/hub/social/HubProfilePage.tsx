"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  acceptHubConnection,
  declineHubConnection,
  fetchHubProfile,
  requestHubConnection,
  updateMyHubProfile,
  type HubProfile,
} from "@/lib/hub/social/profile-api";
import { HubPageHeader } from "@/components/hub/HubPageHeader";
import { HubSurfaceCard } from "@/components/hub/HubSurfaceCard";
import { buttonStyles } from "@/components/ui";
import { cn } from "@/src/lib/utils";

type Props = {
  userId: number;
};

function formatDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function HubProfilePage({ userId }: Props) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<HubProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ headline: "", about: "", primaryTrade: "" });
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    if (!session) return;
    fetchHubProfile(session, userId)
      .then((p) => {
        setProfile(p);
        setDraft({
          headline: p.headline ?? "",
          about: p.about ?? "",
          primaryTrade: p.primaryTrade ?? "",
        });
        setError(null);
      })
      .catch(() => setError("Profile could not be loaded."));
  }, [session, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = () => {
    if (!session) return;
    startTransition(async () => {
      await updateMyHubProfile(session, {
        headline: draft.headline,
        about: draft.about,
        primaryTrade: draft.primaryTrade,
      });
      setEditing(false);
      load();
    });
  };

  const connect = () => {
    if (!session) return;
    startTransition(async () => {
      await requestHubConnection(session, userId);
      load();
    });
  };

  const accept = (connectionId: string) => {
    if (!session) return;
    startTransition(async () => {
      await acceptHubConnection(session, connectionId);
      load();
    });
  };

  const decline = (connectionId: string) => {
    if (!session) return;
    startTransition(async () => {
      await declineHubConnection(session, connectionId);
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

  if (!profile) {
    return <p className="text-sm text-[#5a6b7c]">Loading profile…</p>;
  }

  const location = [profile.location?.city, profile.location?.region].filter(Boolean).join(", ");
  const isSelf = profile.connectionStatus === "self";

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      <HubPageHeader
        title={profile.displayName}
        description={profile.headline ?? profile.primaryTrade ?? "Vera Hub member"}
        badge={profile.openToWork ? "Open to work" : "Profile"}
      />

      <HubSurfaceCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2A2E33] to-[#2F8F8C] text-lg font-bold text-white",
                profile.photoUrl && "bg-cover bg-center",
              )}
              style={profile.photoUrl ? { backgroundImage: `url(${profile.photoUrl})` } : undefined}
              aria-hidden
            >
              {!profile.photoUrl ? profile.displayName.charAt(0).toUpperCase() : null}
            </div>
            <div>
              <p className="text-lg font-bold text-[#2A2E33]">{profile.displayName}</p>
              {profile.headline ? (
                <p className="text-sm text-[#5a6b7c]">{profile.headline}</p>
              ) : null}
              {profile.primaryTrade ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#2F8F8C]">
                  {profile.primaryTrade}
                </p>
              ) : null}
              {location ? <p className="mt-1 text-xs text-[#64748b]">{location}</p> : null}
              <p className="mt-2 text-xs text-[#64748b]">
                Profile {profile.profileCompleteness}% complete
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isSelf ? (
              <button
                type="button"
                className={buttonStyles({ variant: "outline", size: "sm" })}
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Cancel" : "Edit profile"}
              </button>
            ) : null}
            {!isSelf && profile.connectionStatus === "none" ? (
              <button
                type="button"
                disabled={pending}
                className={buttonStyles({ variant: "primary", size: "sm" })}
                onClick={connect}
              >
                Connect
              </button>
            ) : null}
            {!isSelf && profile.connectionStatus === "pending" ? (
              profile.incomingConnectionRequest && profile.pendingConnectionId ? (
                <>
                  <button
                    type="button"
                    disabled={pending}
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                    onClick={() => accept(profile.pendingConnectionId!)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    className={buttonStyles({ variant: "outline", size: "sm" })}
                    onClick={() => decline(profile.pendingConnectionId!)}
                  >
                    Decline
                  </button>
                </>
              ) : (
                <span className="rounded-lg border border-[#2A2E33]/10 px-3 py-1.5 text-sm text-[#5a6b7c]">
                  Request sent
                </span>
              )
            ) : null}
            {!isSelf && profile.connectionStatus === "connected" ? (
              <span className="rounded-lg bg-[#E4F3F2] px-3 py-1.5 text-sm font-medium text-[#2F8F8C]">
                Connected
              </span>
            ) : null}
          </div>
        </div>

        {editing ? (
          <div className="mt-6 space-y-3 border-t border-[#2A2E33]/10 pt-4">
            <label className="block text-sm">
              <span className="font-medium text-[#2A2E33]">Headline</span>
              <input
                value={draft.headline}
                onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#2A2E33]/15 px-3 py-2 text-sm"
                maxLength={120}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-[#2A2E33]">Primary trade</span>
              <input
                value={draft.primaryTrade}
                onChange={(e) => setDraft((d) => ({ ...d, primaryTrade: e.target.value }))}
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
              onClick={saveProfile}
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              Save changes
            </button>
          </div>
        ) : profile.about ? (
          <p className="mt-4 text-sm leading-relaxed text-[#5a6b7c]">{profile.about}</p>
        ) : null}
      </HubSurfaceCard>

      {profile.skills.length > 0 ? (
        <HubSurfaceCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#64748b]">Skills</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <li
                key={s.skill}
                className="rounded-full bg-[#E4F3F2] px-3 py-1 text-sm font-medium text-[#2A2E33]"
              >
                {s.skill}
                {s.endorsementCount > 0 ? (
                  <span className="ml-1 text-[#64748b]">({s.endorsementCount})</span>
                ) : null}
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}

      {profile.training.length > 0 ? (
        <HubSurfaceCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#64748b]">Training</h2>
          <ul className="mt-3 space-y-2">
            {profile.training.map((t, i) => (
              <li
                key={`${t.name}-${i}`}
                className="flex items-center justify-between text-sm text-[#2A2E33]"
              >
                <span>{t.name}</span>
                <span
                  className={cn(
                    "text-xs font-semibold uppercase",
                    t.status === "expired" ? "text-red-600" : "text-[#2F8F8C]",
                  )}
                >
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}

      {profile.experience.length > 0 ? (
        <HubSurfaceCard>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#64748b]">Experience</h2>
          <ul className="mt-3 space-y-3">
            {profile.experience.map((e, i) => (
              <li key={`${e.projectName}-${i}`} className="text-sm">
                <p className="font-semibold text-[#2A2E33]">{e.projectName}</p>
                {e.role ? <p className="text-[#5a6b7c]">{e.role}</p> : null}
                {(e.startDate || e.endDate) && (
                  <p className="text-xs text-[#64748b]">
                    {[formatDate(e.startDate), formatDate(e.endDate) || "Present"]
                      .filter(Boolean)
                      .join(" – ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </HubSurfaceCard>
      ) : null}

      <Link href="/hub/network" className="text-sm font-medium text-[#2F8F8C] hover:underline">
        View your network
      </Link>
    </div>
  );
}
