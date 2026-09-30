import * as React from "react";
import { cn } from "@/src/lib/utils";

export type DashboardGridProps = {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

const colClass = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

/** Responsive dashboard widget grid (§3, §6). */
export function DashboardGrid({
  children,
  columns = 3,
  className,
}: DashboardGridProps) {
  return (
    <div className={cn("grid gap-4 md:gap-6", colClass[columns], className)}>
      {children}
    </div>
  );
}


