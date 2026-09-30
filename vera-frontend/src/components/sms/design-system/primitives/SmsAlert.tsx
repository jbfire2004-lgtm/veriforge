import type { ReactNode } from "react";
import { sfCn } from "@/src/components/safety-forms/theme/cn";
import { SmsButton } from "./SmsButton";

type Props = {
  tone?: "error" | "success" | "warning" | "info";
  title?: ReactNode;
  children: ReactNode;
  onRetry?: () => void;
  className?: string;
};

const TONE_CLASS = {
  error: "border-[var(--sf-danger)]/30 bg-red-500/10 text-[var(--sf-danger)]",
  success: "border-[var(--sf-success)]/30 bg-emerald-500/10 text-emerald-800",
  warning: "border-[var(--sf-warning)]/30 bg-amber-500/10 text-amber-900",
  info: "border-[var(--sf-border)] bg-[var(--sf-surface-hover)] text-[var(--sf-text)]",
};

export function SmsAlert({
  tone = "info",
  title,
  children,
  onRetry,
  className,
}: Props) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={sfCn(
        "rounded-[var(--sf-radius-lg)] border p-[var(--sms-space-4)] text-sm",
        TONE_CLASS[tone],
        className,
      )}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
      {onRetry ? (
        <SmsButton
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          Try again
        </SmsButton>
      ) : null}
    </div>
  );
}
