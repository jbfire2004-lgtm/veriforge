import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";

export default function LoginLoading() {
  return (
    <Card className="border-vera-charcoal/10 shadow-vera" aria-busy="true">
      <CardHeader className="space-y-vera-3">
        <div className="flex items-center gap-vera-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-vera-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-56" />
          </div>
        </div>
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-vera-5">
        <div className="space-y-vera-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="space-y-vera-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}
