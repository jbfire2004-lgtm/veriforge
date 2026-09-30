import type { BillingCycle, PricingQuote } from "../../types/api";
import { MODULE_META } from "../../types/api";
import { formatCents } from "../../lib/format";

interface PricingSummaryProps {
  monthly?: PricingQuote;
  annual?: PricingQuote;
  selectedCycle: BillingCycle;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
}

export function PricingSummary({
  monthly,
  annual,
  selectedCycle,
  loading,
  error,
  compact,
}: PricingSummaryProps) {
  if (loading) {
    return <p className="text-sm text-forge-steel">Calculating pricing…</p>;
  }
  if (error) {
    return <p className="text-sm text-forge-danger">{error}</p>;
  }
  if (!monthly && !annual) {
    return <p className="text-sm text-forge-steel">Select at least one module to see pricing.</p>;
  }

  const active = selectedCycle === "monthly" ? monthly : annual;
  const discount = annual?.annualDiscountPercent ?? monthly?.annualDiscountPercent ?? 0;

  return (
    <div className={compact ? "space-y-3" : "vf-panel space-y-4 p-5"} data-testid="pricing-preview">
      {!compact && (
        <div>
          <h3 className="font-display text-lg font-semibold text-forge-ink">Pricing preview</h3>
          <p className="text-sm text-forge-steel">
            Live quote from VeriForge · annual includes ~{discount}% vs monthly run-rate
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <PriceCard
          label="Monthly"
          amount={monthly ? formatCents(monthly.monthlyTotalCents, monthly.currency) : "—"}
          selected={selectedCycle === "monthly"}
          suffix="/ mo"
        />
        <PriceCard
          label="Annual"
          amount={annual ? formatCents(annual.annualTotalCents, annual.currency) : "—"}
          selected={selectedCycle === "annual"}
          suffix="/ yr"
        />
      </div>

      {active && (
        <ul className="divide-y divide-forge-sand/80 text-sm">
          {active.lineItems.map((line) => (
            <li key={line.moduleCode} className="flex items-center justify-between py-2">
              <span>{MODULE_META[line.moduleCode].label}</span>
              <span className="font-medium tabular-nums">
                {formatCents(line.lineTotalCents, line.currency)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between py-2 font-semibold">
            <span>Selected total</span>
            <span className="tabular-nums" data-testid="pricing-selected-total">
              {formatCents(active.selectedCycleTotalCents, active.currency)}
              {selectedCycle === "monthly" ? "/mo" : "/yr"}
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}

function PriceCard({
  label,
  amount,
  selected,
  suffix,
}: {
  label: string;
  amount: string;
  selected: boolean;
  suffix: string;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        selected
          ? "border-forge-moss bg-forge-mist/80 ring-1 ring-forge-moss/30"
          : "border-forge-sand bg-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-forge-steel">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums text-forge-ink">
        {amount}
        <span className="ml-1 text-sm font-medium text-forge-steel">{suffix}</span>
      </p>
    </div>
  );
}
