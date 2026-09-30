import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography } from "./theme";
import { vfSurface } from "./surfaces";
import { ComplianceIcon, VerificationIcon } from "./icons";

export type VeriForgeAlertTone = "critical" | "neutral" | "success" | "warning";

const toneClasses: Record<VeriForgeAlertTone, string> = {
  critical: vfSurface.critical + " text-[#F0DADA]",
  warning: vfSurface.warning + " text-[#F2E8C8]",
  neutral: vfSurface.panel + " text-[#D5DBE0]",
  success: vfSurface.success + " text-[#D4EEDC]",
};

const rail: Record<VeriForgeAlertTone, string> = {
  critical: "bg-[#B33A3A]",
  warning: "bg-[#C89F3D]",
  neutral: "bg-[#1E6FB8]",
  success: "bg-[#4FAF6F]",
};

/**
 * Industrial alert — matte status surfaces with ISO line icons.
 * Controlled red only for `critical` (compliance failures / stop-work).
 */
export function VeriForgeAlert({
  tone = "neutral",
  title,
  message,
  className,
}: {
  tone?: VeriForgeAlertTone;
  title: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "relative flex gap-3 overflow-hidden px-4 py-3 pl-5",
        toneClasses[tone],
        className,
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-[3px]", rail[tone])}
        aria-hidden
      />
      <div className="mt-0.5 shrink-0">
        {tone === "success" ? (
          <ComplianceIcon size={20} tone="active" />
        ) : (
          <VerificationIcon
            size={20}
            tone={tone === "critical" ? "critical" : "active"}
          />
        )}
      </div>
      <div className="min-w-0 space-y-1">
        <p
          className={cn(
            veriforgeTypography.heading,
            "text-[12px] font-semibold text-inherit",
          )}
        >
          {title}
        </p>
        <p className="text-sm leading-relaxed opacity-95">{message}</p>
      </div>
    </div>
  );
}
