import type { BillingCycle, ModuleCode, PricingQuote } from "../../types/api";
import { MODULE_META } from "../../types/api";
import { formatCents } from "../../lib/format";

interface ConfirmationStepProps {
  companyName: string;
  ownerEmail: string;
  modules: ModuleCode[];
  billingCycle: BillingCycle;
  quote?: PricingQuote;
  trialDays?: number;
  submitting?: boolean;
  error?: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export function ConfirmationStep({
  companyName,
  ownerEmail,
  modules,
  billingCycle,
  quote,
  trialDays = 7,
  submitting,
  error,
  onBack,
  onSubmit,
}: ConfirmationStepProps) {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + trialDays);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-forge-ink">Confirm & start trial</h2>
        <p className="mt-1 text-forge-steel">
          Review your selections. Your {trialDays}-day trial starts immediately on signup.
        </p>
      </div>

      <dl className="vf-panel divide-y divide-forge-sand/80 text-sm">
        <Row label="Company" value={companyName} />
        <Row label="Owner email" value={ownerEmail} />
        <Row
          label="Modules"
          value={modules.map((m) => MODULE_META[m].label).join(", ")}
        />
        <Row label="Billing cycle" value={billingCycle} />
        <Row
          label="Quoted total"
          value={
            quote
              ? `${formatCents(quote.selectedCycleTotalCents, quote.currency)}${
                  billingCycle === "monthly" ? "/mo" : "/yr"
                } after trial`
              : "—"
          }
        />
        <Row
          label="Trial ends"
          value={trialEnd.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        />
      </dl>

      {error && <p className="text-sm text-forge-danger">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="vf-btn-secondary" onClick={onBack} disabled={submitting}>
          Back
        </button>
        <button type="button" className="vf-btn-primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Creating account…" : "Start 7-day trial"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <dt className="text-forge-steel">{label}</dt>
      <dd className="text-right font-medium capitalize text-forge-ink">{value}</dd>
    </div>
  );
}
