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
    <html lang="en">
      <body className="min-h-screen bg-vera-surface/40 px-vera-6 py-vera-10">
        <RouteErrorPanel
          error={error}
          reset={reset}
          title="Unexpected application error"
          homeHref="/"
          homeLabel="Back to workspace"
        />
      </body>
    </html>
  );
}
