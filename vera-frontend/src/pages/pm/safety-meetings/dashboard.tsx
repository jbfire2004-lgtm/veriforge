"use client";

import { VeriPmSafetyMeetingsHubView } from "@/components/veripm-safety-meetings-hub/VeriPmSafetyMeetingsHubView";

export default function SafetyMeetingsDashboard({
  projectId,
  companyId,
}: {
  projectId: number;
  companyId: number;
}) {
  return (
    <VeriPmSafetyMeetingsHubView
      projectId={projectId}
      companyId={companyId}
    />
  );
}
