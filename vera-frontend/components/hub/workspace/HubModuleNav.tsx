"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
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
  compact?: boolean;
};

/** Horizontal module launcher — subscription, permission, and feature-flag aware. */
export function HubModuleNav({ modules, loading, compact }: Props) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "shrink-0 animate-pulse rounded-xl border border-slate-200 bg-slate-100",
              compact ? "h-9 w-24" : "h-14 w-28",
            )}
          />
        ))}
      </div>
    );
  }

  if (modules.length === 0) return null;

  return (
    <nav
      aria-label="Vera modules"
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {modules.map((mod) => (
        <ModulePill key={mod.key} module={mod} compact={compact} />
      ))}
    </nav>
  );
}

function ModulePill({
  module: mod,
  compact,
}: {
  module: HubModuleCard;
  compact?: boolean;
}) {
  const icon = ICONS[mod.key] ?? "📦";

  if (!mod.allowed) {
    return (
      <Link
        href="/subscriptions"
        title={`${mod.title} — upgrade required`}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 text-slate-400 transition hover:border-teal-300 hover:text-teal-700",
          compact ? "h-9 text-xs" : "h-14 flex-col justify-center px-4 text-sm",
        )}
      >
        <span aria-hidden>{icon}</span>
        <span className="font-medium">{mod.title}</span>
        <Lock className="h-3 w-3 shrink-0" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      href={mod.href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#2A2E33]/10 bg-white px-3 font-medium text-[#2A2E33] shadow-sm transition hover:border-teal-500/40 hover:bg-teal-50/50 hover:text-teal-800",
        compact ? "h-9 text-xs" : "h-14 flex-col justify-center px-4 text-sm",
      )}
    >
      <span className={compact ? "text-base" : "text-xl"} aria-hidden>
        {icon}
      </span>
      <span>{mod.title}</span>
    </Link>
  );
}
