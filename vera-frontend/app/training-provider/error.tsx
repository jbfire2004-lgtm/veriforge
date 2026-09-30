"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function TrainingProviderError({
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
      title="Training-provider dashboard error"
      homeHref="/dashboard"
      homeLabel="Workspace dashboard"
    />
  );
}
