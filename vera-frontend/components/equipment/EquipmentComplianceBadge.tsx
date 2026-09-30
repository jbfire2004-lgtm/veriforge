import { Badge } from "@/components/ui";
import type { ComplianceStatus } from "@/lib/api/equipment-compliance";

const LABELS: Record<ComplianceStatus, string> = {
  COMPLIANT: "Compliant",
  NEEDS_ATTENTION: "Needs attention",
  NON_COMPLIANT: "Non-compliant",
  LOCKED_OUT: "Locked out",
};

export function EquipmentComplianceBadge({
  status,
  className,
}: {
  status: ComplianceStatus | string | null | undefined;
  className?: string;
}) {
  if (!status) return null;

  const variant =
    status === "COMPLIANT"
      ? "success"
      : status === "NEEDS_ATTENTION"
        ? "warning"
        : "danger";

  return (
    <Badge variant={variant} className={className}>
      {LABELS[status as ComplianceStatus] ?? status}
    </Badge>
  );
}
