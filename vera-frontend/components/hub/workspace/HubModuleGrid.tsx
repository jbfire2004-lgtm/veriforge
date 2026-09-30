"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import type { HubModuleCard } from "@/lib/hub/hub-dashboard-api";
import { cn } from "@/src/lib/utils";

const ICONS: Record<string, string> = {
  hub: "🏠",
  core: "📋",
  pm: "🦺",
  addons: "✨",
  marketplace: "🛒",
};

type Props = {
  modules: HubModuleCard[];
  loading?: boolean;
};

export function HubModuleGrid({ modules, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <section aria-labelledby="hub-modules-heading" className="space-y-4">
      <div>
        <h2 id="hub-modules-heading" className="text-lg font-semibold text-[#2A2E33]">
          Your modules
        </h2>
        <p className="text-sm text-[#5a6b7c]">
          Gated by your subscription tier, permissions, and feature flags.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <ModuleCard key={mod.key} module={mod} />
        ))}
      </div>
    </section>
  );
}

function ModuleCard({ module: mod }: { module: HubModuleCard }) {
  const icon = ICONS[mod.key] ?? "📦";

  if (!mod.allowed) {
    return (
      <div
        className="relative flex flex-col rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 opacity-90"
        title={`Upgrade required (${mod.reason ?? "access"})`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-2xl" aria-hidden>
            {icon}
          </span>
          <Lock className="h-4 w-4 text-slate-400" aria-hidden />
        </div>
        <h3 className="mt-3 font-semibold text-slate-500">{mod.title}</h3>
        <p className="mt-1 flex-1 text-sm text-slate-400">{mod.description}</p>
        <Link
          href="/subscriptions"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Upgrade to unlock
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={mod.href}
      className={cn(
        "group flex flex-col rounded-2xl border border-[#2A2E33]/10 bg-white p-5 shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-md",
      )}
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <h3 className="mt-3 font-semibold text-[#2A2E33] group-hover:text-teal-700">
        {mod.title}
      </h3>
      <p className="mt-1 flex-1 text-sm text-[#5a6b7c]">{mod.description}</p>
      <span className="mt-4 text-sm font-medium text-teal-600">Open →</span>
    </Link>
  );
}
