"use client";

import { CoreMeetingRecordForm } from "@/src/components/core-meeting-record/CoreMeetingRecordForm";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreMeetingRecordNewPage() {
  return (
    <VeraPageLayout
      title="New meeting record"
      description="Record toolbox talks, safety meetings, and attendance."
    >
      <CoreMeetingRecordForm />
    </VeraPageLayout>
  );
}
