"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";

export default function VeriHubProjectsPage() {
  return (
    <VeriHubConsoleShell
      title="Projects"
      description="Organization project overview across VeriPM."
    >
      <p className="text-sm text-zinc-600">
        Placeholder shell for project portfolio management. Requires VeriPM
        module enablement.
      </p>
    </VeriHubConsoleShell>
  );
}
