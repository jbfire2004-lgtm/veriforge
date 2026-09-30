"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function CombinedResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorPanel
      error={error}
      reset={reset}
      title="Combined-result error"
      homeHref="/supervisor/combined"
      homeLabel="New combined check"
    />
  );
}
