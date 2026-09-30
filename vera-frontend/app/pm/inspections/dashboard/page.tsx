"use client";

import { useSearchParams } from "next/navigation";
import { InspectionCorrectiveBoard } from "@/components/inspection/InspectionCorrectiveBoard";

export default function InspectionDashboardPage() {
  const params = useSearchParams();
  const projectId = parseInt(params?.get("projectId") ?? "1", 10);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <InspectionCorrectiveBoard projectId={projectId} />
    </main>
  );
}
