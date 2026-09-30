"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { cn } from "@/src/lib/utils";
import type { FilterChip } from "@/lib/wireframes/types";

export type ListViewLayoutProps = {
  title: string;
  description?: string;
  /** When true, omits page header (use inside AdminPageShell). */
  embedded?: boolean;
  actions?: React.ReactNode;
  filters?: FilterChip[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Replaces built-in search input (e.g. URL-backed form). */
  searchSlot?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function ListViewLayout({
  title,
  description,
  embedded,
  actions,
  filters,
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchSlot,
  children,
  footer,
  className,
}: ListViewLayoutProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {embedded ? null : (
        <PageHeader title={title} description={description} actions={actions} />
      )}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {searchSlot ?? (
          <section className="relative max-w-md flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden
            />
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="rounded-lg border-[var(--border)] pl-10"
              aria-label="Search list"
            />
          </section>
        )}

        {filters && filters.length > 0 ? (
          <section className="flex flex-wrap gap-2" role="tablist" aria-label="Filters">
            {filters.map((f) => {
              const active = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onFilterChange?.(f.id)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "bg-[var(--surface)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)] hover:bg-[var(--muted)]"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </section>
        ) : null}
      </section>

      {children}

      {footer ? <footer className="border-t border-[var(--border)] pt-4">{footer}</footer> : null}
    </section>
  );
}
