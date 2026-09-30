import * as React from "react";
import { cn } from "@/src/lib/utils";
import { WorkspaceHero } from "@/components/theme/workspace";

export interface PageHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned actions (buttons, links). */
  actions?: React.ReactNode;
  /** Optional eyebrow / kicker rendered above the title. */
  eyebrow?: React.ReactNode;
  /** Use gradient hero styling (matches Vera PM / welcome). */
  variant?: "default" | "workspace";
}

/**
 * Page header slot used inside `AppLayout` (between breadcrumbs and content).
 * Composed from VERA tokens only — heading uses `font-medium`, body
 * `font-normal`, deep-navy title color, slate/muted body, `vera-*` spacing.
 */
export function PageHeader({
  className,
  title,
  description,
  actions,
  eyebrow,
  variant = "default",
  ...props
}: PageHeaderProps) {
  if (variant === "workspace") {
    return (
      <WorkspaceHero
        className={cn("mb-vera-6 sm:mb-vera-8", className)}
        eyebrow={typeof eyebrow === "string" ? eyebrow : undefined}
        title={title}
        description={description}
        actions={actions}
      />
    );
  }

  return (
    <div
      className={cn(
        "mb-vera-6 flex flex-col gap-vera-4 border-b border-vera-charcoal/10 pb-vera-5 sm:mb-vera-8 sm:pb-vera-6 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0 space-y-vera-2">
        {eyebrow != null ? (
          <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-balance text-xl font-medium leading-tight tracking-tight text-vera-deep sm:text-2xl">
          {title}
        </h1>
        {description != null ? (
          <p className="max-w-prose text-sm font-normal leading-relaxed text-vera-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions != null ? (
        <div className="flex flex-wrap items-center gap-vera-2 sm:shrink-0 sm:gap-vera-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
