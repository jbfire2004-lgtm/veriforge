"use client";

import { VeriHubConsoleShell } from "@/src/components/verihub/VeriHubConsoleShell";
import { BillingForm } from "@/src/components/forms";
import { BillingSummary, PaymentHistory } from "@/src/components/billing";
import {
  useSubscriptionBilling,
  useSubscriptionModules,
} from "@/lib/veriforge-hooks";

export default function VeriHubBillingPage() {
  const billing = useSubscriptionBilling();
  const modules = useSubscriptionModules();

  return (
    <VeriHubConsoleShell
      title="Billing"
      description="Subscription plan, trial status, and module totals."
    >
      {billing.error ? (
        <p className="mb-4 text-sm text-red-600">{billing.error}</p>
      ) : null}
      <div className="mb-6">
        <BillingSummary billing={billing.data} modules={modules.data} />
      </div>
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
          Update plan
        </h2>
        <BillingForm billing={billing.data} onUpdated={() => billing.reload()} />
      </div>
      <PaymentHistory />
    </VeriHubConsoleShell>
  );
}
