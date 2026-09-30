import { a11y } from "@/lib/design-system/accessibility";
import { cardTokens } from "@/lib/design-system/tokens/component-tokens";
import { cn } from "@/src/lib/utils";
import { navChrome } from "@/src/components/navigation/nav-chrome";

const interactive =
  "transition-[color,background-color,border-color,box-shadow] duration-[var(--transition-fast)]";

/** Shared token-based surface classes for Vera Core components. */
export const vera = {
  surface: "bg-[var(--surface)] text-[var(--foreground)]",
  muted: "text-[var(--muted-foreground)]",
  border: "border-[var(--border)]",
  card: cardTokens.base,
  focus: a11y.focusRing,
  interactive,
  sidebarItem: cn(navChrome.sideLink, "focus-visible:outline-none"),
  sidebarItemActive: navChrome.sideLinkActive,
  tableHeader: "bg-[var(--table-header-bg)] text-[var(--foreground)]",
  tableRow: "border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)]",
} as const;

export function veraCn(...parts: Array<string | false | undefined>) {
  return cn(...parts);
}
