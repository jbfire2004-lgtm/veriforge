import type { ReactNode } from "react";
import { SmsStatusBadge, type SmsStatusTone } from "./SmsStatusBadge";

export type SmsBadgeTone =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONE_MAP: Record<SmsBadgeTone, SmsStatusTone> = {
  default: "neutral",
  secondary: "info",
  success: "positive",
  warning: "caution",
  danger: "critical",
  info: "info",
};

/** SMS status badge — industrial radius, light/dark token parity. */
export function SmsBadge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: SmsBadgeTone;
  className?: string;
}) {
  return (
    <SmsStatusBadge tone={TONE_MAP[tone]} className={className}>
      {children}
    </SmsStatusBadge>
  );
}
