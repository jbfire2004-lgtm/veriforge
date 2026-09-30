"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { VERIFORGE_ICONS } from "@/src/icons/veriforge-icons";
import type { VFNavItem } from "./types";
import styles from "./VFSidebar.module.css";

export interface VFSidebarProps {
  title?: string;
  items: VFNavItem[];
  collapsed?: boolean;
  /** open | close — industrialDrop / panel close motion */
  motionState?: "open" | "close";
  className?: string;
}

const SECTION_LABELS: Record<string, string> = {
  brand: "Brand",
  operations: "Operations",
  intelligence: "Intelligence",
  enterprise: "Enterprise",
  system: "System",
  critical: "Critical alerts",
};

function sectionLabel(key: string): string {
  return SECTION_LABELS[key] ?? key.replace(/[_-]/g, " ");
}

function groupItems(items: VFNavItem[]): Array<{ key: string; items: VFNavItem[] }> {
  const order: string[] = [];
  const map = new Map<string, VFNavItem[]>();

  for (const item of items) {
    const key = item.critical
      ? "critical"
      : (item.section?.trim() || "operations").toLowerCase();
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(item);
  }

  // Keep critical alerts last
  const sorted = order.filter((k) => k !== "critical");
  if (map.has("critical")) sorted.push("critical");

  return sorted.map((key) => ({ key, items: map.get(key)! }));
}

export function VFSidebar({
  title = "Safety modules",
  items,
  collapsed = false,
  className,
}: VFSidebarProps) {
  const pathname = usePathname();
  const groups = React.useMemo(() => groupItems(items), [items]);

  return (
    <aside
      className={cn(styles.sidebar, collapsed && styles.collapsed, className)}
      aria-label="Module navigation"
    >
      <p className={styles.title}>{title}</p>
      <div className={styles.sections}>
        {groups.map((group) => (
          <div key={group.key} className={styles.section}>
            {!collapsed ? (
              <p className={styles.sectionLabel}>{sectionLabel(group.key)}</p>
            ) : null}
            <ul className={styles.list}>
              {group.items.map((item) => {
                const active =
                  item.active ??
                  (pathname === item.href ||
                    pathname.startsWith(`${item.href}/`));
                const Icon = item.icon ? VERIFORGE_ICONS[item.icon] : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        styles.link,
                        active && styles.linkActive,
                        item.critical && styles.linkCritical,
                      )}
                      title={item.label}
                    >
                      {Icon ? (
                        <Icon
                          size={16}
                          tone={
                            active
                              ? "active"
                              : item.critical
                                ? "critical"
                                : "neutral"
                          }
                          className={styles.icon}
                        />
                      ) : (
                        <span className={styles.icon} aria-hidden />
                      )}
                      <span className={styles.linkLabel}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default VFSidebar;
