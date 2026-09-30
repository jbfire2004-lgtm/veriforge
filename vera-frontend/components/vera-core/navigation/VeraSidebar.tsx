"use client";

import { buildVeraSidebarNav } from "@/lib/navigation/sidebar-config";
import type { ShellNavSection, VeraShellVariant } from "@/lib/navigation/types";
import { cn } from "@/src/lib/utils";
import { navChrome } from "@/src/components/navigation/nav-chrome";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItem } from "./SidebarItem";

export type VeraSidebarProps = {
  role: string | null;
  variant?: VeraShellVariant;
  collapsed?: boolean;
  activePath?: string;
  onNavigate?: () => void;
  className?: string;
};

function isActive(path: string | undefined, href: string) {
  if (!path) return false;
  return path === href || path.startsWith(`${href}/`);
}

/**
 * Contextual graphite sidebar — grouped sections, blue active/hover.
 * Not used for global module switching (see Vera navigation architecture).
 */
export function VeraSidebar({
  role,
  variant = "workspace",
  collapsed,
  activePath,
  onNavigate,
  className,
}: VeraSidebarProps) {
  const entries = buildVeraSidebarNav(role, variant === "admin" ? "admin" : "workspace");
  const sections = entries.filter(
    (e): e is ShellNavSection => "type" in e && e.type === "section",
  );

  return (
    <aside className={cn(navChrome.sideBar, "p-4", className)} aria-label="Section navigation">
      <nav className="space-y-1" aria-label="Main">
        {sections.map((section) => (
          <SidebarGroup key={section.label} label={section.label}>
            {section.items.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
                active={isActive(activePath, item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </SidebarGroup>
        ))}
      </nav>
    </aside>
  );
}
