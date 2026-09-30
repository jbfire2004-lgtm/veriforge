"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { RoleCreateForm } from "@/src/components/forms";
import { useOrgRoles } from "@/lib/veriforge-hooks";

export default function VeriHubRolesPage() {
  const { data: roles, error, loading, reload } = useOrgRoles();

  return (
    <VeriHubConsoleShell
      title="Roles"
      description="Organization roles (Owner, Admin, Manager, Worker, and custom)."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="mb-8">
        <RoleCreateForm onCreated={() => reload()} />
      </div>
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
          {(roles ?? []).map((r) => (
            <li key={r.id} className="px-4 py-3 text-sm">
              <p className="font-medium">
                {r.name}
                {r.systemCode ? (
                  <span className="ml-2 font-mono text-xs text-zinc-500">
                    {r.systemCode === "user" ? "worker" : r.systemCode}
                  </span>
                ) : null}
              </p>
              {r.description ? (
                <p className="text-zinc-600">{r.description}</p>
              ) : null}
              <p className="text-xs text-zinc-500">
                {r._count?.users ?? 0} assigned
              </p>
            </li>
          ))}
        </ul>
      )}
    </VeriHubConsoleShell>
  );
}
