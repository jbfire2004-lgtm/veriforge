import * as React from "react";
import { cn } from "@/src/lib/utils";
import { Skeleton } from "./skeleton";

/** Metric cards row (admin dashboard, summaries). */
export function DashboardSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto max-w-7xl space-y-vera-8", className)} {...props}>
      <div className="space-y-vera-3 border-b border-vera-charcoal/10 pb-vera-8">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-10 w-2/3 max-w-md rounded-lg" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-md" />
        <div className="flex flex-wrap gap-vera-3 pt-vera-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-vera-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-vera-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 8,
  columns = 5,
  className,
  ...props
}: {
  rows?: number;
  columns?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("w-full space-y-vera-3", className)} {...props} role="status" aria-label="Loading table">
      <div className="flex gap-vera-2 border-b border-vera-charcoal/10 pb-vera-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1 rounded-md" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-vera-2 py-vera-2">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={`c-${r}-${c}`} className="h-8 flex-1 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Admin list shell: title strip + optional toolbar + table placeholder. */
export function AdminListPageSkeleton({
  className,
  showToolbar = true,
  ...props
}: { showToolbar?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-vera-6", className)} {...props}>
      <div className="space-y-vera-3 border-b border-vera-charcoal/10 pb-vera-6">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-9 w-48 max-w-full rounded-lg" />
        <Skeleton className="h-5 w-full max-w-xl rounded-md" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      {showToolbar ? (
        <div className="flex flex-wrap gap-vera-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      ) : null}
      <TableSkeleton rows={10} columns={5} />
    </div>
  );
}

export function WalletPageSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto max-w-lg space-y-vera-6 md:max-w-2xl", className)} {...props}>
      <div className="flex gap-vera-4">
        <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-vera-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-5 w-1/2 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-48 w-full max-w-sm mx-auto rounded-2xl" />
      <div className="space-y-vera-3">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function VerificationFlowSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto max-w-2xl space-y-vera-6 px-vera-4 py-vera-8", className)} {...props}>
      <Skeleton className="h-8 w-56 rounded-lg" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="space-y-vera-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

export function TrainingRecordViewerSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-vera-6", className)} {...props}>
      <div className="flex flex-wrap justify-between gap-vera-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="flex gap-vera-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}

/** Form skeleton: page header strip + max-w-xl card with stacked field placeholders. */
export function FormCardSkeleton({
  className,
  fields = 4,
  ...props
}: { fields?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-vera-8", className)} {...props} role="status" aria-label="Loading form">
      <div className="space-y-vera-3 border-b border-vera-charcoal/10 pb-vera-6">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-9 w-48 max-w-full rounded-lg" />
        <Skeleton className="h-5 w-full max-w-xl rounded-md" />
      </div>
      <div className="max-w-xl space-y-vera-6 rounded-xl border border-vera-charcoal/10 bg-vera-white p-vera-8 shadow-md">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-vera-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <div className="flex gap-vera-3 pt-vera-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Detail-page skeleton: page-header strip + hero summary card + two stacked
 * content cards. Used for `/admin/{workers,companies,equipment,certifications}/[id]`
 * drill-downs so cross-segment navigation always shows immediate feedback.
 */
export function DetailPageSkeleton({
  className,
  actions = 3,
  cards = 2,
  ...props
}: { actions?: number; cards?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading details"
      className={cn("space-y-vera-6", className)}
      {...props}
    >
      <div className="space-y-vera-3 border-b border-vera-charcoal/10 pb-vera-6">
        <Skeleton className="h-4 w-40 rounded-md" />
        <div className="flex flex-wrap items-end justify-between gap-vera-4">
          <div className="space-y-vera-2">
            <Skeleton className="h-9 w-64 max-w-full rounded-lg" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-vera-2">
            {Array.from({ length: actions }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-vera-charcoal/10 bg-vera-white p-vera-8 shadow-md">
        <div className="flex flex-col gap-vera-6 sm:flex-row sm:items-center">
          <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-vera-2">
            <Skeleton className="h-5 w-1/3 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
          </div>
        </div>
      </div>

      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-vera-charcoal/10 bg-vera-white shadow-md"
        >
          <div className="border-b border-vera-charcoal/10 p-vera-6">
            <Skeleton className="h-5 w-48 rounded-md" />
          </div>
          <div className="space-y-vera-3 p-vera-6">
            <Skeleton className="h-4 w-full max-w-md rounded-md" />
            <Skeleton className="h-4 w-3/4 max-w-md rounded-md" />
            <Skeleton className="h-4 w-2/3 max-w-md rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceDashboardSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-vera-8", className)} {...props}>
      <div className="space-y-vera-3 border-b border-vera-charcoal/10 pb-vera-6">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-md" />
      </div>
      <div className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
