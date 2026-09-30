"use client";

import { RouteErrorPanel } from "@/src/components/layout/RouteErrorPanel";

export default function SafetyStationConfigError({
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
      title="Safety-station configuration error"
      homeHref="/safety-station/monitor"
      homeLabel="Open monitor"
    />
  );
}
