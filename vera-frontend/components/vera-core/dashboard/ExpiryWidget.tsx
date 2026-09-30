import { DashboardCard } from "./DashboardCard";

export type ExpiryWidgetProps = {
  expired: number;
  expiringSoon: number;
  href?: string;
};

export function ExpiryWidget({ expired, expiringSoon, href }: ExpiryWidgetProps) {
  return (
    <DashboardCard
      title="Training expiry"
      description="Records requiring attention"
      href={href}
      tone={expired > 0 ? "danger" : expiringSoon > 0 ? "warning" : "default"}
    >
      <div className="flex flex-wrap gap-4 text-sm">
        <Stat label="Expired" value={expired} className="bg-red-50 text-red-700" />
        <Stat
          label="Expiring soon"
          value={expiringSoon}
          className="bg-amber-50 text-amber-800"
        />
      </div>
    </DashboardCard>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`rounded-lg px-4 py-3 ${className}`}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}


