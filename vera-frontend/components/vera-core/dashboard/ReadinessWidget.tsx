import { DashboardCard } from "./DashboardCard";

export type ReadinessWidgetProps = {
  title?: string;
  ready: number;
  total: number;
  href?: string;
};

export function ReadinessWidget({
  title = "Project readiness",
  ready,
  total,
  href,
}: ReadinessWidgetProps) {
  const pct = total > 0 ? Math.round((ready / total) * 100) : 0;
  const tone =
    pct >= 90 ? "success" : pct >= 70 ? "warning" : ("danger" as const);

  return (
    <DashboardCard
      title={title}
      description={`${ready} of ${total} ready`}
      value={`${pct}%`}
      href={href}
      tone={tone}
    />
  );
}


