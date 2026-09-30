import type { HazardLevel } from "@/lib/weather/types";

export const HAZARD_BAR_STYLES: Record<
  HazardLevel,
  { ring: string; dot: string; bg: string }
> = {
  safe: {
    ring: "ring-emerald-400/40",
    dot: "bg-emerald-500",
    bg: "from-emerald-500/10 via-white/70 to-teal-500/5",
  },
  caution: {
    ring: "ring-amber-400/50",
    dot: "bg-amber-500",
    bg: "from-amber-500/12 via-white/70 to-amber-500/5",
  },
  danger: {
    ring: "ring-red-400/50",
    dot: "bg-red-500",
    bg: "from-red-500/12 via-white/70 to-red-500/5",
  },
};

export function hazardTextClass(level: HazardLevel): string {
  switch (level) {
    case "danger":
      return "text-red-700";
    case "caution":
      return "text-amber-800";
    default:
      return "text-emerald-800";
  }
}
