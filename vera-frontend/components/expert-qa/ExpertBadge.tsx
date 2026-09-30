import type { ExpertProfile } from "@vera/api-contract";
import { cn } from "@/src/lib/utils";

const BADGE_STYLES: Record<ExpertProfile["badgeLevel"], string> = {
  CONTRIBUTOR: "bg-slate-100 text-slate-700",
  BRONZE: "bg-amber-100 text-amber-900",
  SILVER: "bg-zinc-200 text-zinc-800",
  GOLD: "bg-yellow-100 text-yellow-900",
  PLATINUM: "bg-violet-100 text-violet-900",
};

export function ExpertBadge({
  level,
  verified,
  className,
}: {
  level: ExpertProfile["badgeLevel"];
  verified?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        BADGE_STYLES[level],
        className,
      )}
    >
      {verified ? "✓ " : ""}
      {level.toLowerCase()} expert
    </span>
  );
}
