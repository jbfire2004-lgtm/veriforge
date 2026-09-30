import { assessmentStatusTone } from "@/lib/assessment-readiness-display";

const STATUS_STYLES: Record<
  ReturnType<typeof assessmentStatusTone>,
  string
> = {
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-900",
  neutral: "bg-slate-100 text-slate-800",
};

export function AssessmentStatusBadge({ status }: { status: string }) {
  const tone = assessmentStatusTone(status);
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[tone]}`}
    >
      {status}
    </span>
  );
}

export function AssessmentScoreBar({
  label,
  score,
  note,
}: {
  label: string;
  score: number;
  note?: string;
}) {
  const tone =
    score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="text-slate-600">{score}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}
