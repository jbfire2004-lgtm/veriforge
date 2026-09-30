import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeBase, veriforgeFx, veriforgeTypography } from "./theme";

/**
 * VeriForge Safety Platform button system.
 * Primary = slate · Secondary = graphite · Action = safety blue.
 * Controlled red (#B33A3A) is for alerts only — never routine action CTAs.
 */
export type VeriForgeButtonVariant =
  | "primary"
  | "secondary"
  | "action"
  | "success"
  | "warning"
  | "ghost"
  /** Alerts only — prefer `warning` for caution actions */
  | "critical"
  /** @deprecated Use `warning` */
  | "destructive";

type VeriForgeButtonSize = "sm" | "md" | "lg";

export interface VeriForgeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VeriForgeButtonVariant;
  size?: VeriForgeButtonSize;
}

const variantStyles: Record<
  Exclude<VeriForgeButtonVariant, "destructive">,
  string
> = {
  primary:
    "bg-[#2A2E33] border-[#1F2328] text-[#F4F6F8] " +
    "hover:bg-[#343940] hover:border-[#2A2E33] hover:-translate-y-px " +
    "active:translate-y-0 active:bg-[#23272C]",
  secondary:
    "bg-[#3B3F45] border-[#2A2E33] text-[#F4F6F8] " +
    "hover:bg-[#454A51] hover:border-[#343940] hover:-translate-y-px " +
    "active:translate-y-0 active:bg-[#32363C]",
  action:
    "bg-[#1E6FB8] border-[#174F86] text-[#F4F6F8] " +
    "hover:bg-[#1A63A6] hover:border-[#143F6C] hover:-translate-y-px " +
    "active:translate-y-0 active:bg-[#174F86]",
  success:
    "bg-[#4FAF6F] border-[#3D8F58] text-[#0F1A12] " +
    "hover:bg-[#45A064] hover:border-[#357A4C] hover:-translate-y-px " +
    "active:translate-y-0 active:bg-[#3D8F58]",
  warning:
    "bg-[#C89F3D] border-[#A8842F] text-[#1C1A10] " +
    "hover:bg-[#B89136] hover:border-[#947528] hover:-translate-y-px " +
    "active:translate-y-0 active:bg-[#A8842F]",
  critical:
    "bg-[#B33A3A] border-[#8F2E2E] text-[#F4F6F8] " +
    "hover:bg-[#A33434] hover:border-[#7A2828] hover:-translate-y-px " +
    "active:translate-y-0 active:bg-[#8F2E2E]",
  ghost:
    "bg-transparent border-[#5A6169] text-[#F4F6F8] " +
    "hover:border-[#6B737C] hover:bg-[#3B3F45]/40 hover:-translate-y-px " +
    "active:translate-y-0 active:bg-[#2A2E33]/60",
};

const sizeStyles: Record<VeriForgeButtonSize, string> = {
  sm: "h-9 min-h-9 px-3 text-[12px]",
  md: "h-10 min-h-10 px-4 text-[13px]",
  lg: "h-11 min-h-11 px-5 text-sm",
};

function resolveVariant(
  variant: VeriForgeButtonVariant,
): Exclude<VeriForgeButtonVariant, "destructive"> {
  return variant === "destructive" ? "warning" : variant;
}

export function VeriForgeButton({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: VeriForgeButtonProps) {
  const resolved = resolveVariant(variant);

  return (
    <button
      type={type}
      className={cn(
        veriforgeBase,
        veriforgeTypography.heading,
        "inline-flex items-center justify-center gap-2 rounded-[3px] border " +
          "px-4 py-2 font-medium tracking-[0.02em] shadow-none " +
          "transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8] " +
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1F24]",
        "disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed " +
          "disabled:border-[#454A51] disabled:bg-[#353A40] disabled:text-[#8A9199] disabled:opacity-70",
        variantStyles[resolved],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}

export function VeriForgeCTA({
  className,
  kicker,
  title,
  description,
  actionLabel,
  onAction,
}: {
  className?: string;
  kicker?: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <section
      className={cn(
        veriforgeBase,
        veriforgeFx.panel,
        "rounded-[3px] border border-[#5A6169] p-6 shadow-none",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(30,111,184,.08)_0%,transparent_42%)]" />
      <div className="relative z-10 space-y-3">
        {kicker ? (
          <p
            className={cn(
              veriforgeTypography.heading,
              "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]",
            )}
          >
            {kicker}
          </p>
        ) : null}
        <h3
          className={cn(
            veriforgeTypography.heading,
            "text-xl font-semibold tracking-tight text-[#F4F6F8]",
          )}
        >
          {title}
        </h3>
        <p className="max-w-xl text-sm leading-relaxed text-[#B8C0C8]">
          {description}
        </p>
        <VeriForgeButton variant="action" size="lg" onClick={onAction}>
          {actionLabel}
        </VeriForgeButton>
      </div>
    </section>
  );
}
