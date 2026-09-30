import type { TrainingItemStatus } from "@/lib/worker-training";
import { trainingStatusLabel } from "@/lib/worker-training";

const STYLES: Record<TrainingItemStatus, string> = {
  valid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  expired: "bg-amber-100 text-amber-900 border-amber-200",
  missing: "bg-red-100 text-red-800 border-red-200",
};

type Props = {
  status: TrainingItemStatus;
  compact?: boolean;
  className?: string;
};

export function TrainingStatusBadge({ status, compact, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${compact ? "text-[10px]" : "text-xs"} ${STYLES[status]} ${className}`}
    >
      {trainingStatusLabel(status)}
    </span>
  );
}
