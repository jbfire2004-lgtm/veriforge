"use client";

import { CoreComplianceNoteForm } from "@/src/components/core-compliance-note/CoreComplianceNoteForm";
import { VeraPageLayout } from "@/src/components/navigation";

export default function CoreComplianceNoteNewPage() {
  return (
    <VeraPageLayout
      title="New compliance note"
      description="Create a compliance note for audit and regulatory context."
    >
      <CoreComplianceNoteForm />
    </VeraPageLayout>
  );
}
