"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function PmError({
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
      title="PM workflows error"
      homeHref="/dashboard"
      homeLabel="Workspace dashboard"
    />
  );
}
