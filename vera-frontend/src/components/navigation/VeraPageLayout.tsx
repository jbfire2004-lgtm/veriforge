import { cn } from "@/src/lib/utils";

export type VeraPageLayoutProps = {
  /** Primary page heading */
  title?: React.ReactNode;
  /** Short description under the title */
  description?: React.ReactNode;
  /** Filter row (search, tabs-as-filters, date pickers) */
  filters?: React.ReactNode;
  /** Primary actions (Save, Create, Upload) — top-right */
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Standard Vera page content layout — Layer 3 of the official page structure.
 *
 * Header → Module bar → **PageLayout (title, filters, content)** → optional footer
 */
export function VeraPageLayout({
  title,
  description,
  filters,
  actions,
  children,
  footer,
  className,
}: VeraPageLayoutProps) {
  return (
    <div className={cn("space-y-vera-6", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-vera-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm text-[var(--muted-foreground)]">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-vera-2">{actions}</div>
          ) : null}
        </div>
      )}

      {filters ? <div className="flex flex-wrap items-center gap-vera-3">{filters}</div> : null}

      <div>{children}</div>

      {footer ? (
        <footer className="border-t border-[var(--border)] pt-vera-4 text-xs text-[var(--muted-foreground)]">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}

/** Alias for official navigation spec */
export { VeraPageLayout as PageLayout };
