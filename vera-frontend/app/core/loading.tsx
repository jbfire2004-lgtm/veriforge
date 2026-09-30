import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from "@/components/ui";

export default function CoreSegmentLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading VERA Core"
      className="vera-motion-fade-up mx-auto w-full max-w-5xl space-y-vera-6"
    >
      <div className="space-y-vera-3">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-8 w-2/3 max-w-md rounded-lg" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-md" />
      </div>

      <Card className="border-vera-charcoal/10 shadow-md">
        <CardHeader className="space-y-vera-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </CardHeader>
        <CardContent className="space-y-vera-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="flex flex-wrap gap-vera-3">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10 shadow-md">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-vera-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}
