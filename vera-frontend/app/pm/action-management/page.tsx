import { VeraPageLayout } from "@/src/components/navigation";
import { CorrectiveActionManagementView } from "@/components/corrective-action-management/CorrectiveActionManagementView";
import { Suspense } from "react";

export const metadata = {
  title: "Action Management",
  description:
    "Corrective Actions, Preventive Actions, aging, effectiveness, workflow, AI suggestions, and insights.",
};

export default function CorrectiveActionManagementPage() {
  return (
    <VeraPageLayout>
      <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading…</p>}>
        <CorrectiveActionManagementView />
      </Suspense>
    </VeraPageLayout>
  );
}
