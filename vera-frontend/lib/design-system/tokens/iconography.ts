/**
 * Iconography rules (§8) — Lucide (Heroicons-compatible stroke).
 */

export const iconography = {
  set: "lucide-react",
  defaultSize: 24,
  compactSize: 20,
  strokeWidth: 2,
  className: {
    default: "h-6 w-6",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  },
} as const;
