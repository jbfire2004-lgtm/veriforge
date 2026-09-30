import {
  AlertTriangle,
  ClipboardList,
  Home,
  Search,
  Settings,
} from "lucide-react";
import { buildVeraSidebarNav } from "@/lib/navigation/sidebar-config";
import type {
  ShellNavEntry,
  ShellNavItem,
  ShellNavSection,
  VeraShellVariant,
} from "@/lib/navigation/types";

export type { ShellNavEntry, ShellNavItem, ShellNavSection, VeraShellVariant };

/** Nav shown in the app shell sidebar per surface + role (VERA Core Option C). */
export function shellNavEntries(
  variant: VeraShellVariant,
  role: string | null
): ShellNavEntry[] {
  switch (variant) {
    case "admin":
      return buildVeraSidebarNav(role, "admin");
    case "workspace":
    case "core":
      return buildVeraSidebarNav(role, "workspace");
    case "supervisor":
      return [
        {
          type: "section",
          label: "Field tools",
          items: [
            { href: "/supervisor", label: "Supervisor home", icon: Home },
            { href: "/core/daily-logs", label: "Daily log", icon: ClipboardList },
            { href: "/supervisor/incidents/new", label: "Incident", icon: AlertTriangle },
            { href: "/supervisor/settings", label: "Profile & settings", icon: Settings },
            { href: "/supervisor/worker-lookup", label: "Worker lookup", icon: Search },
          ],
        },
        ...buildVeraSidebarNav(role, "workspace"),
      ];
    default:
      return buildVeraSidebarNav(role, "workspace");
  }
}

export function shellProductTitle(variant: VeraShellVariant): string {
  switch (variant) {
    case "admin":
      return "VERA";
    case "core":
      return "VERA Core";
    case "supervisor":
      return "VERA Supervisor";
    case "workspace":
    default:
      return "VERA";
  }
}
