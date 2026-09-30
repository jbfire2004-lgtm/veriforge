"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function DemoError({
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
      title="Demo content error"
      homeHref="/"
      homeLabel="Back to home"
    />
  );
}
