import type { SafetyFormStatus } from "@/lib/safety-forms";
import { SfBadge } from "./ui/SfBadge";

const TONE: Record<
  SafetyFormStatus,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  DRAFT: "info",
  SUBMITTED: "default",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CLOSED: "info",
  CANCELLED: "info",
};

export function SafetyFormStatusBadge({ status }: { status: SafetyFormStatus }) {
  return (
    <SfBadge tone={TONE[status] ?? "info"}>
      {status.replace(/_/g, " ")}
    </SfBadge>
  );
}
