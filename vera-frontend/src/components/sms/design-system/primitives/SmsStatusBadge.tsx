"use client";

import type { ReactNode } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";

export type SmsStatusTone =
  | "neutral"
  | "info"
  | "positive"
  | "caution"
  | "critical"
  | "default"
  | "success"
  | "warning"
  | "danger";

const TONE_CLASS: Record<string, string> = {
  neutral: "vera-status vera-status--neutral sms-status sms-status-neutral",
  default: "vera-status vera-status--neutral sms-status sms-status-neutral",
  info: "vera-status vera-status--info sms-status sms-status-info",
  positive: "vera-status vera-status--success sms-status sms-status-positive",
  success: "vera-status vera-status--success sms-status sms-status-positive",
  caution: "vera-status vera-status--warning sms-status sms-status-caution",
  warning: "vera-status vera-status--warning sms-status sms-status-caution",
  critical: "vera-status vera-status--danger sms-status sms-status-critical",
  danger: "vera-status vera-status--danger sms-status sms-status-critical",
};

/**
 * Industrial status badge — 3px radius, theme tokens, light/dark parity.
 * Prefer this over pill badges inside SMS / VeriPM modules.
 */
export function SmsStatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: SmsStatusTone;
  className?: string;
}) {
  const key = tone in TONE_CLASS ? tone : "neutral";
  return (
    <span className={sfCn(TONE_CLASS[key], className)}>{children}</span>
  );
}
