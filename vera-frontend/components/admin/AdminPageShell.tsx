"use client";

import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui";
import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { WorkspaceHero } from "@/components/theme/workspace";
import { cn } from "@/src/lib/utils";

export function AdminPageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className,
  hideHeader,
  heroEyebrow = "VERA Admin",
  heroBadges,
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Use when ModuleDetailLayout provides the page header. */
  hideHeader?: boolean;
  heroEyebrow?: string;
  heroBadges?: { label: string; tone?: "teal" | "amber" | "neutral" }[];
}) {
  return (
    <div className={cn("space-y-vera-6 sm:space-y-vera-8", className)}>
      <Breadcrumbs
        items={breadcrumbs ?? [{ label: title }]}
        className="text-vera-muted"
      />
      {hideHeader ? null : (
        <WorkspaceHero
          eyebrow={heroEyebrow}
          title={title}
          description={description}
          badges={heroBadges ?? [{ label: "Administration", tone: "teal" }]}
          actions={actions}
        />
      )}
      {children}
    </div>
  );
}
