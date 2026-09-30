"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-vera-surface/40 px-vera-6 py-vera-10">
      <RouteErrorPanel
        error={error}
        reset={reset}
        title="Something went wrong"
        homeHref="/"
        homeLabel="Back to home"
      />
    </main>
  );
}
