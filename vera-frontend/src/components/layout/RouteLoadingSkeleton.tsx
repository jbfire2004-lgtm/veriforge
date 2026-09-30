import { Skeleton } from "@/components/ui";

export type RouteLoadingSkeletonProps = {
  /** Optional title hint, hidden from sighted users — used by screen readers. */
  label?: string;
};

/**
 * Default loading fallback used by simple `loading.tsx` files. Renders a small
 * stack of skeletons that approximates a page header + content block, with
 * an accessible label so AT users know a load is in flight.
 */
export function RouteLoadingSkeleton({
  label = "Loading…",
}: RouteLoadingSkeletonProps) {
  return (
    <div className="space-y-vera-6" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="space-y-vera-3">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-lg" />
      </div>
      <div className="grid gap-vera-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
