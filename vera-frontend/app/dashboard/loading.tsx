import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";
import { MetricsGridSkeleton } from "@/components/dashboard/MetricsGrid";
import { RecentActivitySkeleton } from "@/components/dashboard/RecentActivityCard";

export default function DashboardLoading() {
  return (
    <div className="space-y-vera-8" aria-label="Loading dashboard">
      <div className="mb-vera-8 flex flex-col gap-vera-3 border-b border-vera-charcoal/10 pb-vera-6">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-md" />
      </div>

      <MetricsGridSkeleton />

      <RecentActivitySkeleton />

      <Card className="border-vera-charcoal/10 shadow-sm">
        <CardHeader className="flex flex-col gap-vera-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-vera-2">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <Skeleton className="h-4 w-28 rounded-md" />
        </CardHeader>
        <CardContent>
          <ul className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-32 w-full rounded-xl" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
