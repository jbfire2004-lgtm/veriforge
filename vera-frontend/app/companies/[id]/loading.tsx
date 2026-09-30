import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from "@/components/ui";

function HeaderCardSkeleton() {
  return (
    <Card className="border-vera-charcoal/10 shadow-vera">
      <CardHeader className="gap-vera-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-vera-5">
          <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
          <div className="space-y-vera-2">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-8 w-60 rounded" />
            <Skeleton className="h-4 w-80 rounded" />
            <Skeleton className="mt-vera-1 h-5 w-24 rounded-full" />
          </div>
        </div>
        <div className="flex gap-vera-2">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-vera-5 border-t border-vera-charcoal/10 pt-vera-6 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-vera-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-vera-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-6 w-16 rounded" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CompliancePanelSkeleton() {
  return (
    <Card className="border-vera-charcoal/10 shadow-sm">
      <CardHeader className="gap-vera-3">
        <div className="flex items-center gap-vera-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="space-y-vera-2">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-vera-4">
        <Skeleton className="h-5 w-32 rounded-full" />
        <div className="grid gap-vera-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TableCardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-vera-3 space-y-0">
        <div className="flex items-start gap-vera-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-vera-2">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-vera-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

function SummarySectionSkeleton() {
  return (
    <section className="space-y-vera-5">
      <div className="space-y-vera-2">
        <Skeleton className="h-6 w-56 rounded" />
        <Skeleton className="h-4 w-80 rounded" />
      </div>
      <div className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-vera-charcoal/10 shadow-md">
            <CardContent className="flex items-center gap-vera-4 p-vera-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-vera-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-7 w-16 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <TableCardSkeleton rows={4} />
    </section>
  );
}

export default function CompanyDetailLoading() {
  return (
    <div className="space-y-vera-8">
      <Skeleton className="h-4 w-48 rounded" />

      <HeaderCardSkeleton />

      <CompliancePanelSkeleton />

      <TableCardSkeleton rows={6} />

      <TableCardSkeleton rows={3} />

      <SummarySectionSkeleton />

      <SummarySectionSkeleton />
    </div>
  );
}
