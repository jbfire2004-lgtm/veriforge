import type { CailStatus } from "@/lib/safety-intelligence-types";
import { SfBadge } from "@/src/components/safety-forms/ui";
import { CAIL_STATUS_LABELS } from "@/lib/safety-intelligence";

const TONE: Record<
  CailStatus,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  open: "warning",
  in_progress: "default",
  overdue: "danger",
  resolved: "success",
  verified: "success",
  cancelled: "info",
};

export function CailStatusBadge({ status }: { status: CailStatus }) {
  return (
    <SfBadge tone={TONE[status] ?? "info"}>
      {CAIL_STATUS_LABELS[status] ?? status}
    </SfBadge>
  );
}
