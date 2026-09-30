"use client";

import { useParams } from "next/navigation";
import { PmSafetyWorkflowReviewScreen } from "@/src/components/pm/PmSafetyWorkflowReviewScreen";

export default function PmSafetyWorkflowReviewPage() {
  const params = useParams();
  const idParam = params?.id;
  const id =
    typeof idParam === "string"
      ? parseInt(idParam, 10)
      : Array.isArray(idParam)
        ? parseInt(idParam[0], 10)
        : NaN;

  return <PmSafetyWorkflowReviewScreen workflowId={id} />;
}

