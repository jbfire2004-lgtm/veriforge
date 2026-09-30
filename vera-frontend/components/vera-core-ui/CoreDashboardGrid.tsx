"use client";

import { cn } from "@/src/lib/utils";

type Props = {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

const colClass: Record<NonNullable<Props["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
};

export function CoreDashboardGrid({ children, columns = 3, className }: Props) {
  return (
    <div
      className={cn(
        "grid gap-4 vera-motion-stagger",
        colClass[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
