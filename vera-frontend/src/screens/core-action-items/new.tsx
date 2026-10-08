"use client";

import { CoreActionItemForm } from "@/src/components/core-action-items/CoreActionItemForm";
import { VeraPageLayout } from "@/src/components/navigation";

export default function NewCoreActionItemPage() {
  return (
    <VeraPageLayout
      title="New action item"
      description={
        <>
          Safety and compliance follow-ups via{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">
            POST /api/v1/core-action-items
          </code>
        </>
      }
    >
      <CoreActionItemForm />
    </VeraPageLayout>
  );
}
