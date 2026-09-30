import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "teal" | "outline" | "success" | "warning" | "danger";
  /** Optional Lucide icon rendered before the label. */
  icon?: LucideIcon;
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "border border-[#1F2328] bg-[#2A2E33] text-[#F4F6F8] shadow-none",
  teal:
    "border border-[#2F8F8C]/35 bg-[#2F8F8C]/15 text-[#1A5553] ring-0",
  outline:
    "border border-[#2A2E33]/20 bg-white text-[#2A2E33] shadow-none",
  success:
    "border border-[#3D8F58] bg-[#4FAF6F] text-[#0F1A12] shadow-none",
  warning:
    "border border-[#A8842F] bg-[#C89F3D] text-[#1C1A10] shadow-none",
  /** Controlled red — status/alert badges only */
  danger:
    "border border-[#8F2E2E] bg-[#B33A3A] text-[#F4F6F8] shadow-none",
};

export function Badge({
  className,
  variant = "default",
  icon: Icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-vera-2 rounded-[3px] px-vera-3 py-vera-1 text-xs font-medium tracking-tight",
        variants[variant],
        className,
      )}
      {...props}
    >
      {Icon != null && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      {children}
    </span>
  );
}
