"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function ForbiddenError({
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
      title="Access page failed to render"
      homeHref="/"
      homeLabel="Back to home"
    />
  );
}
