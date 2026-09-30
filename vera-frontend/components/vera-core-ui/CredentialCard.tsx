"use client";

import Link from "next/link";
import { CalendarClock, ShieldCheck } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  complianceFromExpiry,
  complianceFromVerified,
  type ComplianceState,
} from "@/lib/vera-core-ui/compliance";

export type CredentialCardData = {
  id: number;
  title: string;
  issuer?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  verifiedStatus?: string | null;
  href?: string;
  daysUntilExpiry?: number | null;
};

type Props = {
  credential: CredentialCardData;
  state?: ComplianceState;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

function resolveState(credential: CredentialCardData, override?: ComplianceState): ComplianceState {
  if (override) return override;
  const verified = complianceFromVerified(credential.verifiedStatus);
  if (verified === "pending") return verified;
  return complianceFromExpiry(credential.expiresAt);
}

function expiryLabel(credential: CredentialCardData): string {
  if (credential.daysUntilExpiry != null) {
    if (credential.daysUntilExpiry < 0) return "Expired";
    if (credential.daysUntilExpiry === 0) return "Expires today";
    return `${credential.daysUntilExpiry}d left`;
  }
  if (!credential.expiresAt) return "No expiry";
  const days = Math.ceil(
    (new Date(credential.expiresAt).getTime() - Date.now()) / 86_400_000,
  );
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  return `${days}d left`;
}

export function CredentialCard({ credential, state, className, style, onClick }: Props) {
  const resolved = resolveState(credential, state);
  const progress =
    credential.expiresAt && resolved !== "non_compliant"
      ? Math.max(
          8,
          Math.min(
            100,
            Math.ceil(
              ((credential.daysUntilExpiry ?? 30) / 365) * 100,
            ),
          ),
        )
      : resolved === "non_compliant"
        ? 4
        : 72;

  const gradientVar =
    resolved === "ok"
      ? "var(--credential-ok)"
      : resolved === "at_risk"
        ? "var(--credential-risk)"
        : resolved === "non_compliant"
          ? "var(--credential-bad)"
          : "var(--credential-pending)";

  const inner = (
    <article
      className={cn(
        "vera-credential-card vera-credential-enter relative overflow-hidden p-5 text-white",
        "transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-lg",
        onClick ? "cursor-pointer" : "",
        className,
      )}
      style={{ backgroundImage: gradientVar, ...style }}
      onClick={onClick}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: "var(--credential-shine)" }}
        aria-hidden
      />
      <div className="relative z-10 flex min-h-[148px] flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/75">
              {credential.issuer ?? "Vera credential"}
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold leading-snug tracking-tight">
              {credential.title}
            </h3>
          </div>
          <ShieldCheck className="h-6 w-6 shrink-0 text-white/90" aria-hidden />
        </div>

        <div className="space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/90 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-white/85">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              {expiryLabel(credential)}
            </span>
            <ComplianceBadgeLight state={resolved} />
          </div>
        </div>
      </div>
    </article>
  );

  if (credential.href) {
    return (
      <Link href={credential.href} className="block no-underline">
        {inner}
      </Link>
    );
  }
  return inner;
}

function ComplianceBadgeLight({ state }: { state: ComplianceState }) {
  const label =
    state === "ok"
      ? "Verified"
      : state === "at_risk"
        ? "Expiring"
        : state === "non_compliant"
          ? "Expired"
          : state === "pending"
            ? "Pending"
            : "—";
  return (
    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide">
      {label}
    </span>
  );
}
