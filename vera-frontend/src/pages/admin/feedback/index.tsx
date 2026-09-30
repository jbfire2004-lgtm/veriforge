"use client";

import { AdminPageLayout } from "@/src/components/admin/subscriptions";
import { FeedbackManagerPanel } from "@/components/admin/adoption/FeedbackManagerPanel";

export default function AdminFeedbackPage() {
  return (
    <AdminPageLayout
      title="Feedback manager"
      description="Review and triage product feedback from Vera users."
    >
      <FeedbackManagerPanel />
    </AdminPageLayout>
  );
}
