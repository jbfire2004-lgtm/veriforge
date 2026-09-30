"use client";

import Link from "next/link";
import { AcpPage } from "@/src/components/acp/AcpPage";

const LINKS = [
  { href: "/admin/tenants", title: "Tenants", desc: "Organizations, tiers, modules" },
  { href: "/admin/users", title: "Users", desc: "Tenant assignment & roles" },
  { href: "/admin/roles", title: "Roles", desc: "ACP role definitions" },
  { href: "/admin/permissions", title: "Permissions", desc: "Role × permission matrix" },
  { href: "/admin/subscriptions", title: "Subscriptions", desc: "Tier assignment" },
  { href: "/admin/features", title: "Feature flags", desc: "Per-tenant toggles" },
  { href: "/admin/logs", title: "Audit logs", desc: "Configuration history" },
];

export default function AcpAdminHomePage() {
  return (
    <AcpPage
      title="Admin Control Panel"
      description="Govern tenants, RBAC, subscriptions, and feature flags across Vera Hub, Core, and PM."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <h2 className="font-semibold text-slate-900 dark:text-white">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-600">
        Customer self-service:{" "}
        <Link href="/subscriptions" className="font-medium text-teal-700 hover:underline">
          Subscription & billing
        </Link>
      </p>
    </AcpPage>
  );
}
