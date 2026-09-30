import { Skeleton } from "@/components/ui";

export default function WalletIndexLoading() {
  return (
    <div className="max-w-md space-y-vera-6">
      <Skeleton className="h-9 w-56 rounded-lg" />
      <Skeleton className="h-5 w-full rounded-md" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}
