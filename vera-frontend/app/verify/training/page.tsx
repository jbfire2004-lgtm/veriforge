import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TrainingViewerView } from "@/components/verify/TrainingViewerView";
import { VerifySuspenseFallback } from "@/components/VerifySuspenseFallback";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }> | { id?: string };
}) {
  const sp = await resolveSearchParams(searchParams);
  const id = sp.id?.trim();
  if (id && /^\d+$/.test(id)) {
    redirect(`/verify/core/training/${id}`);
  }

  return (
    <Suspense fallback={<VerifySuspenseFallback />}>
      <TrainingViewerView />
    </Suspense>
  );
}
