"use client";

import { cn } from "@/src/lib/utils";
import type {
  TrainingRecordOverallStatus,
  VerificationCheckStatus,
} from "@/src/api/core-verification";

const overallLabel = (s: TrainingRecordOverallStatus): string =>
  s === "VERIFIED"
    ? "Verified"
    : s === "ATTENTION"
      ? "Needs attention"
      : "Invalid";

/* ——— Check row (PASS / WARN / FAIL) ——— */

const checkOutline: Record<VerificationCheckStatus, string> = {
  PASS: "border-emerald-200 bg-emerald-50 text-emerald-900",
  WARN: "border-amber-200 bg-amber-50 text-amber-950",
  FAIL: "border-red-200 bg-red-50 text-red-900",
};

const checkSolid: Record<VerificationCheckStatus, string> = {
  PASS: "bg-emerald-600 text-white",
  WARN: "bg-amber-500 text-gray-900",
  FAIL: "bg-red-600 text-white",
};

const checkBaseOutline =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide";
const checkBaseSolid =
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold";

export type VerificationCheckStatusBadgeProps = {
  status: VerificationCheckStatus;
  /** `outline` — table / dense UI; `solid` — cards / high contrast */
  variant?: "outline" | "solid";
  label?: string;
};

export function VerificationCheckStatusBadge({
  status,
  variant = "outline",
  label,
}: VerificationCheckStatusBadgeProps) {
  const map = variant === "solid" ? checkSolid : checkOutline;
  const base = variant === "solid" ? checkBaseSolid : checkBaseOutline;
  const text = label ?? status;
  return <span className={cn(base, map[status])}>{text}</span>;
}

/* ——— Overall training-record result (VERIFIED / ATTENTION / INVALID) ——— */

const overallBordered: Record<TrainingRecordOverallStatus, string> = {
  VERIFIED: "border-emerald-300 bg-emerald-100 text-emerald-950",
  ATTENTION: "border-amber-300 bg-amber-100 text-amber-950",
  INVALID: "border-red-300 bg-red-100 text-red-950",
};

const overallSolid: Record<TrainingRecordOverallStatus, string> = {
  VERIFIED: "bg-emerald-700 text-white",
  ATTENTION: "bg-amber-500 text-gray-900",
  INVALID: "bg-red-700 text-white",
};

const overallBaseBordered =
  "inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold";
const overallBaseSolid =
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold";

export type TrainingRecordOverallStatusBadgeProps = {
  status: TrainingRecordOverallStatus;
  variant?: "bordered" | "solid";
};

export function TrainingRecordOverallStatusBadge({
  status,
  variant = "bordered",
}: TrainingRecordOverallStatusBadgeProps) {
  const map = variant === "solid" ? overallSolid : overallBordered;
  const base = variant === "solid" ? overallBaseSolid : overallBaseBordered;
  return (
    <span className={cn(base, map[status])}>{overallLabel(status)}</span>
  );
}

export type TrainingRecordVerificationBannerProps = {
  status: TrainingRecordOverallStatus;
  title?: string;
};

/** Prominent header for verification result pages. */
export function TrainingRecordVerificationBanner({
  status,
  title = "VERA Core",
}: TrainingRecordVerificationBannerProps) {
  const border =
    status === "VERIFIED"
      ? "border-emerald-500 bg-emerald-50"
      : status === "ATTENTION"
        ? "border-amber-400 bg-amber-50"
        : "border-red-500 bg-red-50";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 p-4 ${border}`}
    >
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-lg font-bold text-gray-900">Training record check</p>
      </div>
      <TrainingRecordOverallStatusBadge status={status} variant="solid" />
    </div>
  );
}

// --- Backwards-compatible names (used across app routes) ---

/** @deprecated Prefer {@link VerificationCheckStatusBadge} with `variant="outline"` */
export const CheckStatusBadge = (props: {
  status: VerificationCheckStatus;
}) => <VerificationCheckStatusBadge {...props} variant="outline" />;

/** @deprecated Prefer {@link TrainingRecordOverallStatusBadge} with `variant="bordered"` */
export const OverallStatusBadge = (props: {
  status: TrainingRecordOverallStatus;
}) => <TrainingRecordOverallStatusBadge {...props} variant="bordered" />;

/** Solid check badge (e.g. `/verify/core/training/[id]` cards) */
export function VerificationStatusBadge({
  status,
  label,
}: {
  status: VerificationCheckStatus;
  label?: string;
}) {
  return (
    <VerificationCheckStatusBadge
      status={status}
      variant="solid"
      label={label}
    />
  );
}

export function VerificationOverallStatusBadge({
  status,
}: {
  status: TrainingRecordOverallStatus;
}) {
  return <TrainingRecordOverallStatusBadge status={status} variant="solid" />;
}

export const VerificationOverallBanner = TrainingRecordVerificationBanner;
