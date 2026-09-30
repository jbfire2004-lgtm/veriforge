"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function SafetyStationMonitorError({
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
      title="Safety-station monitor error"
      homeHref="/safety-station/config"
      homeLabel="Open configuration"
    />
  );
}
