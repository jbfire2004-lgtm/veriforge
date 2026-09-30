import { Skeleton } from "@/components/ui";

export default function CompaniesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-vera-charcoal/10 pb-vera-6">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-5 w-full max-w-xl rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
