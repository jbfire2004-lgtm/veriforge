"use client";

type Props = {
  completed: number;
  total: number;
  label?: string;
  className?: string;
};

export function OrientationProgressBar({
  completed,
  total,
  label = "Completion",
  className,
}: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[#2A2E33]">{label}</span>
        <span className="text-[#64748b]">
          {completed}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#e2e8f0]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2F8F8C] to-[#3AA39F] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
