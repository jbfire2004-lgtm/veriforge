"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronDown,
  ClipboardList,
  Compass,
  Home,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import { buildVeraSidebarNav } from "@/lib/navigation/sidebar-config";
import type { ShellNavItem } from "@/lib/navigation/types";
import {
  Phase1Role,
  canAccessAdminShell,
  canAccessPmWorkspace,
  canAccessSupervisorShell,
} from "@/lib/phase1-roles";
import { canAccessVeraIntelligenceStack } from "@/lib/navigation/vera-intelligence-access";
import { useAcpHubModules } from "@/lib/acp/use-acp-hub-modules";

type Props = {
  role: string | null;
  className?: string;
};

export function HubNavigateDropdown({ role, className }: Props) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { isHrefAllowed } = useAcpHubModules();

  const surface = canAccessAdminShell(role) ? "admin" : "workspace";
  const sections = React.useMemo(() => buildVeraSidebarNav(role, surface), [role, surface]);

  const exploreLinks = React.useMemo((): ShellNavItem[] => {
    const workspaceHref =
      role === Phase1Role.SUPERVISOR ? "/supervisor" : "/dashboard";
    const workspaceLabel =
      role === Phase1Role.SUPERVISOR
        ? "Supervisor workspace"
        : "Operations dashboard";
    return [
      { href: "/welcome", label: "My workspace", icon: Compass },
      { href: "/home", label: "Industry home", icon: Home },
      { href: workspaceHref, label: workspaceLabel, icon: LayoutDashboard },
      { href: "/safety", label: "Safety blog", icon: ShieldCheck },
      { href: "/jobs", label: "Job board", icon: Briefcase },
    ];
  }, [role]);

  const extraLinks = React.useMemo(() => {
    const links: ShellNavItem[] = [];
    if (canAccessPmWorkspace(role) && isHrefAllowed("/pm")) {
      links.push({
        href: "/pm",
        label: "Project management",
        icon: ClipboardList,
      });
    }
    if (canAccessSupervisorShell(role)) {
      links.push({
        href: "/supervisor",
        label: "Supervisor workspace",
        icon: LayoutDashboard,
      });
      links.push({
        href: "/supervisor/worker-lookup",
        label: "Worker lookup",
        icon: Users,
      });
    }
    if (canAccessAdminShell(role)) {
      links.push({
        href: "/admin",
        label: "Admin console",
        icon: ShieldCheck,
      });
    }
    if (canAccessVeraIntelligenceStack(role)) {
      links.push({
        href: "/dashboard/vera-intelligence",
        label: "Vera intelligence stack",
        icon: Sparkles,
      });
    }
    return links;
  }, [role, isHrefAllowed]);

  React.useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Navigate the rest of VERA"
        onClick={() => setOpen((o) => !o)}
        className="gap-vera-2 border-vera-charcoal/15 bg-vera-white text-vera-charcoal hover:bg-vera-surface"
      >
        <Compass className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Explore VERA</span>
        <span className="sm:hidden">Menu</span>
        <ChevronDown
          aria-hidden
          className={cn("h-4 w-4 text-vera-muted transition-transform", open && "rotate-180")}
        />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label="Site navigation"
          className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[min(70vh,28rem)] w-72 overflow-y-auto rounded-xl border border-vera-charcoal/10 bg-vera-white py-vera-2 shadow-md"
        >
          <NavSection title="Discover" items={exploreLinks} onSelect={() => setOpen(false)} />

          {extraLinks.length > 0 ? (
            <NavSection title="Your tools" items={extraLinks} onSelect={() => setOpen(false)} />
          ) : null}

          {sections.map((entry) =>
            entry.type === "section" ? (
              <NavSection
                key={entry.label}
                title={entry.label}
                items={entry.items}
                onSelect={() => setOpen(false)}
              />
            ) : (
              <NavSection
                key={entry.href}
                title="Quick link"
                items={[entry]}
                onSelect={() => setOpen(false)}
              />
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

function NavSection({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: ShellNavItem[];
  onSelect: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="px-vera-2 pb-vera-1">
      <p className="px-vera-3 py-vera-2 text-xs font-semibold uppercase tracking-wide text-vera-muted">
        {title}
      </p>
      <ul className="flex flex-col gap-vera-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                role="menuitem"
                href={item.href}
                onClick={onSelect}
                className={buttonStyles({
                  variant: "ghost",
                  size: "sm",
                  className:
                    "h-9 w-full justify-start gap-vera-3 rounded-lg px-vera-3 text-sm font-medium text-vera-charcoal hover:bg-vera-surface",
                })}
              >
                <Icon className="h-4 w-4 shrink-0 text-vera-muted" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}