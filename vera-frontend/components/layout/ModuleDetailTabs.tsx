"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { tabsForEntity, type ModuleTabDef } from "@/lib/navigation/module-tabs";
import { resolveTabHref } from "@/lib/navigation/tab-paths";

export type ModuleDetailTabsProps = {
  basePath: string;
  entity: "worker" | "equipment" | "company" | "project" | "provider";
  includeAdminTabs?: boolean;
  /** Override computed tabs (must still follow standard order). */
  tabs?: ModuleTabDef[];
};

export function ModuleDetailTabs({
  basePath,
  entity,
  includeAdminTabs,
  tabs: tabsOverride,
}: ModuleDetailTabsProps) {
  const pathname = usePathname() ?? basePath;
  const tabs = tabsOverride ?? tabsForEntity(entity, { includeAdminTabs });

  return (
    <nav
      className="mb-vera-6 flex gap-1 overflow-x-auto border-b border-vera-charcoal/10 pb-px"
      aria-label="Module sections"
    >
      {tabs.map((tab) => {
        const href = resolveTabHref(basePath, tab.id, entity);
        const active =
          pathname === href ||
          (tab.id !== "overview" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "shrink-0 rounded-t-lg px-vera-4 py-vera-2.5 text-sm font-medium transition",
              active
                ? "border-b-2 border-vera-teal bg-vera-teal/5 text-vera-deep"
                : "text-vera-muted hover:bg-vera-surface hover:text-vera-charcoal"
            )}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
