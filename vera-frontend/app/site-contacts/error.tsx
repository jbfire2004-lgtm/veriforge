"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function SiteContactsError({
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
      title="Site-contacts error"
      homeHref="/dashboard"
      homeLabel="Workspace dashboard"
    />
  );
}
