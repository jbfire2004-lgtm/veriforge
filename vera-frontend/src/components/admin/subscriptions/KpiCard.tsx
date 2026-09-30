import { cn } from "@/src/lib/utils";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "success";
};

export function KpiCard({ label, value, hint, tone = "default" }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm",
        tone === "warning" && "border-amber-200 bg-amber-50/50",
        tone === "success" && "border-teal-200 bg-teal-50/30",
        tone === "default" && "border-vera-charcoal/10",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-vera-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-vera-charcoal">{value}</p>
      {hint ? <p className="mt-1 text-xs text-vera-muted">{hint}</p> : null}
    </div>
  );
}
