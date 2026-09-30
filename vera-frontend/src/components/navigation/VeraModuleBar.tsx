"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import {
  resolveActiveGlobalModule,
  resolveModuleQuickAction,
} from "@/lib/navigation/vera-nav-config";
import { VeraModuleFeatureDropdown } from "./VeraModuleFeatureDropdown";
import { navChrome } from "./nav-chrome";

type Props = {
  role: string | null;
  className?: string;
  quickActions?: React.ReactNode;
};

/**
 * Module bar — graphite secondary chrome with feature dropdown.
 * Layer 2 of the official Vera page layout (visible only inside a module).
 */
export function VeraModuleBar({ role, className, quickActions }: Props) {
  const pathname = usePathname() ?? "/";
  const activeModule = useMemo(() => resolveActiveGlobalModule(pathname), [pathname]);

  if (!activeModule) return null;

  const Icon = activeModule.icon;
  const quickAction = resolveModuleQuickAction(activeModule, role);

  return (
    <div
      className={cn(navChrome.moduleBar, className)}
      role="navigation"
      aria-label={`${activeModule.label} module navigation`}
    >
      <div className={navChrome.moduleBarInner}>
        <div className="flex min-w-0 items-center gap-2">
          <Icon className={navChrome.moduleIcon} aria-hidden />
          <span className={navChrome.moduleLabel}>{activeModule.label}</span>
        </div>

        <span className={navChrome.divider} aria-hidden />

        <VeraModuleFeatureDropdown role={role} variant="header" />

        <div className="flex-1" aria-hidden />

        {quickActions ??
          (quickAction ? (
            <Link href={quickAction.href} className={navChrome.moduleQuickAction}>
              <Plus className="h-4 w-4" aria-hidden />
              {quickAction.label}
            </Link>
          ) : null)}
      </div>
    </div>
  );
}
