"use client";

import { useSearchParams } from "next/navigation";
import { OrientationDashboard } from "@/components/orientation/OrientationDashboard";

export default function PmOrientationPage() {
  const search = useSearchParams();
  const projectIdRaw = search.get("projectId");
  const projectId = projectIdRaw ? parseInt(projectIdRaw, 10) : undefined;

  return (
    <OrientationDashboard
      projectId={projectId}
      basePath={`/pm/orientation${projectId ? `?projectId=${projectId}` : ""}`}
    />
  );
}
