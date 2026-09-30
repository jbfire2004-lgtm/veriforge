import { Skeleton } from "@/components/ui";

export default function WorkerDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 border-b border-vera-charcoal/10 pb-vera-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-5 w-full max-w-xl rounded-md" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
