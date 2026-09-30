import * as React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography } from "./theme";

export type VeriForgeNavItem = {
  label: string;
  href: string;
  active?: boolean;
  permission?: string;
  icon?:
    | "training"
    | "verification"
    | "compliance"
    | "incidents"
    | "equipment"
    | "fieldOps"
    | "risk"
    | "audit"
    | "culture"
    | "emergency"
    | "contractor";
  critical?: boolean;
  section?: string;
};

const SECTION_LABELS: Record<string, string> = {
  brand: "Brand",
  operations: "Operations",
  intelligence: "Intelligence",
  enterprise: "Enterprise",
  system: "System",
  critical: "Critical alerts",
};

function topLinkClass(active?: boolean, critical?: boolean) {
  return cn(
    "rounded-[3px] border border-transparent px-3 py-2 text-[12px] font-medium transition",
    active
      ? "bg-[rgba(30,111,184,0.18)] text-[#F4F6F8] shadow-[inset_0_-2px_0_#1E6FB8]"
      : critical
        ? "border-[#B33A3A]/40 text-[#F0DADA] hover:bg-[#2A2224] hover:border-[#B33A3A]"
        : "text-[#D5DBE0] hover:bg-[rgba(30,111,184,0.12)] hover:text-[#F4F6F8]",
  );
}

function sideLinkClass(active?: boolean, critical?: boolean) {
  return cn(
    "block rounded-[3px] border border-transparent px-3 py-2 text-[13px] font-medium transition",
    active
      ? "bg-[rgba(30,111,184,0.2)] text-[#F4F6F8] shadow-[inset_3px_0_0_#1E6FB8]"
      : critical
        ? "border-[#B33A3A]/40 text-[#F0DADA] hover:bg-[#2A2224] hover:border-[#B33A3A]"
        : "text-[#D5DBE0] hover:bg-[rgba(30,111,184,0.16)] hover:text-[#F4F6F8]",
  );
}

export function VeriForgeTopNav({
  items,
  className,
}: {
  items: VeriForgeNavItem[];
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-1 border-b border-[#5A6169] bg-[#2A2E33] px-3 py-2",
        className,
      )}
      aria-label="Primary"
    >
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className={topLinkClass(item.active, item.critical)}
        >
          <span className={cn(veriforgeTypography.heading, "text-[12px]")}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

export function VeriForgeSideNav({
  title,
  items,
  className,
}: {
  title: string;
  items: VeriForgeNavItem[];
  className?: string;
}) {
  const groups = React.useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, VeriForgeNavItem[]>();
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
    const sorted = order.filter((k) => k !== "critical");
    if (map.has("critical")) sorted.push("critical");
    return sorted.map((key) => ({ key, items: map.get(key)! }));
  }, [items]);

  return (
    <aside
      className={cn(
        "w-64 shrink-0 border-r border-[#5A6169] bg-[#3B3F45] p-4",
        className,
      )}
      aria-label="Module navigation"
    >
      <p
        className={cn(
          veriforgeTypography.heading,
          "mb-4 border-b border-[#5A6169] pb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F4F6F8]",
        )}
      >
        {title}
      </p>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.key}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
              {SECTION_LABELS[group.key] ?? group.key}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={sideLinkClass(item.active, item.critical)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function VeriForgeMobileNav({
  items,
  className,
}: {
  items: VeriForgeNavItem[];
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "grid grid-cols-2 gap-1 border-t border-[#5A6169] bg-[#2A2E33] p-2",
        className,
      )}
      aria-label="Mobile"
    >
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          className={cn("text-center", topLinkClass(item.active, item.critical))}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
