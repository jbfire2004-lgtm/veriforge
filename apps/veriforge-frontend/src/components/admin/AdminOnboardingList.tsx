import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { adminApi, getApiErrorMessage } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { AdminOrgListItem } from "../../types/api";

const DEFAULT_CHECKS = [
  { id: "kickoff", label: "Kickoff call completed" },
  { id: "roles", label: "Roles configured" },
  { id: "modules", label: "Modules reviewed" },
  { id: "data", label: "Initial data imported" },
];

export function AdminOnboardingList() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const query = useQuery({
    queryKey: ["admin-onboarding"],
    queryFn: async () => {
      const { data } = await adminApi.listOnboarding();
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (payload: {
      orgId: string;
      notes?: string;
      checklist?: Record<string, boolean>;
      status?: "not_started" | "in_progress" | "completed";
    }) => adminApi.patchOnboarding(payload.orgId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-onboarding"] });
      setEditingId(null);
    },
  });

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Onboarding</h1>
        <p className="mt-1 text-white/60">
          Organizations currently in trial ({items.length})
        </p>
      </div>

      {query.isLoading && <p className="text-white/60">Loading…</p>}
      {query.error && <p className="text-red-300">{getApiErrorMessage(query.error)}</p>}
      {save.error && <p className="text-red-300">{getApiErrorMessage(save.error)}</p>}

      <div className="space-y-4">
        {items.map((org) => (
          <OnboardingCard
            key={org.id}
            org={org}
            editing={editingId === org.id}
            notesDraft={
              editingId === org.id
                ? notesDraft
                : org.onboarding?.notes ?? org.onboardingNotes ?? ""
            }
            onEdit={() => {
              setEditingId(org.id);
              setNotesDraft(org.onboarding?.notes ?? org.onboardingNotes ?? "");
            }}
            onNotesChange={setNotesDraft}
            onCancel={() => setEditingId(null)}
            onSaveNotes={() =>
              save.mutate({
                orgId: org.id,
                notes: notesDraft,
                status: org.onboarding?.status === "not_started" ? "in_progress" : undefined,
              })
            }
            onStatusChange={(status) => save.mutate({ orgId: org.id, status })}
            onToggleCheck={(id, checked) => {
              const current =
                (org.onboarding?.checklist as Record<string, boolean> | null) ??
                (org.onboardingChecklist as Record<string, boolean> | null) ??
                {};
              save.mutate({
                orgId: org.id,
                checklist: { ...current, [id]: checked },
                status: "in_progress",
              });
            }}
            saving={save.isPending}
          />
        ))}
        {!query.isLoading && items.length === 0 && (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-white/50">
            No orgs in trial right now.
          </p>
        )}
      </div>
    </div>
  );
}

function OnboardingCard({
  org,
  editing,
  notesDraft,
  onEdit,
  onNotesChange,
  onCancel,
  onSaveNotes,
  onToggleCheck,
  onStatusChange,
  saving,
}: {
  org: AdminOrgListItem;
  editing: boolean;
  notesDraft: string;
  onEdit: () => void;
  onNotesChange: (v: string) => void;
  onCancel: () => void;
  onSaveNotes: () => void;
  onToggleCheck: (id: string, checked: boolean) => void;
  onStatusChange: (status: "not_started" | "in_progress" | "completed") => void;
  saving: boolean;
}) {
  const checklist =
    (org.onboarding?.checklist as Record<string, boolean> | null) ??
    (org.onboardingChecklist as Record<string, boolean> | null) ??
    {};
  const doneCount = DEFAULT_CHECKS.filter((c) => checklist[c.id]).length;
  const status = org.onboarding?.status ?? "not_started";

  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to={`/admin/organizations/${org.id}`}
            className="font-display text-xl font-semibold text-emerald-300 hover:underline"
          >
            {org.name}
          </Link>
          <p className="mt-1 text-sm text-white/50">
            Trial ends {formatDate(org.trialEnd)} · checklist {doneCount}/{DEFAULT_CHECKS.length}
          </p>
        </div>
        <label className="text-sm text-white/70">
          Status{" "}
          <select
            className="ml-2 rounded-lg border border-white/15 bg-[#0c1210] px-2 py-1 capitalize"
            value={status}
            disabled={saving}
            onChange={(e) =>
              onStatusChange(e.target.value as "not_started" | "in_progress" | "completed")
            }
          >
            <option value="not_started">not_started</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
          </select>
        </label>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {DEFAULT_CHECKS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={Boolean(checklist[item.id])}
                disabled={saving}
                onChange={(e) => onToggleCheck(item.id, e.target.checked)}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-white/45">Notes</p>
          {!editing && (
            <button type="button" className="text-xs text-emerald-300 hover:underline" onClick={onEdit}>
              Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-2">
            <textarea
              className="min-h-[90px] w-full rounded-lg border border-white/15 bg-[#0c1210] px-3 py-2 text-sm"
              value={notesDraft}
              onChange={(e) => onNotesChange(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold"
                disabled={saving}
                onClick={onSaveNotes}
              >
                Save
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/20 px-3 py-1.5 text-sm"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-white/70">
            {org.onboardingNotes?.trim() || "No notes yet."}
          </p>
        )}
      </div>
    </article>
  );
}
