import type { BillingCycle } from "../../types/api";
import { PricingSummary } from "../pricing/PricingSummary";
import type { PricingQuote } from "../../types/api";

interface BillingCycleStepProps {
  billingCycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  monthly?: PricingQuote;
  annual?: PricingQuote;
  loading?: boolean;
  error?: string | null;
}

export function BillingCycleStep({
  billingCycle,
  onChange,
  monthly,
  annual,
  loading,
  error,
}: BillingCycleStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-forge-ink">Billing cycle</h2>
        <p className="mt-1 text-forge-steel">
          Choose how you prefer to be billed after the 7-day trial. You won’t be charged until you
          activate.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
          <button
            key={cycle}
            type="button"
            onClick={() => onChange(cycle)}
            className={`rounded-xl border p-4 text-left transition ${
              billingCycle === cycle
                ? "border-forge-moss bg-forge-mist/80 ring-1 ring-forge-moss/30"
                : "border-forge-sand bg-white hover:border-forge-moss/40"
            }`}
          >
            <p className="font-display text-lg font-semibold capitalize text-forge-ink">{cycle}</p>
            <p className="mt-1 text-sm text-forge-steel">
              {cycle === "annual" ? "Best value for committed teams" : "Flexible month-to-month"}
            </p>
          </button>
        ))}
      </div>

      <PricingSummary
        monthly={monthly}
        annual={annual}
        selectedCycle={billingCycle}
        loading={loading}
        error={error}
      />
    </div>
  );
}
