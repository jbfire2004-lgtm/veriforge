"use client";

import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/ui/breadcrumbs";
import { cn } from "@/src/lib/utils";

export type VeraBreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  /** Truncate long trails on small screens */
  truncate?: boolean;
};

export function VeraBreadcrumbs({
  items,
  className,
  truncate = true,
}: VeraBreadcrumbsProps) {
  return (
    <Breadcrumbs
      items={items}
      className={cn(
        "text-[var(--muted-foreground)]",
        truncate && "max-w-full truncate",
        className
      )}
    />
  );
}
