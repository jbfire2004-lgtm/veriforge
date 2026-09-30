import type { SafetyBlogPostSummary } from "@vera/api-contract";
import { cn } from "@/src/lib/utils";

const STYLES: Record<SafetyBlogPostSummary["safetyLevel"], string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-amber-100 text-amber-900",
  HIGH: "bg-red-100 text-red-800",
};

export function RiskBadge({
  level,
  className,
}: {
  level: SafetyBlogPostSummary["safetyLevel"];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium uppercase",
        STYLES[level],
        className,
      )}
    >
      {level.toLowerCase()} risk
    </span>
  );
}
