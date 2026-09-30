"use client";

import { VeriPmSafetyMeetingBuilderView } from "@/components/veripm-safety-meetings-hub/VeriPmSafetyMeetingBuilderView";

export default function NewSafetyMeetingPage({
  projectId,
  companyId,
}: {
  projectId: number;
  companyId: number;
}) {
  return (
    <VeriPmSafetyMeetingBuilderView
      projectId={projectId}
      companyId={companyId}
    />
  );
}
