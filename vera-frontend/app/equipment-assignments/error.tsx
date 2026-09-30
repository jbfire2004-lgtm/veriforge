"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function EquipmentAssignmentsError({
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
      title="Equipment assignments error"
      homeHref="/dashboard"
      homeLabel="Workspace dashboard"
    />
  );
}
