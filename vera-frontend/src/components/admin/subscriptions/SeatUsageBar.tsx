import { cn } from "@/src/lib/utils";

type Props = {
  used: number;
  purchased: number;
  className?: string;
};

export function SeatUsageBar({ used, purchased, className }: Props) {
  const pct = purchased > 0 ? Math.min(100, Math.round((used / purchased) * 100)) : 0;
  const hot = pct >= 90;
  const warm = pct >= 70 && pct < 90;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs text-vera-muted">
        <span>
          {used} / {purchased}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-vera-charcoal/10">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            hot && "bg-red-500",
            warm && !hot && "bg-amber-500",
            !hot && !warm && "bg-vera-teal",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
