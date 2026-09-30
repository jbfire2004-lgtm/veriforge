import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  /** Total number of pages (clamped to >= 1 by the consumer). */
  totalPages: number;
  /** Builds the href for a given page number. */
  getHref: (page: number) => string;
  /** Optional className applied to the outer nav wrapper. */
  className?: string;
  /** Optional `aria-label` for the navigation landmark. */
  label?: string;
}

/**
 * Compact pagination strip used across admin list pages. Renders the first
 * and last pages plus a sliding window around the current page; collapses
 * the rest into ellipses. Wraps and centers on mobile.
 */
export function Pagination({
  page,
  totalPages,
  getHref,
  className,
  label = "Pagination",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = computePageList(page, totalPages);
  const prevHref = page > 1 ? getHref(page - 1) : undefined;
  const nextHref = page < totalPages ? getHref(page + 1) : undefined;

  return (
    <nav
      aria-label={label}
      className={cn("flex flex-wrap items-center justify-center gap-vera-2", className)}
    >
      <PaginationArrow
        href={prevHref}
        direction="prev"
        ariaLabel="Previous page"
      />

      {pages.map((entry, idx) =>
        entry === "…" ? (
          <span
            key={`gap-${idx}`}
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center text-vera-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <PaginationItem
            key={entry}
            page={entry}
            active={entry === page}
            href={getHref(entry)}
          />
        )
      )}

      <PaginationArrow
        href={nextHref}
        direction="next"
        ariaLabel="Next page"
      />
    </nav>
  );
}

function PaginationItem({
  page,
  active,
  href,
}: {
  page: number;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={`Page ${page}`}
      className={buttonStyles({
        variant: active ? "default" : "outline",
        size: "sm",
        className: "min-w-8 tabular-nums",
      })}
    >
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  ariaLabel,
}: {
  href: string | undefined;
  direction: "prev" | "next";
  ariaLabel: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const disabledClass =
    "cursor-not-allowed border-vera-charcoal/10 bg-vera-surface/60 text-vera-muted shadow-none hover:translate-y-0 hover:shadow-none";

  if (href == null) {
    return (
      <span
        aria-disabled
        aria-label={ariaLabel}
        className={buttonStyles({
          variant: "outline",
          size: "sm",
          className: cn("h-8 w-8 p-0", disabledClass),
        })}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={buttonStyles({
        variant: "outline",
        size: "sm",
        className: "h-8 w-8 p-0",
      })}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </Link>
  );
}

/**
 * Build a pagination window. Always shows page 1 and `totalPages`, plus a
 * sliding range around `page`. Ellipses ("…") collapse the rest.
 *
 * Examples (page = 5, totalPages = 12) → [1, "…", 4, 5, 6, "…", 12].
 */
export function computePageList(
  page: number,
  totalPages: number
): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const window: Array<number | "…"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) window.push("…");
  for (let i = start; i <= end; i++) window.push(i);
  if (end < totalPages - 1) window.push("…");

  window.push(totalPages);
  return window;
}
