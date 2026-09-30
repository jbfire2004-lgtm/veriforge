"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { UserCreateForm } from "@/src/components/forms";
import { useOrgUsers } from "@/lib/veriforge-hooks";
import { StatusIndicator } from "@/components/ui/status-indicator";

export default function VeriHubUsersPage() {
  const { data: users, error, loading, reload } = useOrgUsers();

  return (
    <VeriHubConsoleShell
      title="Users"
      description="Invite and manage organization members."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="mb-8">
        <UserCreateForm onCreated={() => reload()} />
      </div>
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
          {(users ?? []).map((u) => (
            <li key={u.id} className="flex justify-between px-4 py-3 text-sm">
              <span>
                {u.fullName}{" "}
                <span className="text-zinc-500">({u.email})</span>
              </span>
              <StatusIndicator label={u.status} tone="neutral" />
            </li>
          ))}
        </ul>
      )}
    </VeriHubConsoleShell>
  );
}
