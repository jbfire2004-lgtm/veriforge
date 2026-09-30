import { cn } from "@/src/lib/utils";

type Props = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
};

const colClass = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-5",
} as const;

/** Responsive metric/stat row used on PM module dashboards. */
export function PmMetricGrid({ children, columns = 4, className }: Props) {
  return (
    <div className={cn("grid gap-vera-4", colClass[columns], className)}>{children}</div>
  );
}

type MetricProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "warning" | "danger";
};

export function PmMetricCard({ label, value, hint, tone = "default" }: MetricProps) {
  const valueClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "warning"
        ? "text-amber-600"
        : "text-[var(--foreground)]";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-vera-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", valueClass)}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}
