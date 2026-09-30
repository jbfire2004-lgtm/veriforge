"use client";

import Link from "next/link";
import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { Navbar } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { useVeriHubOrg } from "@/lib/veriforge-hooks";

const NAV = [
  { href: "/verihub", label: "Overview", active: true },
  { href: "/verihub/modules", label: "Modules" },
  { href: "/verihub/users", label: "Users" },
  { href: "/verihub/roles", label: "Roles" },
  { href: "/verihub/billing", label: "Billing" },
  { href: "/verihub/scorecards", label: "Scorecards" },
  { href: "/verihub/compliance", label: "Compliance" },
];

export default function VeriHubDashboardPage() {
  const { data, error, loading } = useVeriHubOrg();
  const org = (data as { organization?: Record<string, unknown> } | null)
    ?.organization;

  return (
    <VeriHubConsoleShell
      title="Organization console"
      description="Manage modules, users, roles, and billing for your VeriForge organization."
    >
      <Navbar items={NAV} className="mb-6" />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading || !org ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{String(org.name ?? "")}</CardTitle>
              <p className="text-sm text-zinc-600">
                Slug <span className="font-mono">{String(org.slug ?? "")}</span>
                {org.industry ? ` · ${String(org.industry)}` : ""}
              </p>
            </CardHeader>
            <CardContent>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
                Enabled modules
              </h3>
              <ul className="flex flex-wrap gap-2">
                {(Array.isArray(org.modulesEnabled)
                  ? (org.modulesEnabled as string[])
                  : []
                ).map((code) => (
                  <li
                    key={code}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm font-mono"
                  >
                    {code}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="underline" href="/verihub/modules">
              Manage modules
            </Link>
            <Link className="underline" href="/verihub/users">
              Users
            </Link>
            <Link className="underline" href="/verihub/roles">
              Roles
            </Link>
            <Link className="underline" href="/verihub/billing">
              Billing
            </Link>
          </div>
        </div>
      )}
    </VeriHubConsoleShell>
  );
}
