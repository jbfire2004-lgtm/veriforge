import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui";

export function SupervisorDashboardCard({
  title,
  count,
  icon,
}: {
  title: string;
  count: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-vera-charcoal/10 shadow-md">
      <CardHeader className="flex flex-row items-center gap-vera-4 space-y-0">
        {icon != null && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-vera-surface text-2xl">
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-vera-1">
          <CardTitle className="text-lg leading-tight tracking-tight">{title}</CardTitle>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-vera-deep">{count}</p>
        </div>
      </CardHeader>
    </Card>
  );
}
