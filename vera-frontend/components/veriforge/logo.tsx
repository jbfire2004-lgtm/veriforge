import * as React from "react";
import { cn } from "@/src/lib/utils";
import { veriforgeTypography } from "./theme";

/**
 * VeriForge brand mark — geometric verification / inspection badge.
 *
 * Motif language:
 * - Inspection-tag plate (slate → graphite)
 * - ISO-style verification frame (safety blue)
 * - Compliance check (inspection teal)
 * - Tag registration hole (structural, not decorative)
 *
 * Clear space ≥ mark height. Do not rotate, stretch, recolor, or add gloss.
 */
export function VeriForgeMark({
  size = 32,
  className,
  title = "VeriForge",
  variant = "default",
}: {
  size?: number;
  className?: string;
  title?: string;
  /** default = filled plate · outline = line-only for light surfaces · mono = single-tone */
  variant?: "default" | "outline" | "mono";
}) {
  const id = React.useId().replace(/:/g, "");
  const isOutline = variant === "outline";
  const isMono = variant === "mono";

  const plateFill = isOutline || isMono ? "none" : `url(#${id}-plate)`;
  const plateStroke = isMono ? "currentColor" : "#5A6169";
  const frameStroke = isMono ? "currentColor" : "#1E6FB8";
  const checkStroke = isMono ? "currentColor" : "#2F8F8C";
  const holeFill = isOutline || isMono ? "none" : "#1C1F24";

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn(isMono && "text-[#2A2E33]", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {!isOutline && !isMono ? (
        <defs>
          <linearGradient id={`${id}-plate`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B3F45" />
            <stop offset="55%" stopColor="#2A2E33" />
            <stop offset="100%" stopColor="#23272C" />
          </linearGradient>
        </defs>
      ) : null}

      {/* Inspection tag plate — clipped corner evokes physical safety tags */}
      <path
        d="M3 4.5h21.5L29 10v17.5c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6.5c0-1.1.9-2 2-2Z"
        fill={plateFill}
        stroke={plateStroke}
        strokeWidth="1.15"
        strokeLinejoin="round"
      />

      {/* Inner verification frame — geometric compliance seal */}
      <rect
        x="7.5"
        y="9.5"
        width="17"
        height="14"
        rx="1.5"
        fill="none"
        stroke={frameStroke}
        strokeWidth="1.45"
      />

      {/* Crosshair registration — inspection / survey cue */}
      <path
        d="M16 11.2v2.2M16 18.6v2.2M12.2 16h2.2M17.6 16h2.2"
        fill="none"
        stroke={frameStroke}
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Compliance verification check */}
      <path
        d="M11.4 16.2 14.5 19.1 20.8 12.6"
        fill="none"
        stroke={checkStroke}
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tag registration hole */}
      <circle
        cx="25.4"
        cy="6.6"
        r="1.35"
        fill={holeFill}
        stroke={plateStroke}
        strokeWidth="0.9"
      />
    </svg>
  );
}

/**
 * Horizontal lockup — mark + wordmark + compliance descriptor.
 *
 * Logo usage rules:
 * - Clear space equal to mark height on all sides
 * - Do not rotate, round beyond 3px, add shadows/gloss, or use playful treatments
 * - Wordmark: Inter/Roboto semibold · high-contrast on slate
 * - Descriptor: inspection teal · uppercase tracking
 */
export function VeriForgeLogo({
  compact = false,
  className,
  markSize = 32,
  markVariant = "default",
  descriptor = "Safety compliance",
}: {
  compact?: boolean;
  className?: string;
  markSize?: number;
  markVariant?: "default" | "outline" | "mono";
  descriptor?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <VeriForgeMark size={markSize} variant={markVariant} />
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              veriforgeTypography.heading,
              "text-sm font-semibold tracking-[0.04em] text-[#F4F6F8]",
            )}
          >
            VeriForge
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#2F8F8C]">
            {descriptor}
          </span>
        </span>
      ) : null}
    </div>
  );
}

/** Stacked lockup for splash / marketing heroes */
export function VeriForgeLogoStacked({
  className,
  markSize = 56,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <div className={cn("inline-flex flex-col items-center gap-3 text-center", className)}>
      <VeriForgeMark size={markSize} />
      <div>
        <p
          className={cn(
            veriforgeTypography.heading,
            "text-lg font-semibold tracking-[0.06em] text-[#F4F6F8]",
          )}
        >
          VeriForge
        </p>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2F8F8C]">
          Verified for absolute safety
        </p>
      </div>
    </div>
  );
}
