import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
}

export function Breadcrumbs({
  items,
  showHome = false,
  homeHref = "/",
  className,
  ...props
}: BreadcrumbsProps) {
  const entries: BreadcrumbItem[] = showHome
    ? [{ label: "Home", href: homeHref }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm leading-normal text-vera-muted", className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-vera-2">
        {entries.map((item, index) => {
          const isLast = index === entries.length - 1;
          const content =
            item.href != null && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-vera-deep underline-offset-4 hover:text-vera-teal hover:underline"
              >
                {index === 0 && showHome ? (
                  <span className="inline-flex items-center gap-vera-2">
                    <Home className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="sr-only sm:not-sr-only">{item.label}</span>
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            ) : (
              <span
                className={cn(
                  "font-medium text-vera-charcoal",
                  index === 0 && showHome && "inline-flex items-center gap-vera-2"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {index === 0 && showHome ? (
                  <>
                    <Home className="h-4 w-4 shrink-0 text-vera-teal" aria-hidden />
                    <span className="sr-only sm:not-sr-only">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </span>
            );

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-vera-2">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-vera-muted" aria-hidden />
              )}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
