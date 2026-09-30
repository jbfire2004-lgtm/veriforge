export type ComplianceState = "ok" | "at_risk" | "non_compliant" | "pending" | "unknown";

export const COMPLIANCE_LABELS: Record<ComplianceState, string> = {
  ok: "Compliant",
  at_risk: "Expiring soon",
  non_compliant: "Non-compliant",
  pending: "Pending verification",
  unknown: "Unknown",
};

export type ComplianceStyle = {
  label: string;
  ring: string;
  badge: string;
  card: string;
  credential: string;
  icon: string;
};

export const COMPLIANCE_STYLES: Record<ComplianceState, ComplianceStyle> = {
  ok: {
    label: COMPLIANCE_LABELS.ok,
    ring: "stroke-[var(--compliance-ok)]",
    badge: "bg-[var(--compliance-ok-bg)] text-[var(--compliance-ok-fg)]",
    card: "border-[var(--compliance-ok)]/20 bg-[var(--compliance-ok-bg)]/40",
    credential: "bg-[image:var(--credential-ok)]",
    icon: "text-[var(--compliance-ok)]",
  },
  at_risk: {
    label: COMPLIANCE_LABELS.at_risk,
    ring: "stroke-[var(--compliance-risk)]",
    badge: "bg-[var(--compliance-risk-bg)] text-[var(--compliance-risk-fg)]",
    card: "border-[var(--compliance-risk)]/25 bg-[var(--compliance-risk-bg)]/50",
    credential: "bg-[image:var(--credential-risk)]",
    icon: "text-[var(--compliance-risk)]",
  },
  non_compliant: {
    label: COMPLIANCE_LABELS.non_compliant,
    ring: "stroke-[var(--compliance-bad)]",
    badge: "bg-[var(--compliance-bad-bg)] text-[var(--compliance-bad-fg)]",
    card: "border-[var(--compliance-bad)]/25 bg-[var(--compliance-bad-bg)]/45",
    credential: "bg-[image:var(--credential-bad)]",
    icon: "text-[var(--compliance-bad)]",
  },
  pending: {
    label: COMPLIANCE_LABELS.pending,
    ring: "stroke-[var(--compliance-pending)]",
    badge: "bg-[var(--compliance-pending-bg)] text-[var(--compliance-pending-fg)]",
    card: "border-[var(--compliance-pending)]/20 bg-[var(--compliance-pending-bg)]/40",
    credential: "bg-[image:var(--credential-pending)]",
    icon: "text-[var(--compliance-pending)]",
  },
  unknown: {
    label: COMPLIANCE_LABELS.unknown,
    ring: "stroke-[var(--muted-foreground)]",
    badge: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    card: "border-[var(--border)] bg-[var(--surface)]",
    credential: "bg-[image:var(--credential-pending)]",
    icon: "text-[var(--muted-foreground)]",
  },
};

export function complianceFromExpiry(
  expiresAt: string | Date | null | undefined,
  now = Date.now(),
): ComplianceState {
  if (!expiresAt) return "unknown";
  const ms = new Date(expiresAt).getTime();
  if (Number.isNaN(ms)) return "unknown";
  if (ms <= now) return "non_compliant";
  const days = (ms - now) / 86_400_000;
  if (days <= 30) return "at_risk";
  return "ok";
}

export function complianceFromScore(score: number, critical = 0): ComplianceState {
  if (critical > 0 || score < 50) return "non_compliant";
  if (score < 85) return "at_risk";
  return "ok";
}

export function complianceFromVerified(status?: string | null): ComplianceState {
  if (!status || status === "UNVERIFIED") return "pending";
  if (status === "VERIFIED" || status === "VERIFIED_WITH_NFT") return "ok";
  if (status === "PENDING") return "pending";
  return "unknown";
}
