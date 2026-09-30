import type { SubscriptionMapPin } from "@/lib/admin-subscriptions-api";
import { SeatUsageBar } from "./SeatUsageBar";

type Props = {
  pin: SubscriptionMapPin;
};

export function CompanyTooltip({ pin }: Props) {
  return (
    <div className="min-w-[200px] space-y-2 text-sm">
      <p className="font-semibold text-vera-charcoal">{pin.companyName}</p>
      <p>
        <span className="text-vera-muted">Tier:</span> {pin.tier}
      </p>
      <SeatUsageBar used={pin.seatsUsed} purchased={pin.seatsPurchased} />
      <p>
        <span className="text-vera-muted">Modules:</span>{" "}
        {pin.modulesEnabled.length > 0 ? pin.modulesEnabled.join(", ") : "—"}
      </p>
      <p>
        <span className="text-vera-muted">Renewal:</span>{" "}
        {pin.renewalDate ? new Date(pin.renewalDate).toLocaleDateString() : "—"}
      </p>
      <p>
        <span className="text-vera-muted">Status:</span> {pin.status}
      </p>
    </div>
  );
}
