import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

export type SkeletonLoaderProps = {
  rows?: number;
  className?: string;
};

export function SkeletonLoader({ rows = 3, className }: SkeletonLoaderProps) {
  return (
    <section className={cn("space-y-3", className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-[var(--radius-md)]" />
      ))}
    </section>
  );
}
