import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-vera-charcoal/15 bg-vera-surface/60 px-vera-8 py-vera-8 text-center shadow-md",
        className
      )}
      {...props}
    >
      <div className="mb-vera-5 flex h-14 w-14 items-center justify-center rounded-full bg-vera-white shadow-md ring-1 ring-vera-charcoal/5">
        <Icon className="h-7 w-7 text-vera-teal" aria-hidden />
      </div>
      <h2 className="text-lg font-medium leading-tight tracking-tight text-vera-charcoal">
        {title}
      </h2>
      {description != null && (
        <p className="mt-vera-3 max-w-md text-sm leading-relaxed text-vera-muted">
          {description}
        </p>
      )}
      {children != null && <div className="mt-vera-6 flex flex-wrap justify-center gap-vera-3">{children}</div>}
    </div>
  );
}
