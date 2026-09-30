"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DeveloperShell } from "@/src/components/developer/DeveloperShell";
import { DeveloperDashboardCard } from "@/src/components/developer";
import { useDeveloperDashboard } from "@/lib/veriforge-hooks";
import { getDeveloperSession } from "@/lib/developer-api";

export default function DeveloperDashboardPage() {
  const { data, error, loading } = useDeveloperDashboard();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const session = getDeveloperSession();
    setEmail(session?.developer?.email ?? null);
    setRole(session?.developer?.role ?? null);
  }, []);

  const stats = data?.stats ?? null;

  return (
    <DeveloperShell
      title="Developer console"
      description="System-level tools for platform developers and support."
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {(email || role) && (
        <p className="mb-4 text-sm text-zinc-600">
          Signed in as {email} ({role})
        </p>
      )}
      {loading || !stats ? (
        <p className="text-sm text-zinc-500">Loading stats…</p>
      ) : (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(stats).map(([k, v]) => (
            <DeveloperDashboardCard key={k} title={k} value={v} />
          ))}
        </div>
      )}
      <ul className="flex flex-wrap gap-4 text-sm">
        <li>
          <Link className="underline" href="/developer/impersonate">
            Impersonation
          </Link>
        </li>
        <li>
          <Link className="underline" href="/developer/modules">
            Module builder
          </Link>
        </li>
        <li>
          <Link className="underline" href="/developer/feature-flags">
            Feature flags
          </Link>
        </li>
        <li>
          <Link className="underline" href="/developer/logs">
            Global logs
          </Link>
        </li>
        <li>
          <Link className="underline" href="/developer/api-keys">
            API keys
          </Link>
        </li>
      </ul>
    </DeveloperShell>
  );
}
