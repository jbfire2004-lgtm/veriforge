"use client";

import { Shield, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteProjectSafetyRole,
  fetchProjectSafetyRoles,
  upsertProjectSafetyRole,
  type ProjectSafetyRoleRow,
  type ProjectSafetyRoleType,
} from "@/lib/safety-intelligence";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
} from "@/src/components/safety-forms/ui";

const ROLE_OPTIONS: Array<{ value: ProjectSafetyRoleType; label: string }> = [
  { value: "prime_admin", label: "Prime admin" },
  { value: "company_safety_manager", label: "Safety manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "worker", label: "Worker" },
  { value: "client_readonly", label: "Client (read-only)" },
];

export default function ProjectSafetyRolesPage() {
  const [projectId, setProjectId] = useState("1");
  const [rows, setRows] = useState<ProjectSafetyRoleRow[]>([]);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<ProjectSafetyRoleType>("supervisor");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedProjectId = useMemo(() => {
    const n = Number(projectId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [projectId]);

  const load = useCallback(async () => {
    if (!parsedProjectId) return;
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchProjectSafetyRoles(parsedProjectId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [parsedProjectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!parsedProjectId || !userId) return;
    setBusy(true);
    setError(null);
    try {
      await upsertProjectSafetyRole({
        projectId: parsedProjectId,
        userId: Number(userId),
        role,
        companyId: companyId ? Number(companyId) : undefined,
      });
      setUserId("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save role");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(uid: number) {
    if (!parsedProjectId || !confirm("Remove this project role?")) return;
    setBusy(true);
    try {
      await deleteProjectSafetyRole(parsedProjectId, uid);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Shield className="h-6 w-6 text-[var(--sf-primary)]" />
          Project safety roles
        </h1>
        <p className="mt-1 text-sm text-[var(--sf-text-muted)]">
          Fine-grained access per project (verify, worker-scoped views, client read-only).
        </p>
      </header>

      <SfCard className="p-6">
        <SfFloatingInput
          label="Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="max-w-[160px]"
        />
      </SfCard>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <SfCard className="space-y-4 p-6">
        <h2 className="font-medium">Assign role</h2>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => void onAdd(e)}>
          <SfFloatingInput
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <SfFloatingInput
            label="Company ID (optional)"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          />
          <label className="block text-sm sm:col-span-2">
            Role
            <select
              className="mt-1 w-full rounded-lg border border-[var(--sf-border)] px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as ProjectSafetyRoleType)}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <SfButton type="submit" disabled={busy || !parsedProjectId}>
            Save role
          </SfButton>
        </form>
      </SfCard>

      <SfCard className="p-6">
        <h2 className="font-medium">Current assignments</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--sf-text-muted)]">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--sf-text-muted)]">No roles for this project.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--sf-border)]">
            {rows.map((r) => (
              <li
                key={`${r.projectId}-${r.userId}`}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {r.user?.username ?? `User #${r.userId}`}
                  </p>
                  <p className="text-xs text-[var(--sf-text-muted)]">
                    {r.role.replace(/_/g, " ")}
                    {r.company?.name ? ` · ${r.company.name}` : ""}
                  </p>
                </div>
                <SfButton
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void onRemove(r.userId)}
                >
                  <Trash2 className="h-4 w-4" />
                </SfButton>
              </li>
            ))}
          </ul>
        )}
      </SfCard>
    </div>
  );
}
