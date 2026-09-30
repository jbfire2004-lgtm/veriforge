import { StatusBadge, type ComplianceStatus } from "../data/StatusBadge";

export type ComplianceStatusBadgeProps = {
  status: ComplianceStatus | "lockout";
  label?: string;
  className?: string;
};

const lockoutLabel = "Lockout";

export function ComplianceStatusBadge({
  status,
  label,
  className,
}: ComplianceStatusBadgeProps) {
  if (status === "lockout") {
    return (
      <StatusBadge status="nonCompliant" label={label ?? lockoutLabel} className={className} />
    );
  }
  return <StatusBadge status={status} label={label} className={className} />;
}
